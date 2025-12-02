// 类型定义

export interface Product {
  id?: string;
  slug: string;
  name: string;
  tagline?: string;
  description?: string;
  logo_url?: string;
  website_url: string;
  screenshot_url?: string;
  category?: string;
  tags?: string[];
  ai_analysis: AIAnalysis;
  status: 'draft' | 'published' | 'archived';
  created_at?: string;
  updated_at?: string;
}

// 功能模块
export interface Feature {
  title: string;
  description: string;
  icon?: string; // emoji 或 icon 名称
}

// 使用场景
export interface UseCase {
  title: string;
  description: string;
}

// 常见问题
export interface FAQ {
  question: string;
  answer: string;
}

// 替代方案/竞品
export interface Alternative {
  name: string;
  description: string;
  url?: string;
}

// AI 分析结果 - 丰富版
export interface AIAnalysis {
  // 基础信息
  what_is: string;              // 什么是XX？详细介绍 (2-3段)
  design_philosophy: string;    // 设计理念

  // 目标用户
  target_users: string[];

  // 主要功能 (带描述)
  features: Feature[];

  // 使用场景 (带描述)
  use_cases: UseCase[];

  // 定价模式
  pricing_model: string;
  pricing_details?: string;     // 定价详情说明

  // 优劣势
  strengths: string[];
  weaknesses: string[];

  // 常见问题
  faqs: FAQ[];

  // 替代方案
  alternatives: Alternative[];
}

export interface Review {
  id?: string;
  product_id: string;
  source: string;
  source_url: string;
  title?: string;
  author?: string;
  ai_summary?: string;
  sentiment?: 'positive' | 'neutral' | 'negative';
  published_at?: string;
  created_at?: string;
}

export interface CrawlResult {
  url: string;
  title: string;
  html: string;
  text: string;
  screenshot?: string; // base64 或 URL
  metadata: {
    description?: string;
    ogImage?: string;
    favicon?: string;
  };
}

export interface IngestConfig {
  url: string;
  category?: string;
  tags?: string[];
}
