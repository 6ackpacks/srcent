"use client";

import Link from "next/link";
import { Search, ArrowUpRight, Headphones, Check } from "lucide-react";
import { useState, useEffect, useRef, useMemo } from "react";
import { type Product } from "@/lib/supabase";

// 分类映射（中文显示）
const categoryLabels: Record<string, { label: string; icon: string }> = {
  "all": { label: "全部产品", icon: "📦" },
  "通用助手": { label: "通用助手", icon: "🤖" },
  "图像生成": { label: "图像生成", icon: "🎨" },
  "视频创作": { label: "视频创作", icon: "🎬" },
  "音频处理": { label: "音频处理", icon: "🎵" },
  "编程开发": { label: "编程开发", icon: "💻" },
  "智能搜索": { label: "智能搜索", icon: "🔍" },
  "知识管理": { label: "知识管理", icon: "📚" },
  "写作辅助": { label: "写作辅助", icon: "✍️" },
  "智能硬件": { label: "智能硬件", icon: "🔧" },
  "虚拟陪伴": { label: "虚拟陪伴", icon: "💬" },
  "Agent构建": { label: "Agent 构建", icon: "🛠️" },
  "效率工具": { label: "效率工具", icon: "⚡" },
  "3D生成": { label: "3D 生成", icon: "🎮" },
  "科研辅助": { label: "科研辅助", icon: "🔬" },
  "其他类型": { label: "其他类型", icon: "📁" },
};

// 每次加载的产品数量
const ITEMS_PER_PAGE = 12;

// Fisher-Yates 洗牌算法
function shuffleArray<T>(array: T[], seed: number): T[] {
  const shuffled = [...array];
  let currentIndex = shuffled.length;

  // 使用种子生成伪随机数
  const random = () => {
    seed = (seed * 9301 + 49297) % 233280;
    return seed / 233280;
  };

  while (currentIndex !== 0) {
    const randomIndex = Math.floor(random() * currentIndex);
    currentIndex--;
    [shuffled[currentIndex], shuffled[randomIndex]] = [shuffled[randomIndex], shuffled[currentIndex]];
  }

  return shuffled;
}

// 产品卡片组件
function ProductCard({ product, isVisible }: { product: Product; isVisible: boolean }) {
  return (
    <div
      className={`group bg-[var(--card)] border border-[var(--border)] rounded-xl p-4 sm:p-5 hover:border-[var(--primary)] transition-all card-hover relative ${
        isVisible ? 'animate-fade-in-up' : 'opacity-0'
      }`}
    >
      {/* 深度拆解标签 */}
      {product.has_deep_dive && (
        <Link
          href={`/product/${product.slug}/deep-dive`}
          className="absolute top-2 right-2 sm:top-3 sm:right-3 z-10 flex items-center gap-1 px-2 py-1 bg-[var(--primary)] text-[var(--primary-foreground)] rounded-full text-xs font-medium hover:opacity-90 transition-opacity"
          onClick={(e) => e.stopPropagation()}
          prefetch={false}
        >
          <Headphones className="w-3 h-3" />
          <span className="hidden sm:inline">深度拆解</span>
        </Link>
      )}

      <Link href={`/product/${product.slug}`} className="block" prefetch={false}>
        <div className="flex flex-col gap-3 sm:gap-4">
          {/* Product Icon */}
          <div className="flex items-start justify-between">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-[var(--secondary)] flex items-center justify-center border border-[var(--border)] overflow-hidden">
              {product.logo_url ? (
                <img
                  src={product.logo_url}
                  alt={product.name}
                  className="w-6 h-6 sm:w-7 sm:h-7 object-contain"
                  loading="lazy"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                    if (e.currentTarget.nextElementSibling) {
                      (e.currentTarget.nextElementSibling as HTMLElement).classList.remove('hidden');
                    }
                  }}
                />
              ) : null}
              <span className={`text-xl sm:text-2xl ${product.logo_url ? 'hidden' : ''}`}>
                {categoryLabels[product.category || ""]?.icon || "🤖"}
              </span>
            </div>
            <ArrowUpRight className={`w-4 h-4 text-[var(--muted-foreground)] opacity-0 group-hover:opacity-100 transition-opacity ${product.has_deep_dive ? 'mt-5 sm:mt-6' : ''}`} />
          </div>

          {/* Product Info */}
          <div>
            <h3 className="font-semibold text-sm sm:text-base mb-1 group-hover:text-[var(--primary)] transition-colors line-clamp-1">
              {product.name}
            </h3>
            <p className="text-xs sm:text-sm text-[var(--muted-foreground)] mb-2 sm:mb-3 line-clamp-2">
              {product.tagline || "AI 产品"}
            </p>

            {/* Tags - 仅在大屏显示 */}
            {product.tags && product.tags.length > 0 && (
              <div className="hidden sm:flex flex-wrap gap-1.5 mb-3">
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
              <span className="px-2 py-0.5 bg-[var(--secondary)] rounded truncate max-w-[100px] sm:max-w-none">
                {categoryLabels[product.category || ""]?.label || product.category || "未分类"}
              </span>
              {product.ai_analysis?.pricing_model && (
                <span className="px-2 py-0.5 bg-[var(--primary)]/10 text-[var(--primary)] rounded hidden sm:inline">
                  {product.ai_analysis.pricing_model}
                </span>
              )}
            </div>
          </div>
        </div>
      </Link>
    </div>
  );
}

