-- ==========================================
-- 增量更新：播客深度拆解模块 (v2.0)
-- 只需执行此文件即可添加深度拆解功能
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
  source_name VARCHAR(100),
  key_insight TEXT,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(product_id, url)
);

-- 3. 创建索引
CREATE INDEX IF NOT EXISTS idx_source_articles_product_id ON source_articles(product_id);
