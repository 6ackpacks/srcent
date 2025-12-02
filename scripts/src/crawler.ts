// 爬虫模块 - 使用 Firecrawl 或 Playwright
import type { CrawlResult } from './types.js';

// Firecrawl 客户端 (需要 API Key)
// 如果没有 Firecrawl，可以使用下面的 Playwright 实现

export async function crawlWithFirecrawl(url: string): Promise<CrawlResult> {
  const apiKey = process.env.FIRECRAWL_API_KEY;

  if (!apiKey) {
    throw new Error('Missing FIRECRAWL_API_KEY environment variable');
  }

  const response = await fetch('https://api.firecrawl.dev/v1/scrape', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      url,
      formats: ['markdown', 'html'],
      onlyMainContent: true
      // 注意: v1 API 不支持 screenshot 参数
    })
  });

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(`Firecrawl API error: ${response.status} ${response.statusText} - ${errorBody}`);
  }

  const result = await response.json();

  return {
    url,
    title: result.data?.metadata?.title || '',
    html: result.data?.html || '',
    text: result.data?.markdown || '',
    screenshot: result.data?.screenshot,
    metadata: {
      description: result.data?.metadata?.description,
      ogImage: result.data?.metadata?.ogImage,
      favicon: result.data?.metadata?.favicon
    }
  };
}

// 备选: 使用 Playwright (本地浏览器)
export async function crawlWithPlaywright(url: string): Promise<CrawlResult> {
  // 动态导入 Playwright，避免在没有安装时报错
  const { chromium } = await import('playwright');

  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  try {
    // 使用 domcontentloaded 而不是 networkidle，更快更稳定
    await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 60000 });

    // 额外等待一小段时间让 JS 执行
    await page.waitForTimeout(3000);

    // 获取页面信息
    const title = await page.title();
    const html = await page.content();
    const text = await page.evaluate(() => document.body.innerText);

    // 获取 meta 信息
    const metadata = await page.evaluate(() => {
      const getMeta = (name: string) => {
        const el = document.querySelector(`meta[name="${name}"], meta[property="${name}"]`);
        return el?.getAttribute('content') || undefined;
      };

      const favicon = document.querySelector('link[rel="icon"], link[rel="shortcut icon"]');

      return {
        description: getMeta('description') || getMeta('og:description'),
        ogImage: getMeta('og:image'),
        favicon: favicon?.getAttribute('href') || undefined
      };
    });

    // 截图
    const screenshotBuffer = await page.screenshot({
      type: 'png',
      fullPage: false
    });
    const screenshot = `data:image/png;base64,${screenshotBuffer.toString('base64')}`;

    return {
      url,
      title,
      html,
      text,
      screenshot,
      metadata
    };
  } finally {
    await browser.close();
  }
}

// 统一的爬虫接口
export async function crawl(url: string): Promise<CrawlResult> {
  // 优先使用 Firecrawl (更稳定，有反爬处理)
  if (process.env.FIRECRAWL_API_KEY) {
    console.log('📡 Using Firecrawl...');
    try {
      return await crawlWithFirecrawl(url);
    } catch (error) {
      console.log(`  ⚠️  Firecrawl failed: ${error instanceof Error ? error.message : error}`);
      console.log('  🎭 Falling back to Playwright...');
    }
  }

  // 备选使用 Playwright
  console.log('🎭 Using Playwright...');
  return crawlWithPlaywright(url);
}
