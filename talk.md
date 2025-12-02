这是一份经过深度优化的**开发实施文档**，不仅包含了针对你最新要求的调整（多源精华提取、前端自由发挥但保持风格），还附带了我对你当前项目设计的**审美审计与优化建议**。

-----

### 🎨 第一部分：设计审计与优化建议 (Design Audit)

在生成指令前，我检查了你的 `globals.css`、`theme_minimalist.css` 和组件代码，以下是针对**动画、颜色、字体**的专业建议，你可以让 Cursor 一并执行优化：

#### 1\. 字体与排版 (Typography)

  * **现状**：使用了 `Geist` 和 `Geist Mono`，这是极好的选择（Vercel 同款）。
  * **优化建议**：
      * **增加 `text-balance`**：在标题（h1, h2）上使用 CSS 属性 `text-wrap: balance;`。这能让多行标题的长度更均衡，阅读体验极佳（Next.js 这里的“极简风”非常依赖排版细节）。
      * **字重层级**：目前的层级较少。建议为摘要或次要信息引入 `font-light` (300)，为核心数字引入 `font-bold` (700)，拉大视觉反差。

#### 2\. 颜色与质感 (Colors & Texture)

  * **现状**：黑白灰为主，橙色/红色为点缀。
  * **优化建议**：
      * **引入微噪点 (Noise Texture)**：为了避免纯色背景过于单调，可以在背景层叠加一个透明度极低的噪点图片，增加“纸质感”或“磨砂感”，这是目前高端极简设计的标配。
      * **玻璃拟态 (Glassmorphism)**：在播放器或悬浮卡片上，使用 `backdrop-blur-md` 配合极细的 `border-white/10`，营造精致的通透感。

#### 3\. 动画 (Animation)

  * **现状**：基础的 Fade-in。
  * **优化建议**：
      * **骨架屏 (Skeleton)**：在数据加载时，不要只用 Spinner，使用与卡片布局一致的灰色闪烁骨架屏（Shimmer Effect），体验更流畅。
      * **微交互**：按钮点击时增加 `active:scale-95`（缩小效果），Hover 时增加 `hover:-translate-y-1`，让界面有“回弹”的触感。

-----

### 🚀 第二部分：给 Cursor 的开发指令文档

你可以直接复制下面的内容给 Cursor。

````markdown
# AI Scent 新模块开发指令：多源精华播客与沉浸式体验

## 0. 给 Cursor 的核心原则 (System Instructions)

**角色**：资深全栈工程师 (Next.js/Supabase) + 交互设计师。
**任务**：在不破坏现有 `ingest.ts` 爬虫管道的基础上，构建一条全新的**播客生成与展示管道**。

**⚠️ 关键要求 (Critical Requirements)**：
1.  **多源精华提取 (Synthesis)**：后端逻辑必须能够处理 3-5 篇关于同一产品的文章，**不仅仅是总结**，而是要提取每篇文章独有的“高光观点”和“深度洞察”，融合成一份高质量文稿。
2.  **前端非破坏性扩展**：
    * **分类页 (`directory`)**：保持现有布局，仅在卡片上增加“播客/拆解”入口。
    * **新增拆解页**：创建一个全新的页面路由 `/product/[slug]/deep-dive`。
    * **设计风格**：在拆解页的设计上，请**自由发挥**你的创意（目标是打造沉浸式的听觉/阅读体验），但必须严格遵守现有的 `Geist` 字体和 `极简黑白灰` 设计系统。

---

## 1. 数据库结构增量更新 (Supabase)

我们需要存储播客音频、文稿以及**多篇文章来源**。请在 `supabase/schema.sql` 追加：

