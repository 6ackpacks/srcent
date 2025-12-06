import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { getProducts, getCategories } from "@/lib/supabase";
import DirectoryClient from "./DirectoryClient";

// 服务端组件 - 预加载数据
export default async function DirectoryPage() {
  // 在服务端获取数据（更快！）
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
