"use client";

import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Link from "next/link";
import { Headphones, Play, Clock, ArrowRight } from "lucide-react";
import { useState, useEffect } from "react";
import { getDeepDiveProducts, type Product } from "@/lib/supabase";

// 分类映射
const categoryLabels: Record<string, { label: string; icon: string }> = {
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

function formatDuration(seconds: number | null): string {
  if (!seconds) return "--:--";
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, "0")}`;
}

export default function DeepDivePage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      try {
        const data = await getDeepDiveProducts();
        setProducts(data);
      } catch (error) {
        console.error("Failed to load deep dive products:", error);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  return (
    <>
      <Header />

      <div className="pt-24 pb-20 px-6">
        <div className="max-w-6xl mx-auto">
          {/* Page Header */}
          <div className="mb-12 text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-[var(--primary)]/10 rounded-full text-[var(--primary)] text-sm font-medium mb-4">
              <Headphones className="w-4 h-4" />
              AI 播客深度拆解
            </div>
            <h1 className="text-4xl font-bold mb-4">产品拆解</h1>
            <p className="text-[var(--muted-foreground)] text-lg max-w-2xl mx-auto">
              通过 AI 播客的形式，深入分析每个产品的设计理念、核心功能与行业洞察
            </p>
          </div>

          {/* Products Grid */}
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[...Array(4)].map((_, i) => (
                <div
                  key={i}
                  className="bg-[var(--card)] border border-[var(--border)] rounded-2xl p-6"
                >
                  <div className="flex gap-5">
                    <div className="w-20 h-20 rounded-xl skeleton-shimmer flex-shrink-0" />
                    <div className="flex-1">
                      <div className="h-6 w-32 rounded skeleton-shimmer mb-2" />
                      <div className="h-4 w-full rounded skeleton-shimmer mb-1" />
                      <div className="h-4 w-3/4 rounded skeleton-shimmer mb-4" />
                      <div className="flex gap-2">
                        <div className="h-6 w-20 rounded skeleton-shimmer" />
                        <div className="h-6 w-16 rounded skeleton-shimmer" />
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : products.length === 0 ? (
            <div className="text-center py-20">
              <Headphones className="w-16 h-16 mx-auto mb-4 text-[var(--muted-foreground)] opacity-30" />
              <h3 className="text-xl font-semibold mb-2">暂无深度拆解</h3>
              <p className="text-[var(--muted-foreground)]">
                我们正在努力制作更多高质量的产品拆解播客
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {products.map((product) => (
                <Link
                  key={product.id}
                  href={`/product/${product.slug}/deep-dive`}
                  className="group bg-[var(--card)] border border-[var(--border)] rounded-2xl p-6 hover:border-[var(--primary)] transition-all card-hover"
                >
                  <div className="flex gap-5">
                    {/* Product Logo */}
                    <div className="w-20 h-20 rounded-xl bg-[var(--secondary)] flex items-center justify-center border border-[var(--border)] overflow-hidden flex-shrink-0 relative">
                      {product.logo_url ? (
                        <img
                          src={product.logo_url}
                          alt={product.name}
                          className="w-12 h-12 object-contain"
                          onError={(e) => {
                            e.currentTarget.style.display = "none";
                          }}
                        />
                      ) : (
                        <span className="text-3xl">
                          {categoryLabels[product.category || ""]?.icon || "🤖"}
                        </span>
                      )}
                      {/* Play overlay */}
                      <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <Play className="w-8 h-8 text-white fill-white" />
                      </div>
                    </div>

                    {/* Product Info */}
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-lg mb-1 group-hover:text-[var(--primary)] transition-colors">
                        {product.name}
                      </h3>
                      <p className="text-sm text-[var(--muted-foreground)] mb-3 line-clamp-2">
                        {product.tagline || "深度拆解该产品的设计与功能"}
                      </p>

                      {/* Meta info */}
                      <div className="flex items-center gap-3 text-sm">
                        {/* Duration */}
                        <div className="flex items-center gap-1 text-[var(--muted-foreground)]">
                          <Clock className="w-4 h-4" />
                          <span>{formatDuration(product.podcast_duration)}</span>
                        </div>

                        {/* Category */}
                        <span className="px-2 py-0.5 bg-[var(--secondary)] rounded text-[var(--muted-foreground)] text-xs">
                          {categoryLabels[product.category || ""]?.label ||
                            product.category ||
                            "未分类"}
                        </span>

                        {/* Tags */}
                        {product.tags && product.tags.length > 0 && (
                          <span className="px-2 py-0.5 bg-[var(--primary)]/10 text-[var(--primary)] rounded text-xs">
                            {product.tags[0]}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Arrow */}
                    <div className="flex items-center">
                      <ArrowRight className="w-5 h-5 text-[var(--muted-foreground)] group-hover:text-[var(--primary)] group-hover:translate-x-1 transition-all" />
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}

          {/* Coming Soon Section */}
          {products.length > 0 && (
            <div className="mt-16 text-center">
              <p className="text-[var(--muted-foreground)] mb-4">
                更多产品拆解即将上线
              </p>
              <Link
                href="/directory"
                className="inline-flex items-center gap-2 px-6 py-3 bg-[var(--secondary)] hover:bg-[var(--primary)] hover:text-[var(--primary-foreground)] rounded-xl text-sm font-medium transition-colors"
              >
                浏览所有产品
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          )}
        </div>
      </div>

      <Footer />
    </>
  );
}
