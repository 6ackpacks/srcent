import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { getProducts, getCategories } from "@/lib/supabase";
import DirectoryClient from "./DirectoryClient";

// 静态生成 (SSG) + 增量静态再生成 (ISR)
// 构建时生成静态页面，每小时自动重新生成
export const dynamic = 'force-static';
export const revalidate = 3600; // 每 3600 秒（1小时）重新生成

export default async function DirectoryPage() {
  // 构建时获取数据，生成静态 HTML
  const [products, categories] = await Promise.all([
    getProducts(),
    getCategories(),
  ]);

  return (
    <>
      <Header />
      <DirectoryClient initialProducts={products} initialCategories={categories} />
      <Footer />
    </>
  );
}