```sql
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
````

-----

## 2\. 后端逻辑：独立的新管道

请创建以下**新文件**，不要修改现有的 `ingest.ts`。

### 2.1 核心分析逻辑 (`scripts/src/analyzer-podcast.ts`)

你需要编写一个高级 Prompt，专门用于**多文综合**。

  * **Prompt 核心逻辑**：
      * 输入：3-5 篇文章的全文。
      * 指令：
        > "你是一位追求极致深度的科技播客主理人。你面前有几篇关于 [产品名] 的深度文章。
        > 请不要简单拼接。你需要做的是\*\*‘沙里淘金’\*\*：
        > 1.  找出每篇文章中**最独特、最有见地**的观点（Unique Insight）。
        > 2.  将这些观点重新编织成一篇逻辑流畅、口语化、且**信息密度极高**的播客文稿。
        > 3.  文稿结构：
        >       * **开场暴击**：直接抛出该产品最反直觉或最核心的价值。
        >       * **深度解析**：融合多篇文章的观点，从技术、商业、用户体验三个维度进行降维打击式的解读。
        >       * **行业预判**：结合文章中的预测，给出你对未来的判断。
        > 4.  语气要求：像是一个内行的老朋友在聊天，用词精准但通俗。"

### 2.2 语音生成逻辑 (`scripts/src/tts-doubao.ts`)

  * 封装豆包 TTS API。
  * 实现 `generateAudio(text: string): Promise<Buffer>`。

### 2.3 管道入口 (`scripts/src/ingest-deep-dive.ts`)

  * 读取配置文件 `deep-dive-tasks.json`（包含产品 Slug 和 3-5 个 URL）。
  * 流程：爬取所有 URL -\> 调用 `analyzer-podcast.ts` 生成文稿 -\> 调用 `tts-doubao.ts` 生成音频 -\> 存入 Supabase (Products 表 & Source\_Articles 表)。

-----

## 3\. 前端实现：沉浸式体验

### 3.1 优化分类页 (`app/directory/page.tsx`)

  * **逻辑**：在渲染 Product Card 时，检查 `product.has_deep_dive`。
  * **UI**：如果为 `true`，在卡片右上角或底部显示一个精致的 **"🎧 深度拆解"** 标签/按钮。点击该按钮跳转至 `/product/[slug]/deep-dive`。
  * **保持**：除此之外，不要改动现有的网格布局和筛选逻辑。

### 3.2 全新拆解页 (`app/product/[slug]/deep-dive/page.tsx`)

这是一个全新的页面，请**自由发挥设计**，但需遵循以下指南：

  * **风格基调**：沉浸、极简、黑胶唱片般的质感。
  * **核心组件**：
    1.  **Hero Player**：页面顶部或中心应该是一个设计感极强的播放器。包含波形图（Visualizer，可以是假的动画）、播放/暂停大按钮、进度条。
    2.  **文稿阅读器**：音频下方提供文稿阅读。支持点击文稿段落跳转音频（可选高级功能）或简单的精美排版。
    3.  **灵感来源 (Sources)**：在一个优雅的侧边栏或底部区域，列出参考的那 3-5 篇文章。展示格式：`文章标题` + `✨ AI 提炼的该文核心金句` + `跳转链接`。
  * **交互细节**：
      * 进入页面时，播放器应该有顺滑的入场动画。
      * 使用 `backdrop-blur` 营造层级感。

-----

## 4\. 视觉体验升级 (Design Polish)

在开发新页面的同时，请优化全局的基础体验：

1.  **排版优化**：在 `globals.css` 中为 `h1, h2, h3` 添加 `text-wrap: balance;`。
2.  **按钮质感**：修改 `components/ui/Button.tsx`，添加 `active:scale-95` 和更细腻的阴影效果。
3.  **加载状态**：在 `app/directory/page.tsx` 中，将 Loading Spinner 替换为与卡片布局匹配的 **Skeleton (骨架屏)** 效果。

-----

## 5\. 执行步骤

1.  运行 SQL 更新数据库。
2.  创建后端脚本 (`analyzer-podcast.ts`, `tts-doubao.ts`, `ingest-deep-dive.ts`)。
3.  创建并设计前端新页面 (`deep-dive/page.tsx`)。
4.  微调现有目录页 (`directory/page.tsx`)。
5.  应用全局视觉优化。

<!-- end list -->

```
```