interface DirectoryClientProps {
  initialProducts: Product[];
  initialCategories: string[];
}

export default function DirectoryClient({ initialProducts, initialCategories }: DirectoryClientProps) {
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [visibleCount, setVisibleCount] = useState(ITEMS_PER_PAGE);
  const loadMoreRef = useRef<HTMLDivElement>(null);

  // 生成随机种子（每次页面加载时不同）
  const [randomSeed] = useState(() => Date.now());

  // 随机排序产品（使用 useMemo 缓存）
  const shuffledProducts = useMemo(() => {
    return shuffleArray(initialProducts, randomSeed);
  }, [initialProducts, randomSeed]);

  // 过滤产品
  const filteredProducts = useMemo(() => {
    return shuffledProducts.filter((product) => {
      // 如果没有选中任何分类，显示所有产品
      const matchesCategory = selectedCategories.length === 0 ||
        selectedCategories.includes(product.category || "");
      const matchesSearch =
        searchQuery === "" ||
        product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (product.tagline && product.tagline.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (product.tags && product.tags.some((tag) => tag.toLowerCase().includes(searchQuery.toLowerCase())));
      return matchesCategory && matchesSearch;
    });
  }, [shuffledProducts, selectedCategories, searchQuery]);

  // 当前显示的产品
  const visibleProducts = filteredProducts.slice(0, visibleCount);
  const hasMore = visibleCount < filteredProducts.length;

  // 懒加载 - Intersection Observer
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore) {
          setVisibleCount((prev) => Math.min(prev + ITEMS_PER_PAGE, filteredProducts.length));
        }
      },
      { threshold: 0.1, rootMargin: '100px' }
    );

    if (loadMoreRef.current) {
      observer.observe(loadMoreRef.current);
    }

    return () => observer.disconnect();
  }, [hasMore, filteredProducts.length]);

  // 当筛选条件改变时重置显示数量
  useEffect(() => {
    setVisibleCount(ITEMS_PER_PAGE);
  }, [selectedCategories, searchQuery]);

  // 预定义的分类顺序
  const predefinedCategories = [
    "通用助手",
    "图像生成",
    "视频创作",
    "音频处理",
    "编程开发",
    "智能搜索",
    "知识管理",
    "写作辅助",
    "智能硬件",
    "虚拟陪伴",
    "Agent构建",
    "效率工具",
    "3D生成",
    "科研辅助",
    "其他类型",
  ];

  // 构建分类列表（使用预定义顺序，不包含 "all"）
  const categoryList = predefinedCategories.map((cat) => ({
    id: cat,
    label: categoryLabels[cat]?.label || cat,
    icon: categoryLabels[cat]?.icon || "📁",
  }));

  // 切换分类选择
  const toggleCategory = (categoryId: string) => {
    setSelectedCategories((prev) => {
      if (prev.includes(categoryId)) {
        return prev.filter((c) => c !== categoryId);
      } else {
        return [...prev, categoryId];
      }
    });
  };

  // 清除所有筛选
  const clearFilters = () => {
    setSelectedCategories([]);
  };

  return (
    <div className="pt-20 sm:pt-24 pb-16 sm:pb-20 px-4 sm:px-6">
      <div className="max-w-7xl mx-auto">
        {/* Page Header */}
        <div className="mb-6 sm:mb-10">
          <h1 className="text-2xl sm:text-3xl font-bold mb-2 sm:mb-3">分类目录</h1>
          <p className="text-sm sm:text-base text-[var(--muted-foreground)]">
            探索已收录的 {initialProducts.length} 个 AI 产品，发现适合你的工具
          </p>
        </div>

        {/* Search Bar */}
        <div className="mb-6 sm:mb-8">
          <div className="relative max-w-2xl">
            <Search className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-[var(--muted-foreground)]" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 sm:pl-12 pr-4 py-3 sm:py-3.5 bg-[var(--card)] border border-[var(--border)] rounded-xl text-sm focus:outline-none focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary)]/20 transition-all placeholder:text-[var(--muted-foreground)]"
              placeholder="搜索产品名称、功能、分类..."
            />
          </div>
        </div>

        {/* Category Filters - Multi-select with Checkboxes */}
        <div className="mb-6 sm:mb-8">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-medium text-[var(--muted-foreground)] whitespace-nowrap">类别筛选:</span>
            {selectedCategories.length > 0 && (
              <button
                onClick={clearFilters}
                className="text-xs text-[var(--primary)] hover:underline"
              >
                清除筛选 ({selectedCategories.length})
              </button>
            )}
          </div>
          <div className="flex flex-wrap gap-2">
            {/* 全部类型按钮 */}
            <button
              onClick={clearFilters}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm transition-all whitespace-nowrap border ${
                selectedCategories.length === 0
                  ? "bg-[var(--primary)] text-[var(--primary-foreground)] border-[var(--primary)] font-medium"
                  : "bg-[var(--card)] text-[var(--muted-foreground)] border-[var(--border)] hover:border-[var(--primary)] hover:text-[var(--foreground)]"
              }`}
            >
              <div
                className={`w-4 h-4 rounded border flex items-center justify-center transition-all ${
                  selectedCategories.length === 0
                    ? "bg-white border-white"
                    : "border-[var(--muted-foreground)]/50"
                }`}
              >
                {selectedCategories.length === 0 && <Check className="w-3 h-3 text-[var(--primary)]" />}
              </div>
              <span>全部类型</span>
            </button>
            {categoryList.map((cat) => {
              const isSelected = selectedCategories.includes(cat.id);
              return (
                <button
                  key={cat.id}
                  onClick={() => toggleCategory(cat.id)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm transition-all whitespace-nowrap border ${
                    isSelected
                      ? "bg-[var(--primary)] text-[var(--primary-foreground)] border-[var(--primary)] font-medium"
                      : "bg-[var(--card)] text-[var(--muted-foreground)] border-[var(--border)] hover:border-[var(--primary)] hover:text-[var(--foreground)]"
                  }`}
                >
                  <div
                    className={`w-4 h-4 rounded border flex items-center justify-center transition-all ${
                      isSelected
                        ? "bg-white border-white"
                        : "border-[var(--muted-foreground)]/50"
                    }`}
                  >
                    {isSelected && <Check className="w-3 h-3 text-[var(--primary)]" />}
                  </div>
                  <span>{cat.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Product Grid */}
        <div>
          <div className="mb-4 sm:mb-6 flex items-center justify-between">
            <p className="text-xs sm:text-sm text-[var(--muted-foreground)]">
              共 <span className="text-[var(--foreground)] font-medium">{filteredProducts.length}</span> 个产品
              {hasMore && (
                <span className="text-[var(--muted-foreground)]">
                  ，已显示 {visibleProducts.length} 个
                </span>
              )}
            </p>
          </div>

          {filteredProducts.length === 0 ? (
            <div className="text-center py-16 sm:py-20">
              <p className="text-[var(--muted-foreground)]">暂无产品数据</p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4">
                {visibleProducts.map((product, index) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    isVisible={true}
                  />
                ))}
              </div>

              {/* Load More Trigger */}
              {hasMore && (
                <div ref={loadMoreRef} className="flex justify-center py-8">
                  <div className="flex items-center gap-2 text-sm text-[var(--muted-foreground)]">
                    <div className="w-5 h-5 border-2 border-[var(--primary)] border-t-transparent rounded-full animate-spin" />
                    加载更多...
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      <style jsx>{`
        @keyframes fade-in-up {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fade-in-up {
          animation: fade-in-up 0.4s ease-out forwards;
        }
      `}</style>
    </div>
  );
}
