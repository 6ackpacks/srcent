# AI Scent - Next.js 项目

AI 时代的产品拆解实验室 - 每日 AI 产品精选

## 🚀 快速开始

### 开发环境

```bash
npm run dev
```

访问：http://localhost:3002

### 构建生产版本

```bash
npm run build
npm start
```

## 📁 项目结构

```
shad-cn/
├── app/                      # Next.js App Router
│   ├── page.tsx              # 首页
│   ├── directory/            # 产品库页面
│   ├── product/[slug]/       # 产品详情页（动态路由）
│   ├── archives/             # 往期归档页
│   ├── layout.tsx            # 根布局
│   └── globals.css           # 全局样式
├── components/               # React 组件
│   ├── Header.tsx            # 页头组件
│   ├── Footer.tsx            # 页脚组件
│   └── ui/                   # UI 组件库
│       └── Button.tsx
├── lib/                      # 工具函数
│   └── utils.ts
├── public/                   # 静态资源
├── .superdesign/             # 设计文件（HTML原型）
│   └── design_iterations/
│       ├── ai_scent_home_4.html
│       ├── directory.html
│       ├── product_detail.html
│       └── archives.html
├── package.json
├── tailwind.config.ts        # Tailwind 配置
├── tsconfig.json             # TypeScript 配置
└── next.config.mjs           # Next.js 配置
```

## 🎨 设计系统

### 主题
- **风格**：极简主义 (Minimalist Monochrome)
- **配色**：黑白灰
- **字体**：Geist / Geist Mono
- **参考**：Vercel, Linear

### CSS 变量
所有主题变量定义在 `app/globals.css` 中：
- 颜色：`--foreground`, `--background`, `--primary`, 等
- 阴影：`--shadow`, `--shadow-md`, `--shadow-lg`
- 圆角：`--radius`, `--radius-sm`, `--radius-lg`
- 动画：`--ease-out`, `--duration-normal`, 等

## 📄 页面说明

### 1. 首页 (`/`)
- Hero 区域（极简风格）
- 本期主题横幅
- 主推产品深度拆解
- 本期更多推荐
- 往期回顾

### 2. 产品库 (`/directory`)
- 搜索功能
- 侧边栏筛选（分类、场景）
- 产品网格展示
- 分页功能

### 3. 产品详情 (`/product/[slug]`)
- 产品信息头部
- AI 深度拆解（5层分析）
- 第三方评价（情报局）
- 相关产品推荐

### 4. 往期归档 (`/archives`)
- 时间线布局
- 期刊列表
- 筛选功能
- 加载更多

## 🛠️ 技术栈

- **框架**：Next.js 16 (App Router)
- **语言**：TypeScript
- **样式**：Tailwind CSS 4
- **图标**：Lucide React
- **字体**：Geist (Google Fonts)

## 📦 依赖包

```json
{
  "dependencies": {
    "next": "^16.0.5",
    "react": "^19.2.0",
    "react-dom": "^19.2.0",
    "lucide-react": "^0.555.0",
    "clsx": "^2.1.1",
    "tailwind-merge": "^3.4.0"
  },
  "devDependencies": {
    "typescript": "^5.9.3",
    "@types/node": "^24.10.1",
    "@types/react": "^19.2.7",
    "@types/react-dom": "^19.2.3",
    "tailwindcss": "^4.1.17",
    "autoprefixer": "^10.4.22",
    "postcss": "^8.5.6"
  }
}
```

## 🔧 下一步开发

### 后端集成
1. 设置 Supabase 数据库
2. 创建数据录入脚本
3. 实现 API 路由
4. 连接前端与数据库

### 功能增强
1. 邮件订阅功能（Resend）
2. 搜索功能实现
3. 产品筛选逻辑
4. 分页功能
5. 产品详情页完整内容

### 性能优化
1. 图片优化（Next.js Image）
2. 服务端渲染（SSR）
3. 静态生成（SSG）
4. 路由预加载

## 📝 开发注意事项

1. **组件复用**：Header 和 Footer 在所有页面中使用
2. **样式一致性**：使用 Tailwind 和 CSS 变量保持设计统一
3. **类型安全**：所有组件都使用 TypeScript
4. **响应式设计**：所有页面支持移动端适配

## 🎯 原型文件

HTML 原型文件保存在 `.superdesign/design_iterations/`：
- `ai_scent_home_4.html` → 转换为 `app/page.tsx`
- `directory.html` → 转换为 `app/directory/page.tsx`
- `product_detail.html` → 转换为 `app/product/[slug]/page.tsx`
- `archives.html` → 转换为 `app/archives/page.tsx`

## 📮 联系方式

AI Scent © 2025
