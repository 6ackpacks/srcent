import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// 产品类型定义
export interface Feature {
  title: string;
  description: string;
  icon: string;
}

export interface UseCase {
  title: string;
  description: string;
}

export interface FAQ {
  question: string;
  answer: string;
}

export interface Alternative {
  name: string;
  description: string;
}

export interface AIAnalysis {
  what_is?: string;
  design_philosophy?: string;
  target_users?: string[];
  features?: Feature[];
  use_cases?: UseCase[];
  pricing_model?: string;
  pricing_details?: string;
  strengths?: string[];
  weaknesses?: string[];
  faqs?: FAQ[];
  alternatives?: Alternative[];
}

export interface Product {
  id: string;
  slug: string;
  name: string;
  tagline: string | null;
  description: string | null;
  logo_url: string | null;
  website_url: string | null;
  screenshot_url: string | null;
  category: string | null;
  tags: string[] | null;
  ai_analysis: AIAnalysis | null;
  status: 'draft' | 'published' | 'archived';
  created_at: string;
  updated_at: string;
  // 播客深度拆解字段
  podcast_audio_url: string | null;
  podcast_transcript: string | null;
  podcast_duration: number | null;
  has_deep_dive: boolean | null;
}

// 来源文章类型
export interface SourceArticle {
  id: string;
  product_id: string;
  url: string;
  title: string | null;
  source_name: string | null;
  key_insight: string | null;
  created_at: string;
}

// 获取所有产品（可选：按状态过滤）
export async function getProducts(status?: 'draft' | 'published' | 'archived') {
  let query = supabase
    .from('products')
    .select('*')
    .order('created_at', { ascending: false });

  if (status) {
    query = query.eq('status', status);
  }

  const { data, error } = await query;

  if (error) {
    console.error('Error fetching products:', error);
    return [];
  }

  return data as Product[];
}

// 按分类获取产品
export async function getProductsByCategory(category: string) {
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('category', category)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching products by category:', error);
    return [];
  }

  return data as Product[];
}

// 获取单个产品
export async function getProductBySlug(slug: string) {
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('slug', slug)
    .single();

  if (error) {
    console.error('Error fetching product:', error);
    return null;
  }

  return data as Product;
}

// 获取所有分类
export async function getCategories() {
  const { data, error } = await supabase
    .from('products')
    .select('category')
    .not('category', 'is', null);

  if (error) {
    console.error('Error fetching categories:', error);
    return [];
  }

  // 去重
  const categories = [...new Set(data.map(p => p.category).filter(Boolean))];
  return categories as string[];
}

// 搜索产品
export async function searchProducts(query: string) {
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .or(`name.ilike.%${query}%,tagline.ilike.%${query}%,description.ilike.%${query}%`)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error searching products:', error);
    return [];
  }

  return data as Product[];
}

// 获取产品的来源文章
export async function getSourceArticles(productId: string) {
  const { data, error } = await supabase
    .from('source_articles')
    .select('*')
    .eq('product_id', productId)
    .order('created_at', { ascending: true });

  if (error) {
    console.error('Error fetching source articles:', error);
    return [];
  }

  return data as SourceArticle[];
}

// 获取有深度拆解的产品
export async function getDeepDiveProducts() {
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('has_deep_dive', true)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching deep dive products:', error);
    return [];
  }

  return data as Product[];
}
