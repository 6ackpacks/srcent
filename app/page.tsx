"use client";

import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Link from "next/link";
import { ArrowRight, ExternalLink, Lightbulb, Users, Package, Sparkles, Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { getProducts, type Product } from "@/lib/supabase";

// 分类图标映射
const categoryIcons: Record<string, string> = {
  "文本": "✍️",
  "图像": "🎨",
  "视频": "🎬",
  "代码": "💻",
  "音频": "🎵",
  "效率": "⚡",
  "设计": "🖼️",
  "搜索": "🔍",
  "对话": "💬",
};

export default function Home() {
  const [isLoaded, setIsLoaded] = useState(false);
  const [email, setEmail] = useState("");
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setIsLoaded(true);
    loadProducts();
  }, []);

  async function loadProducts() {
    try {
      const data = await getProducts();
      setProducts(data);
    } catch (error) {
      console.error("Failed to load products:", error);
    } finally {
      setLoading(false);
    }
  }

  const handleSubscribe = () => {
    if (email && email.includes("@")) {
      setIsSubscribed(true);
      setTimeout(() => {
        setIsSubscribed(false);
        setEmail("");
      }, 2000);
    } else {
      alert("请输入有效的邮箱地址");
    }
  };

  // 获取第一个产品作为主推
  const featuredProduct = products[0];
  // 获取接下来的 3 个产品作为推荐
  const recommendedProducts = products.slice(1, 4);

  return (
    <>
      <Header />

      {/* Hero Section */}
      <section className="px-6 bg-[var(--secondary)]">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-2 gap-16 items-center min-h-[90vh] py-32 md:py-0">
            {/* Left: Content */}
            <div className="space-y-8">
              <div className="space-y-6">
                <div
                  className={`inline-flex items-center gap-2 px-4 py-2 bg-[var(--primary)]/10 text-[var(--primary)] rounded-full text-sm font-medium transition-all duration-500 ${
                    isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-5'
                  }`}
                >
                  <Sparkles className="w-4 h-4" />
                  发现最适合你的 AI 工具
                </div>

                <h1
                  className={`text-5xl md:text-6xl font-bold leading-tight transition-all duration-500 delay-100 ${
                    isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-5'
                  }`}
                >
                  srcent
                  <br />
                  <span className="text-[var(--primary)]">AI 产品</span>发现平台
                </h1>

                <p
                  className={`text-xl text-[var(--muted-foreground)] transition-all duration-500 delay-200 ${
                    isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-5'
                  }`}
                >
                  洞察 AI 产品的设计灵魂，每日精选优质工具
                </p>
              </div>

              {/* CTA */}
              <div
                className={`space-y-4 pt-2 transition-all duration-500 delay-300 ${
                  isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-5'
                }`}
              >
                <div className="flex gap-3 max-w-lg">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleSubscribe()}
                    className="flex-1 bg-[var(--card)] border border-[var(--border)] rounded-lg px-5 py-3.5 text-sm focus:outline-none focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary)]/20 transition-all placeholder:text-[var(--muted-foreground)]"
                    placeholder="输入你的邮箱地址"
                  />
                  <button
                    onClick={handleSubscribe}
                    className="bg-[var(--primary)] text-[var(--primary-foreground)] px-8 py-3.5 rounded-lg font-medium text-sm hover:opacity-90 transition-all hover:-translate-y-0.5 hover:shadow-md whitespace-nowrap active:scale-95"
                  >
                    {isSubscribed ? "✓ 订阅成功" : "订阅日报"}
                  </button>
                </div>
                <p className="text-sm text-[var(--muted-foreground)]">
                  已收录 {products.length} 个 AI 产品，每周精选深度拆解
                </p>
              </div>
            </div>

            {/* Right: Visual */}
            <div
              className={`transition-all duration-500 delay-400 ${
                isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-5'
              }`}
            >
              <div className="relative">
                <div className="w-full aspect-square bg-[var(--card)] border border-[var(--border)] rounded-2xl flex items-center justify-center overflow-hidden">
                  <div className="text-center space-y-4">
                    <span className="text-8xl">🔬</span>
                    <p className="text-[var(--muted-foreground)]">AI 产品实验室</p>
                  </div>
                </div>
                {/* Floating cards */}
                <div className="absolute -top-4 -right-4 bg-[var(--card)] border border-[var(--border)] rounded-xl p-3 shadow-lg">
                  <span className="text-2xl">🤖</span>
                </div>
                <div className="absolute -bottom-4 -left-4 bg-[var(--card)] border border-[var(--border)] rounded-xl p-3 shadow-lg">
                  <span className="text-2xl">✨</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Header */}
      <section className="py-6 px-6 border-b border-[var(--border)] bg-[var(--background)]">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-4">
              <span className="text-sm text-[var(--muted-foreground)]">📦 已收录 {products.length} 个 AI 产品</span>
              <span className="text-[var(--border)]">|</span>
              <Link href="/directory" className="text-sm font-medium text-[var(--primary)] hover:underline">
                浏览全部 →
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Product Analysis */}
      {loading ? (
        <section className="py-16 px-6 bg-[var(--background)]">
          <div className="max-w-7xl mx-auto flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-[var(--muted-foreground)]" />
          </div>
        </section>
      ) : featuredProduct ? (
        <section className="py-16 px-6 bg-[var(--background)]">
          <div className="max-w-7xl mx-auto">
            <div className="mb-8">
              <h2 className="text-2xl font-semibold">最新收录</h2>
            </div>

            <div className="bg-[var(--card)] border border-[var(--border)] rounded-xl overflow-hidden hover:border-[var(--primary)] transition-all duration-300 card-hover">
              <div className="grid md:grid-cols-5">
                {/* Left: Logo */}
                <div className="md:col-span-1 p-8 flex items-center justify-center border-r border-[var(--border)] bg-[var(--secondary)]">
                  <div className="w-16 h-16 bg-[var(--card)] border border-[var(--border)] rounded-xl flex items-center justify-center overflow-hidden">
                    {featuredProduct.logo_url ? (
                      <img src={featuredProduct.logo_url} alt={featuredProduct.name} className="w-10 h-10 object-contain" />
                    ) : (
                      <span className="text-3xl">{categoryIcons[featuredProduct.category || ""] || "🚀"}</span>
                    )}
                  </div>
                </div>

                {/* Right: Content */}
                <div className="md:col-span-4 p-8 space-y-6">
                  <div>
                    <h3 className="text-2xl font-semibold mb-2">{featuredProduct.name}</h3>
                    <p className="text-[var(--muted-foreground)]">{featuredProduct.tagline || "AI 产品"}</p>
                  </div>

                  {/* Analysis Points */}
                  <div className="space-y-2">
                    {featuredProduct.ai_analysis?.design_philosophy && (
                      <div className="flex items-start gap-3 p-4 rounded-lg hover:bg-[var(--secondary)] transition-colors">
                        <Lightbulb className="w-5 h-5 flex-shrink-0 mt-0.5 text-[var(--primary)]" />
                        <div>
                          <p className="text-sm font-medium mb-1">设计理念</p>
                          <p className="text-sm text-[var(--muted-foreground)]">{featuredProduct.ai_analysis.design_philosophy}</p>
                        </div>
                      </div>
                    )}

                    {featuredProduct.ai_analysis?.target_users && featuredProduct.ai_analysis.target_users.length > 0 && (
                      <div className="flex items-start gap-3 p-4 rounded-lg hover:bg-[var(--secondary)] transition-colors">
                        <Users className="w-5 h-5 flex-shrink-0 mt-0.5 text-[var(--primary)]" />
                        <div>
                          <p className="text-sm font-medium mb-1">目标人群</p>
                          <p className="text-sm text-[var(--muted-foreground)]">{featuredProduct.ai_analysis.target_users.slice(0, 3).join("、")}</p>
                        </div>
                      </div>
                    )}

                    {featuredProduct.ai_analysis?.features && featuredProduct.ai_analysis.features.length > 0 && (
                      <div className="flex items-start gap-3 p-4 rounded-lg hover:bg-[var(--secondary)] transition-colors">
                        <Package className="w-5 h-5 flex-shrink-0 mt-0.5 text-[var(--primary)]" />
                        <div>
                          <p className="text-sm font-medium mb-1">核心功能</p>
                          <div className="flex flex-wrap gap-2 mt-2">
                            {featuredProduct.ai_analysis.features.slice(0, 4).map((feature, i) => (
                              <span key={i} className="px-3 py-1.5 bg-[var(--secondary)] text-[var(--secondary-foreground)] rounded text-xs font-mono border border-[var(--border)] hover:bg-[var(--primary)] hover:text-[var(--primary-foreground)] hover:border-[var(--primary)] transition-all cursor-pointer">
                                {feature.title}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex gap-4 pt-4">
                    <Link
                      href={`/product/${featuredProduct.slug}`}
                      className="group inline-flex items-center gap-2 px-6 py-3 bg-[var(--primary)] text-[var(--primary-foreground)] rounded-lg font-medium text-sm hover:opacity-90 transition-all"
                    >
                      查看完整拆解
                      <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </Link>
                    {featuredProduct.website_url && (
                      <a
                        href={featuredProduct.website_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 px-6 py-3 border border-[var(--border)] rounded-lg font-medium text-sm hover:border-[var(--primary)] hover:bg-[var(--secondary)] transition-all"
                      >
                        访问官网
                        <ExternalLink className="w-4 h-4" />
                      </a>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      ) : null}

      {/* More Products */}
      {recommendedProducts.length > 0 && (
        <section className="py-16 px-6 bg-[var(--secondary)]">
          <div className="max-w-7xl mx-auto">
            <div className="mb-8">
              <h2 className="text-2xl font-semibold">更多推荐</h2>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              {recommendedProducts.map((product) => (
                <div
                  key={product.id}
                  className="bg-[var(--card)] border border-[var(--border)] rounded-xl p-6 hover:border-[var(--primary)] transition-all duration-300 card-hover"
                >
                  <div className="flex items-start gap-4 mb-4">
                    <div className="w-12 h-12 bg-[var(--secondary)] rounded-lg flex items-center justify-center border border-[var(--border)] overflow-hidden">
                      {product.logo_url ? (
                        <img src={product.logo_url} alt={product.name} className="w-7 h-7 object-contain" />
                      ) : (
                        <span className="text-2xl">{categoryIcons[product.category || ""] || "🤖"}</span>
                      )}
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg mb-1">{product.name}</h3>
                      <p className="text-sm text-[var(--muted-foreground)] line-clamp-1">{product.tagline || "AI 产品"}</p>
                    </div>
                  </div>
                  {product.tags && product.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-4">
                      {product.tags.slice(0, 2).map((tag) => (
                        <span
                          key={tag}
                          className="px-3 py-1.5 bg-[var(--secondary)] text-[var(--muted-foreground)] rounded text-xs font-mono border border-[var(--border)]"
                        >
                          #{tag}
                        </span>
                      ))}
                    </div>
                  )}
                  <Link
                    href={`/product/${product.slug}`}
                    className="group inline-flex items-center justify-center gap-2 w-full px-6 py-3 border border-[var(--border)] rounded-lg font-medium text-sm hover:border-[var(--primary)] hover:bg-[var(--primary)] hover:text-[var(--primary-foreground)] transition-all"
                  >
                    查看拆解
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Browse All Section */}
      <section id="archive" className="py-16 px-6 bg-[var(--background)]">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8">
            <h2 className="text-2xl font-semibold">探索更多</h2>
          </div>

          <div className="flex flex-wrap items-center gap-6 text-sm">
            <Link href="/directory" className="text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors">
              分类目录
            </Link>
            <span className="text-[var(--border)]">|</span>
            <Link href="/archives" className="text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors">
              往期归档
            </Link>
            <span className="text-[var(--border)]">|</span>
            <Link
              href="/directory"
              className="font-medium text-[var(--primary)] hover:opacity-80 transition-opacity"
            >
              浏览全部 {products.length} 个产品 →
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </>
  );
}
