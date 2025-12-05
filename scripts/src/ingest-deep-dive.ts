#!/usr/bin/env node
// AI Scent 深度拆解摄取脚本
// 用法: npx tsx scripts/src/ingest-deep-dive.ts

import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT_DIR = path.resolve(__dirname, '../..');

// 从项目根目录加载 .env
dotenv.config({ path: path.join(ROOT_DIR, '.env') });

import { crawl } from './crawler.js';
import { generatePodcastTranscript } from './analyzer-podcast.js';
import { generateAudio, checkTTSConfig } from './tts-doubao.js';
import {
  initDB,
  getProductBySlug,
  insertProduct,
  updateProductDeepDive,
  insertSourceArticle
} from './db.js';
import { analyzeProduct } from './analyzer.js';
import type { DeepDiveTask, Product } from './types.js';

// 读取深度拆解任务列表
function loadTasks(): DeepDiveTask[] {
  const tasksPath = path.join(ROOT_DIR, 'deep-dive-tasks.json');
  if (fs.existsSync(tasksPath)) {
    const content = fs.readFileSync(tasksPath, 'utf-8');
    return JSON.parse(content);
  }
  return [];
}

// 处理单个深度拆解任务
async function processTask(task: DeepDiveTask): Promise<void> {
  console.log(`\n🎙️ Processing Deep Dive: ${task.product_slug || task.product_url}`);
  console.log('='.repeat(50));

  try {
    // 1. 爬取产品官网
    console.log('\n📡 Step 1: 爬取产品官网...');
    const productCrawl = await crawl(task.product_url);
    console.log(`  ✓ 标题: ${productCrawl.title}`);

    // 2. 检查产品是否已存在
    let product: Product | null = null;
    let productId: string;

    if (task.product_slug) {
      product = await getProductBySlug(task.product_slug);
    }

    if (!product) {
      // 尝试用 AI 分析生成的 slug 再查一次
      console.log('\n🤖 Step 2: AI 基础分析...');
      const analysis = await analyzeProduct(productCrawl);
      console.log(`  ✓ 名称: ${analysis.name}`);
      console.log(`  ✓ AI生成Slug: ${analysis.slug}`);

      // 再次检查 AI 生成的 slug 是否已存在
      product = await getProductBySlug(analysis.slug);

      if (product) {
        // 产品已存在（用AI生成的slug找到了）
        productId = product.id!;
        task.product_slug = analysis.slug; // 更新为实际的slug
        console.log(`  ✓ 产品已存在 (通过AI slug找到): ${product.name}`);
      } else {
        // 真的是新产品：创建它
        // 优先使用 task 中指定的 slug（如果有的话）
        const finalSlug = task.product_slug || analysis.slug;
        console.log(`  ✓ 使用Slug: ${finalSlug}`);

        const newProduct = await insertProduct({
          slug: finalSlug,
          name: analysis.name,
          tagline: analysis.tagline,
          website_url: task.product_url,
          logo_url: productCrawl.metadata.favicon || productCrawl.metadata.ogImage,
          screenshot_url: undefined,
          category: task.category || analysis.category,
          tags: task.tags && task.tags.length > 0 ? task.tags : analysis.tags,
          ai_analysis: analysis.ai_analysis,
          status: 'draft'
        });
        productId = newProduct.id!;
        task.product_slug = finalSlug;
        console.log(`  ✓ 产品已创建: ${newProduct.slug}`);
      }
    } else {
      productId = product.id!;
      console.log(`\n✓ Step 2: 产品已存在: ${product.name}`);
    }

    // 3. 爬取参考文章
    console.log(`\n📚 Step 3: 爬取 ${task.source_urls.length} 篇参考文章...`);
    const articleCrawls = [];
    for (let i = 0; i < task.source_urls.length; i++) {
      const url = task.source_urls[i];
      console.log(`  [${i + 1}/${task.source_urls.length}] ${url.slice(0, 60)}...`);
      try {
        const result = await crawl(url);
        articleCrawls.push(result);
        console.log(`    ✓ ${result.title.slice(0, 40)}...`);
      } catch (err) {
        console.log(`    ⚠️ 爬取失败: ${err instanceof Error ? err.message : err}`);
      }
    }

    if (articleCrawls.length === 0) {
      throw new Error('没有成功爬取任何参考文章');
    }

    // 4. 生成播客文稿
    console.log('\n🎙️ Step 4: 生成播客文稿 (多源精华提取)...');
    const podcastResult = await generatePodcastTranscript(productCrawl, articleCrawls);
    console.log(`  ✓ 文稿生成完成 (${podcastResult.transcript.length} 字符)`);
    console.log(`  ✓ 提取了 ${podcastResult.articleInsights.length} 篇文章的核心洞察`);

    // 5. 生成播客音频
    console.log('\n🔊 Step 5: 生成播客音频...');
    const ttsConfig = checkTTSConfig();
    console.log(`  ℹ️ TTS 模式: ${ttsConfig.mode}`);
    const audioResult = await generateAudio(podcastResult.transcript, task.product_slug!);
    console.log(`  ✓ 音频 URL: ${audioResult.url}`);
    console.log(`  ✓ 预估时长: ${Math.floor(audioResult.duration / 60)}分${audioResult.duration % 60}秒`);

    // 6. 保存来源文章到数据库
    console.log('\n💾 Step 6: 保存数据到数据库...');
    for (const insight of podcastResult.articleInsights) {
      try {
        await insertSourceArticle({
          product_id: productId,
          url: insight.url,
          title: insight.title,
          source_name: insight.sourceName,
          key_insight: insight.keyInsight
        });
        console.log(`  ✓ 保存来源: ${insight.title.slice(0, 30)}...`);
      } catch (err) {
        // 可能是重复插入，忽略
        console.log(`  ⚠️ 来源已存在或保存失败: ${insight.url.slice(0, 40)}...`);
      }
    }

    // 7. 更新产品的深度拆解字段
    await updateProductDeepDive(task.product_slug!, {
      podcast_audio_url: audioResult.url,
      podcast_transcript: podcastResult.transcript,
      podcast_duration: audioResult.duration,
      has_deep_dive: true
    });
    console.log(`  ✓ 产品深度拆解字段已更新`);

    console.log('\n' + '='.repeat(50));
    console.log(`✅ 深度拆解完成: ${task.product_slug}`);

  } catch (error) {
    console.error(`\n❌ Error: ${error instanceof Error ? error.message : error}`);
  }
}

