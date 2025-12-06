import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Link from "next/link";
import { getProductBySlug, getSourceArticles } from "@/lib/supabase";
import DeepDiveClient from "./DeepDiveClient";

// 服务端组件 - 预加载数据
export default async function DeepDivePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;

  // 在服务端获取数据
  const product = await getProductBySlug(slug);

  // 如果产品不存在或没有深度拆解
  if (!product || !product.has_deep_dive) {
    return (
      <>
        <Header />
        <div className="pt-24 pb-20 px-6 text-center min-h-screen">
          <h1 className="text-2xl font-bold mb-4">深度拆解未找到</h1>
          <p className="text-[var(--muted-foreground)] mb-6">
            {product ? '该产品暂未生成深度拆解内容。' : '抱歉，我们找不到这个产品。'}
          </p>
          <Link href={product ? `/product/${slug}` : "/directory"} className="text-[var(--primary)] hover:underline">
            {product ? '返回产品详情' : '返回目录'}
          </Link>
        </div>
        <Footer />
      </>
    );
  }

  // 获取来源文章
  const sources = await getSourceArticles(product.id);

  return (
    <>
      <Header />
      <DeepDiveClient product={product} sources={sources} slug={slug} />
      <Footer />
    </>
  );
}
