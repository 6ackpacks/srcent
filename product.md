

# 📘 AI Scent 产品开发实战文档 (v1.0)

## 1. 项目概况
*   **产品名称：** AI Scent 
*   **核心价值：** 面向学生的 AI 认知提升与产品发现平台。
*   **核心功能：** AI 产品深度拆解、第三方评价聚合、每日主题式推荐（Newsletter）。
*   **开发策略：** 本地脚本处理数据（ETL） + Next.js 展示前端 + Supabase 存储。

## 2. 技术栈架构
*   **前端 (Web):** Next.js 14 (App Router), React, Tailwind CSS, ShadcnUI.
*   **后端/数据库:** Supabase (PostgreSQL, Auth, Storage).
*   **数据录入 (Local CLI):** Node.js (TypeScript) + Firecrawl (或 Playwright) + OpenAI API.
*   **邮件服务:** Resend + React Email.
*   **部署:** Vercel.

---

## 3. 数据库设计 (Supabase)
*已在第二步确认，核心表如下：*
1.  **Products:** 存产品基础信息 + `ai_analysis` (JSONB 核心拆解).
2.  **Reviews:** 存第三方评价链接 + `ai_summary`.
3.  **Daily_Issues:** 每日一期的期刊表 (主题、发布日期).
4.  **Daily_Items:** 关联期刊与产品 (排序、推荐语).
5.  **Subscribers:** 订阅邮箱列表.

---

## 4. 核心模块实现细节

### 模块 A：本地数据录入脚本 (The Engine)
这是一个运行在你电脑终端的 Node.js 脚本。

**工作流程：**
1.  **输入：** 你在项目根目录创建一个 `urls.txt` 或 `pending.json`，填入你想抓的 URL。
2.  **执行：** 运行命令 `npm run ingest`。
3.  **脚本逻辑：**
    *   读取 URL。
    *   调用爬虫 (Firecrawl/Playwright) 抓取 HTML 和截图。
    *   调用 LLM (GPT-4o-mini) 进行清洗和结构化拆解（输出 JSON）。
    *   **自动入库：** 直接连接 Supabase 实例，插入 `Products` 表，状态设为 `draft`。
4.  **输出：** 终端显示 "✅ Success: [Midjourney] inserted into DB."

### 模块 B：前端页面结构 (The Face)
我们需要设计 4 个关键页面：

#### 1. 首页 (Home / Daily)
*   **设计目标：** 像一份报纸，而不是Excel表格。
*   **Hero 区域：** 大标题 + “订阅日报”输入框（核心转化）。
*   **今日精选 (Daily Issue)：**
    *   显示今日主题（如“论文神器”）。
    *   展示 1 个**主推产品**（大卡片，带深度拆解预览）。
    *   展示 2-3 个**副推产品**（小列表）。
*   **查看往期：** 一个简单的 Timeline 链接。

#### 2. 发现页 (Directory)
*   **侧边栏：** 分类（文本、图像、视频、代码...）+ 场景标签（写作业、做设计）。
*   **主区域：** 网格状排列的产品卡片 (Logo + 名称 + 一句话介绍)。
*   **搜索框：** 实时搜索。

#### 3. 产品详情页 (Product Detail) - *最重要*
*   **头部：** Logo, 名称, 官网跳转按钮, 所属分类。
*   **左侧 (AI 拆解):**
    *   *设计思路：* 渲染 `ai_analysis.design_philosophy`。
    *   *适用人群：* 渲染 `ai_analysis.target_users`。
    *   *核心功能：* 标签化展示。
*   **右侧/下侧 (情报局):**
    *   **第三方评价列表：** 循环渲染 `Reviews` 表数据。
    *   样式：`[B站图标] 标题... (AI摘要: UP主认为...) [跳转]`。

#### 4. 往期归档 (Archives)
*   按日期倒序排列的 `Daily_Issues` 列表，方便学生补课。

### 模块 C：邮件系统 (The Push)
*   **触发方式：** Vercel Cron (定时) 或 手动 API 触发。
*   **内容：** 复用“首页今日精选”的逻辑，通过 React Email 渲染成 HTML 发送。

---

## 5. 开发路线图 (Roadmap)

建议按照以下顺序开发，每完成一步都是一个里程碑。

### 第一阶段：地基搭建 (预计 1-2 天)
1.  创建 Next.js 项目，安装 Tailwind, Supabase Client.
2.  在 Supabase 后台建表 (SQL Editor).
3.  编写 **本地录入脚本** (Node.js)。
    *   *目标：* 运行脚本，能成功在 Supabase 后台看到一条由 AI 生成的测试数据。

### 第二阶段：前端展示 (预计 3-4 天)
1.  开发 **详情页 (`/product/[slug]`)**。
    *   *目标：* 把数据库里那条数据漂亮地展示出来，包含 AI 拆解部分。
2.  开发 **发现页** 和 **首页**。
    *   *目标：* 能看到产品列表，点击能进详情页。

### 第三阶段：评价与后台 (预计 2 天)
1.  完善脚本，增加“添加评价”的功能（或者直接在 Supabase 后台手动加 Review 数据）。
2.  在详情页展示评价列表。

### 第四阶段：订阅与发布 (预计 2 天)
1.  集成 Resend。
2.  开发“订阅组件”，将邮箱存入 `Subscribers` 表。
3.  编写发送邮件的 API 路由。

---

## 6. 给你的建议：从这里开始

现在你可以开始写代码了。第一步是初始化项目和数据库。

**你需要我为你提供以下哪部分的代码起步？**
1.  **SQL 建表语句：** 直接复制进 Supabase 就能把 5 张表建好。
2.  **本地录入脚本 (Node.js)：** 包含爬虫和 OpenAI 调用的核心逻辑。
3.  **Next.js 目录结构规划：** 帮你把文件夹建好。

建议先选 **1 (SQL)** 和 **2 (脚本)**，先把数据搞定，心里就有底了。