// 数据库操作模块
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import type { Product, Review, SourceArticle } from './types.js';

let supabase: SupabaseClient;

export function initDB(): SupabaseClient {
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_KEY;

  if (!supabaseUrl || !supabaseKey) {
    throw new Error('Missing SUPABASE_URL or SUPABASE_SERVICE_KEY environment variables');
  }

  supabase = createClient(supabaseUrl, supabaseKey);
  return supabase;
}

export async function insertProduct(product: Omit<Product, 'id' | 'created_at' | 'updated_at'>): Promise<Product> {
  const { data, error } = await supabase
    .from('products')
    .insert(product)
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to insert product: ${error.message}`);
  }

  return data;
}

export async function updateProduct(slug: string, updates: Partial<Product>): Promise<Product> {
  const { data, error } = await supabase
    .from('products')
    .update(updates)
    .eq('slug', slug)
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to update product: ${error.message}`);
  }

  return data;
}

export async function getProductBySlug(slug: string): Promise<Product | null> {
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('slug', slug)
    .single();

  if (error && error.code !== 'PGRST116') {
    throw new Error(`Failed to get product: ${error.message}`);
  }

  return data;
}

// 通过 URL 检查产品是否已存在
export async function getProductByUrl(url: string): Promise<Product | null> {
  // 标准化 URL（去除末尾斜杠，统一协议）
  const normalizedUrl = url.replace(/\/$/, '').toLowerCase();

  const { data, error } = await supabase
    .from('products')
    .select('*')
    .or(`website_url.ilike.${normalizedUrl},website_url.ilike.${normalizedUrl}/`)
    .limit(1)
    .single();

  if (error && error.code !== 'PGRST116') {
    // PGRST116 是"没找到记录"的错误码，这是正常的
    console.error('Error checking URL:', error.message);
  }

  return data || null;
}

export async function insertReview(review: Omit<Review, 'id' | 'created_at'>): Promise<Review> {
  const { data, error } = await supabase
    .from('reviews')
    .insert(review)
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to insert review: ${error.message}`);
  }

  return data;
}

export async function uploadScreenshot(
  slug: string,
  imageBuffer: Buffer,
  contentType: string = 'image/png'
): Promise<string> {
  const fileName = `screenshots/${slug}-${Date.now()}.png`;

  const { error } = await supabase.storage
    .from('product-assets')
    .upload(fileName, imageBuffer, {
      contentType,
      upsert: true
    });

  if (error) {
    throw new Error(`Failed to upload screenshot: ${error.message}`);
  }

  const { data } = supabase.storage
    .from('product-assets')
    .getPublicUrl(fileName);

  return data.publicUrl;
}

// ============================================
// 深度拆解相关操作
// ============================================

export async function insertSourceArticle(article: Omit<SourceArticle, 'id' | 'created_at'>): Promise<SourceArticle> {
  const { data, error } = await supabase
    .from('source_articles')
    .insert(article)
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to insert source article: ${error.message}`);
  }

  return data;
}

export async function getSourceArticlesByProductId(productId: string): Promise<SourceArticle[]> {
  const { data, error } = await supabase
    .from('source_articles')
    .select('*')
    .eq('product_id', productId)
    .order('created_at', { ascending: true });

  if (error) {
    throw new Error(`Failed to get source articles: ${error.message}`);
  }

  return data || [];
}

export async function updateProductDeepDive(
  slug: string,
  updates: {
    podcast_audio_url?: string;
    podcast_transcript?: string;
    podcast_duration?: number;
    has_deep_dive?: boolean;
  }
): Promise<Product> {
  const { data, error } = await supabase
    .from('products')
    .update(updates)
    .eq('slug', slug)
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to update product deep dive: ${error.message}`);
  }

  return data;
}
