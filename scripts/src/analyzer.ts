// LLM 分析模块 - 使用阿里云 DashScope (通义千问)
import type { CrawlResult, AIAnalysis, Feature, UseCase, FAQ, Alternative } from './types.js';

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

const SYSTEM_PROMPT = `你是一个专业的 AI 产品分析专家，擅长深度拆解 AI 产品并提供结构化、详细的分析报告。

请根据提供的产品网页内容，输出以下 JSON 格式的详细分析结果：

{
  "name": "产品名称",
  "tagline": "一句话介绍 (简洁有力，10-20字)",
  "slug": "url-friendly-name (小写字母、数字、连字符)",
  "category": "产品主分类 (文本/图像/视频/音频/代码/数据/设计/效率/综合)",
  "tags": ["标签1", "标签2", "标签3"],

  "what_is": "详细介绍这个产品是什么，2-3段话，包括产品背景、核心价值、技术特点等。每段用换行符分隔。",

  "design_philosophy": "产品的设计思路和核心理念 (2-3句话)",

  "target_users": ["目标用户群体1", "目标用户群体2", "目标用户群体3"],

  "features": [
    {
      "title": "功能名称",
      "description": "功能详细描述，30-50字",
      "icon": "适合的emoji图标"
    }
  ],

  "use_cases": [
    {
      "title": "使用场景标题",
      "description": "场景详细描述，说明谁在什么情况下如何使用"
    }
  ],

  "pricing_model": "免费/免费增值/订阅制/一次性付费/按量付费",
  "pricing_details": "定价详情说明，如有具体价格可列出",

  "strengths": ["产品优势1", "产品优势2", "产品优势3"],
  "weaknesses": ["潜在不足1", "潜在不足2"],

  "faqs": [
    {
      "question": "用户可能会问的问题？",
      "answer": "详细的回答"
    }
  ],

  "alternatives": [
    {
      "name": "竞品名称",
      "description": "竞品简介和与本产品的对比"
    }
  ]
}

要求：
1. 分析要客观、专业、详细
2. features 至少提供 4-6 个核心功能
3. use_cases 至少提供 3-5 个使用场景
4. faqs 至少提供 3-5 个常见问题
5. alternatives 至少提供 2-4 个竞品
6. 面向学生群体，考虑学习、作业、创作等场景
7. 只输出 JSON，不要有其他内容`;

export interface AnalysisResult {
  name: string;
  tagline: string;
  slug: string;
  category: string;
  tags: string[];
  ai_analysis: AIAnalysis;
}

export async function analyzeProduct(crawlResult: CrawlResult): Promise<AnalysisResult> {
  const { apiKey, model, baseUrl } = getAPIConfig();

  const userPrompt = `请深度分析以下 AI 产品，提供详细的结构化拆解:

URL: ${crawlResult.url}
标题: ${crawlResult.title}
描述: ${crawlResult.metadata.description || '无'}

页面内容:
${crawlResult.text.slice(0, 12000)}`;

  const response = await fetch(`${baseUrl}/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model,
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: userPrompt }
      ],
      temperature: 0.3,
      response_format: { type: 'json_object' }
    })
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`DashScope API error: ${error}`);
  }

  const result = await response.json();
  const content = result.choices[0]?.message?.content;

  if (!content) {
    throw new Error('No content in DashScope response');
  }

  const analysis = JSON.parse(content);

  return {
    name: analysis.name,
    tagline: analysis.tagline,
    slug: analysis.slug,
    category: analysis.category,
    tags: analysis.tags || [],
    ai_analysis: {
      what_is: analysis.what_is,
      design_philosophy: analysis.design_philosophy,
      target_users: analysis.target_users || [],
      features: analysis.features || [],
      use_cases: analysis.use_cases || [],
      pricing_model: analysis.pricing_model,
      pricing_details: analysis.pricing_details,
      strengths: analysis.strengths || [],
      weaknesses: analysis.weaknesses || [],
      faqs: analysis.faqs || [],
      alternatives: analysis.alternatives || []
    }
  };
}

// 分析评价内容并生成摘要
export async function summarizeReview(
  reviewUrl: string,
  reviewContent: string
): Promise<{ summary: string; sentiment: 'positive' | 'neutral' | 'negative' }> {
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
        {
          role: 'system',
          content: `总结这篇评价的核心观点，输出 JSON:
{
  "summary": "1-2句话的摘要",
  "sentiment": "positive/neutral/negative"
}`
        },
        {
          role: 'user',
          content: `URL: ${reviewUrl}\n\n内容:\n${reviewContent.slice(0, 4000)}`
        }
      ],
      temperature: 0.3,
      response_format: { type: 'json_object' }
    })
  });

  if (!response.ok) {
    throw new Error(`DashScope API error: ${response.statusText}`);
  }

  const result = await response.json();
  return JSON.parse(result.choices[0]?.message?.content || '{}');
}
