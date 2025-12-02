# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

AI Scent is an AI product discovery platform for students, featuring:
- AI-powered product analysis and breakdowns
- Third-party review aggregation
- Daily curated product recommendations (Newsletter)

## Commands

```bash
# Development
npm run dev              # Start Next.js dev server (http://localhost:3002)
npm run build            # Production build
npm run lint             # Run ESLint

# Data Ingestion (local CLI scripts)
npm run ingest:install   # Install script dependencies (run once)
npm run ingest           # Process URLs from pending.json or urls.txt
```

## Architecture

### Frontend (Next.js App Router)
```
app/
├── page.tsx                 # Home - daily curated products
├── directory/page.tsx       # Product catalog with filters
├── product/[slug]/page.tsx  # Product detail with AI analysis
├── archives/page.tsx        # Past issues timeline
└── layout.tsx               # Root layout with Header/Footer
```

### Data Ingestion Pipeline (`scripts/src/`)
Local Node.js scripts that run `npm run ingest`:
1. **ingest.ts** - Main entry, reads `pending.json` or `urls.txt`
2. **crawler.ts** - Fetches webpage content via Firecrawl or Playwright
3. **analyzer.ts** - Calls LLM (currently OpenAI) to generate structured product analysis
4. **db.ts** - Supabase client for database operations

### Database (Supabase)
Schema defined in `supabase/schema.sql`:
- **products** - Core product info + `ai_analysis` JSONB field
- **reviews** - Third-party reviews with AI summaries
- **daily_issues** - Newsletter issues by date
- **daily_items** - Links products to issues (with featured flag)
- **subscribers** - Email subscription list

## Key Patterns

### AI Analysis Structure
Products store AI analysis as JSONB in `ai_analysis` field:
```typescript
{
  design_philosophy: string,
  target_users: string[],
  core_features: string[],
  pricing_model: string,
  strengths: string[],
  weaknesses: string[],
  use_cases: string[],
  alternatives: string[]
}
```

### Environment Variables
Required in `.env`:
- `SUPABASE_URL`, `SUPABASE_SERVICE_KEY` - Database access
- `DASHSCOPE_API_KEY` - Alibaba Cloud Qwen for AI analysis
- `FIRECRAWL_API_KEY` (optional) - Web crawling, falls back to Playwright

### Styling
- Tailwind CSS with CSS variables in `app/globals.css`
- Minimalist monochrome theme (Vercel/Linear style)
- `cn()` utility in `lib/utils.ts` for class merging
- Icons: Lucide React

## Adding New Products

1. Add URL to `pending.json`:
```json
[{ "url": "https://example.com", "category": "文本", "tags": ["写作"] }]
```
2. Run `npm run ingest`
3. Product saved as draft in Supabase
