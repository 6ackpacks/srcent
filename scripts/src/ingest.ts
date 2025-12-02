#!/usr/bin/env node
// AI Scent 数据录入脚本
// 用法: npm run ingest

import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT_DIR = path.resolve(__dirname, '../..');

// 从项目根目录加载 .env
dotenv.config({ path: path.join(ROOT_DIR, '.env') });

import { crawl } from './crawler.js';
import { analyzeProduct } from './analyzer.js';
import { initDB, insertProduct, getProductBySlug, uploadScreenshot } from './db.js';
import type { IngestConfig, Product } from './types.js';

// 读取待处理的 URL 列表
function loadUrls(): IngestConfig[] {
  // 优先读取 pending.json
  const pendingPath = path.join(ROOT_DIR, 'pending.json');
  if (fs.existsSync(pendingPath)) {
    const content = fs.readFileSync(pendingPath, 'utf-8');
    return JSON.parse(content);
  }

  // 备选读取 urls.txt
  const urlsPath = path.join(ROOT_DIR, 'urls.txt');
  if (fs.existsSync(urlsPath)) {
    const content = fs.readFileSync(urlsPath, 'utf-8');
    return content
      .split('\n')
      .map(line => line.trim())
      .filter(line => line && !line.startsWith('#'))
      .map(url => ({ url }));
  }

  return [];
}

// 处理单个 URL
async function processUrl(config: IngestConfig): Promise<void> {
  const { url, category, tags } = config;

  console.log(`\n🔍 Processing: ${url}`);

  try {
    // 1. 爬取网页
    console.log('  📡 Crawling...');
    const crawlResult = await crawl(url);
    console.log(`  ✓ Title: ${crawlResult.title}`);

    // 2. AI 分析
    console.log('  🤖 Analyzing with AI...');
    const analysis = await analyzeProduct(crawlResult);
    console.log(`  ✓ Name: ${analysis.name}`);
    console.log(`  ✓ Category: ${analysis.category}`);

    // 3. 检查是否已存在
    const existing = await getProductBySlug(analysis.slug);
    if (existing) {
      console.log(`  ⚠️  Product "${analysis.slug}" already exists, skipping...`);
      return;
    }

    // 4. 上传截图 (如果有)
    let screenshotUrl: string | undefined;
    if (crawlResult.screenshot) {
      console.log('  📸 Uploading screenshot...');
      try {
        // 如果是 base64，转换为 Buffer
        if (crawlResult.screenshot.startsWith('data:')) {
          const base64Data = crawlResult.screenshot.split(',')[1];
          const buffer = Buffer.from(base64Data, 'base64');
          screenshotUrl = await uploadScreenshot(analysis.slug, buffer);
        } else {
          // 已经是 URL
          screenshotUrl = crawlResult.screenshot;
        }
        console.log('  ✓ Screenshot uploaded');
      } catch (err) {
        console.log('  ⚠️  Screenshot upload failed, continuing...');
      }
    }

    // 5. 插入数据库
    console.log('  💾 Saving to database...');
    const product: Omit<Product, 'id' | 'created_at' | 'updated_at'> = {
      slug: analysis.slug,
      name: analysis.name,
      tagline: analysis.tagline,
      website_url: url,
      logo_url: crawlResult.metadata.favicon || crawlResult.metadata.ogImage,
      screenshot_url: screenshotUrl,
      category: category || analysis.category,
      tags: tags && tags.length > 0 ? tags : analysis.tags,
      ai_analysis: analysis.ai_analysis,
      status: 'draft'
    };

    const inserted = await insertProduct(product);
    console.log(`  ✅ Success: [${inserted.name}] inserted with slug "${inserted.slug}"`);

  } catch (error) {
    console.error(`  ❌ Error: ${error instanceof Error ? error.message : error}`);
  }
}

// 主函数
async function main() {
  console.log('🚀 AI Scent Data Ingestion Script');
  console.log('==================================\n');

  // 检查环境变量
  const requiredEnvVars = ['SUPABASE_URL', 'SUPABASE_SERVICE_KEY', 'DASHSCOPE_API_KEY'];
  const missing = requiredEnvVars.filter(v => !process.env[v]);

  if (missing.length > 0) {
    console.error(`❌ Missing environment variables: ${missing.join(', ')}`);
    console.error('Please create a .env file in the project root.');
    process.exit(1);
  }

  // 初始化数据库
  initDB();
  console.log('✓ Database connected');

  // 加载 URL 列表
  const urls = loadUrls();

  if (urls.length === 0) {
    console.log('\n⚠️  No URLs to process.');
    console.log('Create a urls.txt or pending.json file in the project root.');
    console.log('\nExample urls.txt:');
    console.log('  https://midjourney.com');
    console.log('  https://claude.ai');
    console.log('\nExample pending.json:');
    console.log('  [{ "url": "https://midjourney.com", "category": "图像" }]');
    return;
  }

  console.log(`📋 Found ${urls.length} URL(s) to process`);

  // 逐个处理
  for (const config of urls) {
    await processUrl(config);
  }

  console.log('\n==================================');
  console.log('✨ Ingestion complete!');
}

main().catch(console.error);