// 主函数
async function main() {
  console.log('🎙️ AI Scent Deep Dive Ingestion Script');
  console.log('======================================\n');

  // 检查环境变量
  const requiredEnvVars = ['SUPABASE_URL', 'SUPABASE_SERVICE_KEY', 'DASHSCOPE_API_KEY'];
  const missing = requiredEnvVars.filter(v => !process.env[v]);

  if (missing.length > 0) {
    console.error(`❌ Missing environment variables: ${missing.join(', ')}`);
    console.error('Please create a .env file in the project root.');
    process.exit(1);
  }

  // 检查 TTS 配置
  const ttsConfig = checkTTSConfig();
  console.log(`ℹ️ TTS Mode: ${ttsConfig.mode}${ttsConfig.mode === 'mock' ? ' (配置 COZE_API_KEY 启用真实语音)' : ''}`);

  // 初始化数据库
  initDB();
  console.log('✓ Database connected');

  // 加载任务列表
  const tasks = loadTasks();

  if (tasks.length === 0) {
    console.log('\n⚠️ No tasks to process.');
    console.log('Create a deep-dive-tasks.json file in the project root.');
    console.log('\nExample deep-dive-tasks.json:');
    console.log(JSON.stringify([
      {
        product_slug: 'cursor',
        product_url: 'https://cursor.sh',
        source_urls: [
          'https://mp.weixin.qq.com/s/xxx',
          'https://36kr.com/p/xxx'
        ],
        category: '代码',
        tags: ['AI编程', 'IDE']
      }
    ], null, 2));
    return;
  }

  console.log(`📋 Found ${tasks.length} task(s) to process`);

  // 逐个处理任务
  for (const task of tasks) {
    await processTask(task);
  }

  console.log('\n======================================');
  console.log('✨ Deep Dive Ingestion complete!');
}

main().catch(console.error);
