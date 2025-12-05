-- AI Scent 数据库 Schema
-- 在 Supabase SQL Editor 中执行此文件

-- ============================================
-- 1. Products 表 - 产品基础信息
-- ============================================
CREATE TABLE IF NOT EXISTS products (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  slug VARCHAR(255) UNIQUE NOT NULL,           -- URL 友好的标识符 (如 "midjourney")
  name VARCHAR(255) NOT NULL,                   -- 产品名称
  tagline VARCHAR(500),                         -- 一句话介绍
  description TEXT,                             -- 详细描述
  logo_url VARCHAR(500),                        -- Logo 图片 URL
  website_url VARCHAR(500),                     -- 官网链接
  screenshot_url VARCHAR(500),                  -- 产品截图 URL

  -- 分类与标签
  category VARCHAR(100),                        -- 主分类 (文本、图像、视频、代码等)
  tags TEXT[],                                  -- 标签数组 (写作业、做设计等)

  -- AI 深度拆解 (核心字段)
  ai_analysis JSONB DEFAULT '{}'::jsonb,        -- AI 分析结果
  /*
    ai_analysis 结构示例:
    {
      "design_philosophy": "设计思路描述...",
      "target_users": ["学生", "设计师", "内容创作者"],
      "core_features": ["功能1", "功能2", "功能3"],
      "pricing_model": "免费增值/订阅制/一次性付费",
      "strengths": ["优势1", "优势2"],
      "weaknesses": ["劣势1", "劣势2"],
      "use_cases": ["场景1", "场景2"],
      "alternatives": ["竞品1", "竞品2"]
    }
  */

  -- 元数据
  status VARCHAR(20) DEFAULT 'draft',           -- draft | published | archived
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 创建索引
CREATE INDEX IF NOT EXISTS idx_products_slug ON products(slug);
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);
CREATE INDEX IF NOT EXISTS idx_products_status ON products(status);
CREATE INDEX IF NOT EXISTS idx_products_created_at ON products(created_at DESC);

-- ============================================
-- 2. Reviews 表 - 第三方评价
-- ============================================
CREATE TABLE IF NOT EXISTS reviews (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,

  source VARCHAR(100) NOT NULL,                 -- 来源平台 (bilibili, youtube, twitter, etc.)
  source_url VARCHAR(500) NOT NULL,             -- 原文链接
  title VARCHAR(500),                           -- 评价标题
  author VARCHAR(255),                          -- 作者名称

  ai_summary TEXT,                              -- AI 生成的摘要
  sentiment VARCHAR(20),                        -- positive | neutral | negative

  published_at TIMESTAMPTZ,                     -- 原文发布时间
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 创建索引
CREATE INDEX IF NOT EXISTS idx_reviews_product_id ON reviews(product_id);
CREATE INDEX IF NOT EXISTS idx_reviews_source ON reviews(source);

-- ============================================
-- 3. Daily_Issues 表 - 每日期刊
-- ============================================
CREATE TABLE IF NOT EXISTS daily_issues (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  issue_number INT UNIQUE NOT NULL,             -- 期号 (1, 2, 3...)
  title VARCHAR(255) NOT NULL,                  -- 期刊标题 (如 "论文神器特辑")
  description TEXT,                             -- 期刊描述

  publish_date DATE UNIQUE NOT NULL,            -- 发布日期
  status VARCHAR(20) DEFAULT 'draft',           -- draft | published

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 创建索引
CREATE INDEX IF NOT EXISTS idx_daily_issues_publish_date ON daily_issues(publish_date DESC);
CREATE INDEX IF NOT EXISTS idx_daily_issues_status ON daily_issues(status);

-- ============================================
-- 4. Daily_Items 表 - 期刊与产品关联
-- ============================================
CREATE TABLE IF NOT EXISTS daily_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  issue_id UUID REFERENCES daily_issues(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,

  position INT DEFAULT 0,                       -- 排序位置
  is_featured BOOLEAN DEFAULT FALSE,            -- 是否为主推产品
  recommendation TEXT,                          -- 编辑推荐语

  created_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(issue_id, product_id)                  -- 同一期不能重复推荐同一产品
);

-- 创建索引
CREATE INDEX IF NOT EXISTS idx_daily_items_issue_id ON daily_items(issue_id);
CREATE INDEX IF NOT EXISTS idx_daily_items_product_id ON daily_items(product_id);

-- ============================================
-- 5. Subscribers 表 - 邮件订阅
-- ============================================
CREATE TABLE IF NOT EXISTS subscribers (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,

  status VARCHAR(20) DEFAULT 'active',          -- active | unsubscribed
  subscribed_at TIMESTAMPTZ DEFAULT NOW(),
  unsubscribed_at TIMESTAMPTZ
);

-- 创建索引
CREATE INDEX IF NOT EXISTS idx_subscribers_email ON subscribers(email);
CREATE INDEX IF NOT EXISTS idx_subscribers_status ON subscribers(status);

-- ============================================
-- 触发器: 自动更新 updated_at
-- ============================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_products_updated_at
  BEFORE UPDATE ON products
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_daily_issues_updated_at
  BEFORE UPDATE ON daily_issues
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- RLS (Row Level Security) 策略
-- 根据需要启用，这里先注释掉
-- ============================================
-- ALTER TABLE products ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE daily_issues ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE daily_items ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE subscribers ENABLE ROW LEVEL SECURITY;

-- 允许匿名读取已发布的内容
-- CREATE POLICY "Public can read published products" ON products
--   FOR SELECT USING (status = 'published');

-- ==========================================
-- 增量更新：播客深度拆解模块 (v2.0)
-- ==========================================

-- 1. 修改 Products 表：增加播客字段
DO $$
BEGIN
    -- 播客音频文件 URL
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'products' AND column_name = 'podcast_audio_url') THEN
        ALTER TABLE products ADD COLUMN podcast_audio_url VARCHAR(500);
    END IF;
    -- 播客完整文稿 (Markdown格式)
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'products' AND column_name = 'podcast_transcript') THEN
        ALTER TABLE products ADD COLUMN podcast_transcript TEXT;
    END IF;
    -- 播客时长 (秒)
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'products' AND column_name = 'podcast_duration') THEN
        ALTER TABLE products ADD COLUMN podcast_duration INT;
    END IF;
    -- 标记是否已生成深度拆解
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'products' AND column_name = 'has_deep_dive') THEN
        ALTER TABLE products ADD COLUMN has_deep_dive BOOLEAN DEFAULT FALSE;
    END IF;
END $$;

-- 2. 新增 Source_Articles 表：存储用于合成播客的多篇文章
CREATE TABLE IF NOT EXISTS source_articles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  product_id UUID REFERENCES products(id) ON DELETE CASCADE NOT NULL,

  url VARCHAR(500) NOT NULL,
  title VARCHAR(500),
  source_name VARCHAR(100), -- 例如 "微信公众号", "36Kr"
  key_insight TEXT,         -- [AI提取] 这篇文章最独特的一个观点

  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(product_id, url)
);

CREATE INDEX IF NOT EXISTS idx_source_articles_product_id ON source_articles(product_id);
