"use client";

import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Link from "next/link";
import { Search, ArrowUpRight, Loader2 } from "lucide-react";
import { useState, useEffect } from "react";
import { getProducts, getCategories, type Product } from "@/lib/supabase";

// 分类映射（中文显示）
const categoryLabels: Record<string, { label: string; icon: string }> = {
  "all": { label: "全部", icon: "📦" },
  "文本": { label: "文本生成", icon: "✍️" },
  "图像": { label: "图像生成", icon: "🎨" },
  "视频": { label: "视频创作", icon: "🎬" },
  "代码": { label: "代码辅助", icon: "💻" },
  "音频": { label: "音频工具", icon: "🎵" },
  "效率": { label: "效率工具", icon: "⚡" },
  "设计": { label: "设计工具", icon: "🖼️" },
  "搜索": { label: "搜索研究", icon: "🔍" },
  "对话": { label: "AI 对话", icon: "💬" },
};

export default function DirectoryPage() {
  const [activeCategory, setActiveCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  // 加载数据
  useEffect(() => {
    async function loadData() {
      setLoading(true);
      try {
        const [productsData, categoriesData] = await Promise.all([
          getProducts(), // 获取所有产品（包括 draft）
          getCategories(),
        ]);
        setProducts(productsData);
        setCategories(categoriesData);
      } catch (error) {
        console.error("Failed to load data:", error);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  // 过滤产品
  const filteredProducts = products.filter((product) => {
    const matchesCategory = activeCategory === "all" || product.category === activeCategory;
    const matchesSearch =
      searchQuery === "" ||
      product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (product.tagline && product.tagline.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (product.tags && product.tags.some((tag) => tag.toLowerCase().includes(searchQuery.toLowerCase())));
    return matchesCategory && matchesSearch;
  });

  // 构建分类列表
  const categoryList = [
    { id: "all", label: "全部", icon: "📦" },
    ...categories.map((cat) => ({
      id: cat,
      label: categoryLabels[cat]?.label || cat,
      icon: categoryLabels[cat]?.icon || "📁",
    })),
  ];

  return (
    <>
      <Header />

      <div className="pt-24 pb-20 px-6">
        <div className="max-w-7xl mx-auto">
          {/* Page Header */}
          <div className="mb-10">
            <h1 className="text-3xl font-bold mb-3">分类目录</h1>
            <p className="text-[var(--muted-foreground)]">
              探索已收录的 {products.length} 个 AI 产品，发现适合你的工具
            </p>
          </div>

          {/* Search Bar */}
          <div className="mb-8 max-w-2xl">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--muted-foreground)]" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3.5 bg-[var(--card)] border border-[var(--border)] rounded-xl text-sm focus:outline-none focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary)]/20 transition-all placeholder:text-[var(--muted-foreground)]"
                placeholder="搜索产品名称、功能、分类..."
              />
            </div>
          </div>

          <div className="grid grid-cols-12 gap-8">
            {/* Sidebar Filters */}
            <aside className="col-span-3">
              <div className="sticky top-28 space-y-6">
                <div>
                  <h3 className="text-sm font-semibold mb-3 text-[var(--muted-foreground)]">分类</h3>
                  <div className="space-y-1">
                    {categoryList.map((cat) => (
                      <button
                        key={cat.id}
                        onClick={() => setActiveCategory(cat.id)}
                        className={`w-full text-left px-4 py-2.5 rounded-lg text-sm transition-all flex items-center gap-2 ${
                          activeCategory === cat.id
                            ? "bg-[var(--primary)] text-[var(--primary-foreground)]"
                            : "bg-transparent text-[var(--muted-foreground)] hover:bg-[var(--secondary)] hover:text-[var(--foreground)]"
                        }`}
                      >
                        <span>{cat.icon}</span>
                        <span>{cat.label}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </aside>

            {/* Product Grid */}
            <main className="col-span-9">
              <div className="mb-6 flex items-center justify-between">
                <p className="text-sm text-[var(--muted-foreground)]">
                  共 <span className="text-[var(--foreground)] font-medium">{filteredProducts.length}</span> 个产品
                </p>
                <select className="text-sm bg-[var(--card)] border border-[var(--border)] rounded-lg px-3 py-2 focus:outline-none focus:border-[var(--primary)] text-[var(--foreground)]">
                  <option>最新收录</option>
                  <option>按分类</option>
                </select>
              </div>

              {loading ? (
                <div className="flex items-center justify-center py-20">
                  <Loader2 className="w-8 h-8 animate-spin text-[var(--muted-foreground)]" />
                </div>
              ) : filteredProducts.length === 0 ? (
                <div className="text-center py-20">
                  <p className="text-[var(--muted-foreground)]">暂无产品数据</p>
                </div>
              ) : (
                <div className="grid grid-cols-3 gap-4">
                  {filteredProducts.map((product) => (
                    <Link
                      key={product.id}
                      href={`/product/${product.slug}`}
                      className="group bg-[var(--card)] border border-[var(--border)] rounded-xl p-5 hover:border-[var(--primary)] transition-all card-hover"
                    >
                      <div className="flex flex-col gap-4">
                        {/* Product Icon */}
                        <div className="flex items-start justify-between">
                          <div className="w-12 h-12 rounded-xl bg-[var(--secondary)] flex items-center justify-center border border-[var(--border)] overflow-hidden">
                            {product.logo_url ? (
                              <img
                                src={product.logo_url}
                                alt={product.name}
                                className="w-7 h-7 object-contain"
                                onError={(e) => {
                                  e.currentTarget.style.display = 'none';
                                  if (e.currentTarget.nextElementSibling) {
                                    (e.currentTarget.nextElementSibling as HTMLElement).classList.remove('hidden');
                                  }
                                }}
                              />
                            ) : null}
                            <span className={`text-2xl ${product.logo_url ? 'hidden' : ''}`}>
                              {categoryLabels[product.category || ""]?.icon || "🤖"}
                            </span>
                          </div>
                          <ArrowUpRight className="w-4 h-4 text-[var(--muted-foreground)] opacity-0 group-hover:opacity-100 transition-opacity" />
                        </div>

                        {/* Product Info */}
                        <div>
                          <h3 className="font-semibold text-base mb-1 group-hover:text-[var(--primary)] transition-colors">
                            {product.name}
                          </h3>
                          <p className="text-sm text-[var(--muted-foreground)] mb-3 line-clamp-2">
                            {product.tagline || "AI 产品"}
                          </p>

                          {/* Tags */}
                          {product.tags && product.tags.length > 0 && (
                            <div className="flex flex-wrap gap-1.5 mb-3">
                              {product.tags.slice(0, 2).map((tag, j) => (
                                <span
                                  key={j}
                                  className="px-2 py-0.5 bg-[var(--secondary)] text-[var(--muted-foreground)] rounded text-xs border border-[var(--border)]"
                                >
                                  {tag}
                                </span>
                              ))}
                            </div>
                          )}

                          {/* Category & Status */}
                          <div className="flex items-center justify-between text-xs text-[var(--muted-foreground)]">
                            <span className="px-2 py-0.5 bg-[var(--secondary)] rounded">
                              {categoryLabels[product.category || ""]?.label || product.category || "未分类"}
                            </span>
                            {product.ai_analysis?.pricing_model && (
                              <span className="px-2 py-0.5 bg-[var(--primary)]/10 text-[var(--primary)] rounded">
                                {product.ai_analysis.pricing_model}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </main>
          </div>
        </div>
      </div>

      <Footer />
    </>
  );
}
