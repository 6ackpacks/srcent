// 播客文稿生成模块 - 多源精华提取与综合
// 独立于现有 analyzer.ts，专门处理深度拆解任务

import type { CrawlResult } from './types.js';

// 获取 API 配置
function getAPIConfig() {
  const apiKey = process.env.DASHSCOPE_API_KEY;
  const model = process.env.DASHSCOPE_MODEL || 'qwen-max';
  const baseUrl = process.env.DASHSCOPE_BASE_URL || 'https://dashscope.aliyuncs.com/compatible-mode/v1';

  if (!apiKey) {
    throw new Error('Missing DASHSCOPE_API_KEY environment variable');
  }

  return { apiKey, model, baseUrl };
}

// 多文综合 Prompt - 核心
const SYSTEM_PROMPT_PODCAST = `你是一位追求极致深度的科技播客主理人。你面前有几篇关于某产品的深度文章。

请不要简单拼接。你需要做的是**'沙里淘金'**：

1. 找出每篇文章中**最独特、最有见地**的观点（Unique Insight）。
2. 将这些观点重新编织成一篇逻辑流畅、口语化、且**信息密度极高**的播客文稿。

文稿结构：

# [产品名称]：[一句话核心价值]

## 开场暴击
直接抛出该产品最反直觉或最核心的价值点。用一两句话抓住听众的注意力。

## 深度解析
融合多篇文章的观点，从以下三个维度进行降维打击式的解读：
- **技术维度**：它用了什么独特的技术方案？
- **商业维度**：它的商业模式和增长策略是什么？
- **用户体验**：它如何改变用户的工作流程？

## 行业预判
结合文章中的预测和你的判断，给出对未来发展的洞察。

## 金句总结
用一句话总结这个产品的核心价值，便于传播。

注意：
1. 语气要像一个内行的老朋友在聊天，用词精准但通俗
2. 总字数控制在 800-1200 字
3. 必须基于提供的上下文内容进行归纳，不要编造
4. 输出纯 Markdown 格式，不要输出 JSON`;

// 单文洞察提取 Prompt
const SYSTEM_PROMPT_INSIGHT = `你是一位专业的内容分析师。请从这篇文章中提取最独特、最有见地的一个核心观点。

要求：
1. 这个观点应该是这篇文章独有的，不是泛泛而谈
2. 用一句话概括（30-50字）
3. 只输出这一句话，不要其他内容`;

export interface ArticleInsight {
  url: string;
  title: string;
  sourceName: string;
  keyInsight: string;
  content: string;
}

export interface PodcastAnalysisResult {
  transcript: string;           // 播客文稿 (Markdown)
  articleInsights: ArticleInsight[];  // 各文章的核心洞察
}

/**
 * 从单篇文章提取核心洞察
 */
export async function extractInsight(crawlResult: CrawlResult): Promise<string> {
  const { apiKey, model, baseUrl } = getAPIConfig();

  const response = await fetch(`${baseUrl}/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model,
      messages: [
        { role: 'system', content: SYSTEM_PROMPT_INSIGHT },
        { role: 'user', content: `文章标题: ${crawlResult.title}\n\n文章内容:\n${crawlResult.text.slice(0, 8000)}` }
      ],
      temperature: 0.3,
      max_tokens: 200
    })
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`DashScope API error: ${error}`);
  }

  const result = await response.json();
  return result.choices[0]?.message?.content || '';
}

/**
 * 从来源 URL 推断来源名称
 */
function inferSourceName(url: string): string {
  try {
    const hostname = new URL(url).hostname;
    if (hostname.includes('mp.weixin.qq.com')) return '微信公众号';
    if (hostname.includes('36kr.com')) return '36Kr';
    if (hostname.includes('zhihu.com')) return '知乎';
    if (hostname.includes('juejin.cn')) return '掘金';
    if (hostname.includes('medium.com')) return 'Medium';
    if (hostname.includes('sspai.com')) return '少数派';
    if (hostname.includes('geekpark.net')) return '极客公园';
    return hostname.replace('www.', '');
  } catch {
    return '未知来源';
  }
}

/**
 * 综合多篇文章生成播客文稿
 * @param productCrawl 产品官网爬取结果
 * @param articleCrawls 参考文章爬取结果数组
 * @returns 播客分析结果
 */
export async function generatePodcastTranscript(
  productCrawl: CrawlResult,
  articleCrawls: CrawlResult[]
): Promise<PodcastAnalysisResult> {
  const { apiKey, model, baseUrl } = getAPIConfig();

  // 1. 并行提取各文章的核心洞察
  console.log('  📝 提取各文章核心洞察...');
  const insightPromises = articleCrawls.map(async (crawl) => {
    const insight = await extractInsight(crawl);
    return {
      url: crawl.url,
      title: crawl.title,
      sourceName: inferSourceName(crawl.url),
      keyInsight: insight,
      content: crawl.text
    } as ArticleInsight;
  });

  const articleInsights = await Promise.all(insightPromises);

  // 2. 构建综合 Prompt
  const combinedContent = `
## 产品官网信息
URL: ${productCrawl.url}
标题: ${productCrawl.title}
描述: ${productCrawl.metadata.description || '无'}

官网内容:
${productCrawl.text.slice(0, 6000)}

---

## 参考文章

${articleInsights.map((article, i) => `
### 文章 ${i + 1}: ${article.title}
来源: ${article.sourceName}
核心洞察: ${article.keyInsight}

内容摘要:
${article.content.slice(0, 4000)}
`).join('\n---\n')}
`;

  // 3. 调用 LLM 生成播客文稿
  console.log('  🎙️ 生成播客文稿...');
  const response = await fetch(`${baseUrl}/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model,
      messages: [
        { role: 'system', content: SYSTEM_PROMPT_PODCAST },
        { role: 'user', content: `请基于以下内容，撰写一篇深度播客文稿:\n\n${combinedContent}` }
      ],
      temperature: 0.7,
      max_tokens: 3000
    })
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`DashScope API error: ${error}`);
  }

  const result = await response.json();
  const transcript = result.choices[0]?.message?.content;

  if (!transcript) {
    throw new Error('No transcript generated from DashScope');
  }

  return {
    transcript,
    articleInsights
  };
}
