"use client";

import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Link from "next/link";
import {
  ChevronRight,
  Share2,
  Globe,
  Users,
  Target,
  DollarSign,
  ThumbsUp,
  ThumbsDown,
  ChevronDown,
  Layers,
  Loader2,
  Play,
  Pause,
  Headphones,
  Clock,
  Sparkles,
  Bell,
  ArrowRight
} from "lucide-react";
import { useState, useEffect, use, useRef } from "react";
import { getProductBySlug, type Product } from "@/lib/supabase";

// 格式化时长
function formatDuration(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

// 迷你波形可视化
function MiniWaveform({ isPlaying }: { isPlaying: boolean }) {
  const [heights, setHeights] = useState<number[]>([]);

  // 初始化固定高度（确定性）
  useEffect(() => {
    const initialHeights = Array.from({ length: 12 }, (_, i) => 30 + Math.sin(i * 0.6) * 20);
    setHeights(initialHeights);
  }, []);

  // 播放时随机更新高度
  useEffect(() => {
    if (!isPlaying) return;

    const interval = setInterval(() => {
      setHeights(Array.from({ length: 12 }, () => 30 + Math.random() * 70));
    }, 150);

    return () => clearInterval(interval);
  }, [isPlaying]);

  return (
    <div className="flex items-center gap-0.5 h-8">
      {Array.from({ length: 12 }, (_, i) => (
        <div
          key={i}
          className="w-0.5 bg-orange-500 rounded-full transition-all duration-150"
          style={{
            height: `${heights[i] || 30 + Math.sin(i * 0.6) * 20}%`,
            opacity: isPlaying ? 1 : 0.6
          }}
        />
      ))}
    </div>
  );
}

// 深度拆解播客卡片组件
function DeepDiveCard({
  product,
  slug
}: {
  product: Product;
  slug: string;
}) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleTimeUpdate = () => setCurrentTime(audio.currentTime);
    const handleEnded = () => setIsPlaying(false);

    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('ended', handleEnded);

    return () => {
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('ended', handleEnded);
    };
  }, []);

  const togglePlay = () => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isPlaying) {
      audio.pause();
    } else {
      audio.play();
    }
    setIsPlaying(!isPlaying);
  };

  const duration = product.podcast_duration || 300;
  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <div className="rounded-2xl overflow-hidden border border-[var(--border)] bg-gradient-to-br from-orange-500/10 via-[var(--card)] to-amber-500/5">
      {/* 头部标签 */}
      <div className="px-4 py-2 bg-gradient-to-r from-orange-500 to-amber-500 flex items-center gap-2">
        <Sparkles className="w-4 h-4 text-white" />
        <span className="text-sm font-medium text-white">AI 深度拆解</span>
      </div>

      {/* 内容区域 */}
      <div className="p-5">
        {product.podcast_audio_url && (
          <audio ref={audioRef} src={product.podcast_audio_url} preload="metadata" />
        )}

        {/* 标题和描述 */}
        <div className="mb-4">
          <h3 className="font-semibold mb-1">收听播客深度拆解</h3>
          <p className="text-sm text-[var(--muted-foreground)]">
            AI 为你生成的 {product.name} 全方位解读
          </p>
        </div>

        {/* 播放控制区 */}
        {product.podcast_audio_url ? (
          <div className="space-y-3">
            {/* 波形和播放按钮 */}
            <div className="flex items-center gap-4">
              <button
                onClick={togglePlay}
                className="w-12 h-12 rounded-full bg-gradient-to-r from-orange-500 to-amber-500 text-white flex items-center justify-center hover:opacity-90 transition-all active:scale-95 shadow-lg flex-shrink-0"
              >
                {isPlaying ? (
                  <Pause className="w-5 h-5" />
                ) : (
                  <Play className="w-5 h-5 ml-0.5" />
                )}
              </button>
              <div className="flex-1">
                <MiniWaveform isPlaying={isPlaying} />
              </div>
            </div>

            {/* 进度条 */}
            <div className="space-y-1">
              <div className="h-1 bg-[var(--border)] rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-orange-500 to-amber-500 rounded-full transition-all duration-100"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <div className="flex justify-between text-xs text-[var(--muted-foreground)]">
                <span>{formatDuration(Math.floor(currentTime))}</span>
                <span className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {Math.ceil(duration / 60)} 分钟
                </span>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-3 p-3 rounded-lg bg-[var(--secondary)]">
            <Headphones className="w-5 h-5 text-orange-500" />
            <span className="text-sm text-[var(--muted-foreground)]">音频正在生成中...</span>
          </div>
        )}

        {/* 查看完整拆解按钮 */}
        <Link
          href={`/product/${slug}/deep-dive`}
          className="mt-4 w-full inline-flex items-center justify-center gap-2 bg-[var(--secondary)] hover:bg-[var(--muted)] text-[var(--foreground)] px-4 py-2.5 rounded-lg text-sm font-medium transition-colors border border-[var(--border)]"
        >
          查看完整拆解
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </div>
  );
}

// 无深度拆解时的占位卡片
function ComingSoonCard({ product }: { product: Product }) {
  const analysis = product.ai_analysis || {};

  // 提取一些亮点数据
  const highlights: string[] = [];
  if (analysis.strengths && analysis.strengths.length > 0) {
    highlights.push(...analysis.strengths.slice(0, 2));
  }
  if (analysis.features && analysis.features.length > 0) {
    highlights.push(...analysis.features.slice(0, 2).map(f => f.title));
  }

  return (
    <div className="rounded-2xl overflow-hidden border border-[var(--border)] bg-[var(--card)]">
      {/* 头部 - 即将上线 */}
      <div className="px-4 py-3 bg-gradient-to-r from-[var(--secondary)] to-[var(--muted)] border-b border-[var(--border)]">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-[var(--primary)]/10 flex items-center justify-center">
            <Headphones className="w-4 h-4 text-[var(--primary)]" />
          </div>
          <div>
            <p className="text-sm font-medium">深度拆解即将上线</p>
            <p className="text-xs text-[var(--muted-foreground)]">AI 正在为你准备播客内容</p>
          </div>
        </div>
      </div>

      {/* 产品亮点预览 */}
      <div className="p-4">
        <h4 className="text-sm font-medium mb-3 flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-[var(--primary)]" />
          产品亮点
        </h4>

        {highlights.length > 0 ? (
          <ul className="space-y-2">
            {highlights.slice(0, 3).map((item, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-[var(--muted-foreground)]">
                <span className="text-green-500 mt-0.5">✓</span>
                <span className="line-clamp-2">{item}</span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-[var(--muted-foreground)]">
            {product.tagline || '探索这款 AI 产品的独特之处'}
          </p>
        )}

        {/* 订阅通知 */}
        <div className="mt-4 p-3 rounded-lg bg-[var(--secondary)] border border-[var(--border)]">
          <div className="flex items-center gap-2 mb-2">
            <Bell className="w-4 h-4 text-[var(--primary)]" />
            <span className="text-sm font-medium">获取更新通知</span>
          </div>
          <p className="text-xs text-[var(--muted-foreground)] mb-3">
            深度拆解上线后第一时间通知你
          </p>
          <Link
            href="/#subscribe"
            className="w-full inline-flex items-center justify-center gap-2 bg-[var(--primary)] text-[var(--primary-foreground)] px-4 py-2 rounded-lg text-sm font-medium hover:opacity-90 transition-opacity"
          >
            订阅通知
          </Link>
        </div>
      </div>
    </div>
  );
}

// Tab 组件
const tabs = [
  { id: "overview", label: "概览", icon: Layers },
  { id: "alternatives", label: "替代方案", icon: Globe },
];

export default function ProductDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);
  const [activeTab, setActiveTab] = useState("overview");
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadProduct() {
      setLoading(true);
      try {
        const data = await getProductBySlug(slug);
        setProduct(data);
      } catch (error) {
        console.error("Failed to load product:", error);
      } finally {
        setLoading(false);
      }
    }
    loadProduct();
  }, [slug]);

  if (loading) {
    return (
      <>
        <Header />
        <div className="pt-24 pb-20 px-6 flex items-center justify-center min-h-screen">
          <Loader2 className="w-8 h-8 animate-spin text-[var(--muted-foreground)]" />
        </div>
        <Footer />
      </>
    );
  }

  if (!product) {
    return (
      <>
        <Header />
        <div className="pt-24 pb-20 px-6 text-center min-h-screen">
          <h1 className="text-2xl font-bold mb-4">产品未找到</h1>
          <p className="text-[var(--muted-foreground)] mb-6">抱歉，我们找不到这个产品。</p>
          <Link href="/directory" className="text-[var(--primary)] hover:underline">
            返回目录
          </Link>
        </div>
        <Footer />
      </>
    );
  }

  const analysis = product.ai_analysis || {};

  return (
    <>
      <Header />

      <div className="pt-24 pb-20 px-6">
        <div className="max-w-7xl mx-auto">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-sm text-[var(--muted-foreground)] mb-6">
            <Link href="/" className="hover:text-[var(--foreground)] transition-colors">首页</Link>
            <ChevronRight className="w-3.5 h-3.5" />
            <Link href="/directory" className="hover:text-[var(--foreground)] transition-colors">分类目录</Link>
            <ChevronRight className="w-3.5 h-3.5" />
            <span className="text-[var(--foreground)]">{product.name}</span>
          </div>

          {/* Product Header */}
          <div className="grid grid-cols-12 gap-8 mb-8">
            {/* Left: Product Info */}
            <div className="col-span-7">
              <div className="flex items-start gap-5 mb-6">
                {/* Logo */}
                <div className="w-20 h-20 rounded-xl bg-[var(--card)] border border-[var(--border)] flex items-center justify-center overflow-hidden">
                  {product.logo_url ? (
                    <img src={product.logo_url} alt={product.name} className="w-12 h-12 object-contain" />
                  ) : (
                    <span className="text-4xl">🚀</span>
                  )}
                </div>

                <div className="flex-1">
                  <h1 className="text-3xl font-bold mb-2">{product.name}</h1>
                  <p className="text-[var(--muted-foreground)] text-lg mb-4">{product.tagline || "AI 产品"}</p>

                  {/* Category */}
                  {product.category && (
                    <div className="flex items-center gap-3 mb-4">
                      <span className="text-[var(--muted-foreground)] text-sm">分类</span>
                      <span className="px-3 py-1 bg-[var(--secondary)] rounded text-sm">{product.category}</span>
                    </div>
                  )}

                  {/* Tags */}
                  {product.tags && product.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-5">
                      {product.tags.map((tag, i) => (
                        <span
                          key={i}
                          className="px-3 py-1.5 bg-[var(--secondary)] text-[var(--secondary-foreground)] rounded-lg text-xs font-medium border border-[var(--border)]"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex gap-3">
                    {product.website_url && (
                      <a
                        href={product.website_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 bg-[var(--primary)] text-[var(--primary-foreground)] px-5 py-2.5 rounded-lg font-medium text-sm hover:opacity-90 transition-opacity"
                      >
                        访问官网
                      </a>
                    )}
                    <button className="inline-flex items-center gap-2 bg-[var(--secondary)] text-[var(--secondary-foreground)] px-4 py-2.5 rounded-lg text-sm hover:bg-[var(--muted)] transition-colors border border-[var(--border)]">
                      <Share2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Right: Deep Dive Card or Coming Soon */}
            <div className="col-span-5">
              {product.has_deep_dive ? (
                <DeepDiveCard product={product} slug={slug} />
              ) : (
                <ComingSoonCard product={product} />
              )}
            </div>
          </div>

          {/* Tabs */}
          <div className="border-b border-[var(--border)] mb-8">
            <div className="flex gap-1">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-4 py-3 text-sm font-medium transition-colors relative ${
                    activeTab === tab.id
                      ? "text-[var(--foreground)]"
                      : "text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
                  }`}
                >
                  <span className="flex items-center gap-2">
                    <tab.icon className="w-4 h-4" />
                    {tab.label}
                  </span>
                  {activeTab === tab.id && (
                    <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[var(--primary)]"></span>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Main Content */}
          <div className="grid grid-cols-12 gap-8">
            {/* Left: Main Content */}
            <main className="col-span-8">
              {activeTab === "overview" && (
                <div className="space-y-10">
                  {/* What is section */}
                  {analysis.what_is && (
                    <section>
                      <h2 className="text-xl font-semibold mb-4 text-[var(--primary)]">产品概览</h2>
                      <h3 className="text-lg font-semibold mb-3">什么是{product.name}？</h3>
                      <div className="text-[var(--muted-foreground)] leading-relaxed space-y-4">
                        {analysis.what_is.split('\n\n').map((para, i) => (
                          <p key={i}>{para}</p>
                        ))}
                      </div>
                    </section>
                  )}

                  {/* Design Philosophy */}
                  {analysis.design_philosophy && (
                    <section>
                      <h2 className="text-xl font-semibold mb-4 text-[var(--primary)]">设计理念</h2>
                      <p className="text-[var(--muted-foreground)] leading-relaxed">{analysis.design_philosophy}</p>
                    </section>
                  )}

                  {/* Features section */}
                  {analysis.features && analysis.features.length > 0 && (
                    <section>
                      <h2 className="text-xl font-semibold mb-4 text-[var(--primary)]">主要功能</h2>
                      <div className="grid grid-cols-2 gap-4">
                        {analysis.features.map((feature, i) => (
                          <div
                            key={i}
                            className="p-4 rounded-xl bg-[var(--card)] border border-[var(--border)] hover:border-[var(--primary)] transition-colors"
                          >
                            <div className="flex items-start gap-3">
                              <span className="text-2xl">{feature.icon || "✨"}</span>
                              <div>
                                <h4 className="font-semibold mb-1">{feature.title}</h4>
                                <p className="text-sm text-[var(--muted-foreground)]">{feature.description}</p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </section>
                  )}

                  {/* Use Cases section */}
                  {analysis.use_cases && analysis.use_cases.length > 0 && (
                    <section>
                      <h2 className="text-xl font-semibold mb-4 text-[var(--primary)]">使用场景</h2>
                      <div className="space-y-3">
                        {analysis.use_cases.map((useCase, i) => (
                          <div key={i} className="flex gap-3">
                            <div className="w-6 h-6 rounded-full bg-[var(--primary)] flex items-center justify-center flex-shrink-0 mt-0.5">
                              <Target className="w-3 h-3 text-[var(--primary-foreground)]" />
                            </div>
                            <div>
                              <span className="font-medium">{useCase.title}：</span>
                              <span className="text-[var(--muted-foreground)]">{useCase.description}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </section>
                  )}

                  {/* Pricing section */}
                  {(analysis.pricing_model || analysis.pricing_details) && (
                    <section>
                      <h2 className="text-xl font-semibold mb-4 text-[var(--primary)]">定价模式</h2>
                      <div className="p-4 rounded-xl bg-[var(--card)] border border-[var(--border)]">
                        <div className="flex items-center gap-2 mb-2">
                          <DollarSign className="w-5 h-5 text-[var(--primary)]" />
                          <span className="font-semibold">{analysis.pricing_model || "未知"}</span>
                        </div>
                        {analysis.pricing_details && (
                          <p className="text-[var(--muted-foreground)] text-sm">{analysis.pricing_details}</p>
                        )}
                      </div>
                    </section>
                  )}

                  {/* Strengths & Weaknesses */}
                  {((analysis.strengths && analysis.strengths.length > 0) || (analysis.weaknesses && analysis.weaknesses.length > 0)) && (
                    <section>
                      <div className="grid grid-cols-2 gap-6">
                        {analysis.strengths && analysis.strengths.length > 0 && (
                          <div>
                            <h3 className="flex items-center gap-2 font-semibold mb-3">
                              <ThumbsUp className="w-4 h-4 text-green-500" />
                              <span>优势</span>
                            </h3>
                            <ul className="space-y-2">
                              {analysis.strengths.map((item, i) => (
                                <li key={i} className="flex items-start gap-2 text-sm text-[var(--muted-foreground)]">
                                  <span className="text-green-500 mt-1">✓</span>
                                  {item}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                        {analysis.weaknesses && analysis.weaknesses.length > 0 && (
                          <div>
                            <h3 className="flex items-center gap-2 font-semibold mb-3">
                              <ThumbsDown className="w-4 h-4 text-red-400" />
                              <span>不足</span>
                            </h3>
                            <ul className="space-y-2">
                              {analysis.weaknesses.map((item, i) => (
                                <li key={i} className="flex items-start gap-2 text-sm text-[var(--muted-foreground)]">
                                  <span className="text-red-400 mt-1">✗</span>
                                  {item}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    </section>
                  )}

                  {/* FAQ section */}
                  {analysis.faqs && analysis.faqs.length > 0 && (
                    <section>
                      <h2 className="text-xl font-semibold mb-4 text-[var(--primary)]">常见问题</h2>
                      <div className="space-y-2">
                        {analysis.faqs.map((faq, i) => (
                          <div
                            key={i}
                            className="rounded-xl bg-[var(--card)] border border-[var(--border)] overflow-hidden"
                          >
                            <button
                              onClick={() => setExpandedFaq(expandedFaq === i ? null : i)}
                              className="w-full px-4 py-3 flex items-center justify-between text-left hover:bg-[var(--secondary)] transition-colors"
                            >
                              <span className="font-medium text-sm">{i + 1}. {faq.question}</span>
                              <ChevronDown className={`w-4 h-4 transition-transform ${expandedFaq === i ? "rotate-180" : ""}`} />
                            </button>
                            {expandedFaq === i && (
                              <div className="px-4 pb-4 text-sm text-[var(--muted-foreground)]">
                                {faq.answer}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </section>
                  )}
                </div>
              )}

              {activeTab === "alternatives" && (
                <div className="space-y-4">
                  <h2 className="text-xl font-semibold mb-4">{product.name} 的替代方案</h2>
                  {analysis.alternatives && analysis.alternatives.length > 0 ? (
                    analysis.alternatives.map((alt, i) => (
                      <div
                        key={i}
                        className="p-4 rounded-xl bg-[var(--card)] border border-[var(--border)] hover:border-[var(--primary)] transition-colors"
                      >
                        <div className="flex items-center gap-3 mb-2">
                          <div className="w-10 h-10 rounded-lg bg-[var(--secondary)] flex items-center justify-center">
                            <span className="text-lg">🔄</span>
                          </div>
                          <h3 className="font-semibold">{alt.name}</h3>
                        </div>
                        <p className="text-sm text-[var(--muted-foreground)]">{alt.description}</p>
                      </div>
                    ))
                  ) : (
                    <p className="text-[var(--muted-foreground)]">暂无替代方案数据</p>
                  )}
                </div>
              )}
            </main>

            {/* Right Sidebar */}
            <aside className="col-span-4">
              <div className="sticky top-24">
                {/* Alternatives */}
                {analysis.alternatives && analysis.alternatives.length > 0 && (
                  <>
                    <h3 className="text-lg font-semibold mb-4 text-[var(--primary)]">{product.name}的替代方案</h3>
                    <div className="space-y-3">
                      {analysis.alternatives.slice(0, 4).map((alt, i) => (
                        <div
                          key={i}
                          className="p-4 rounded-xl bg-[var(--card)] border border-[var(--border)] hover:border-[var(--primary)] transition-colors cursor-pointer card-hover"
                        >
                          <div className="flex items-start gap-3">
                            <div className="w-10 h-10 rounded-lg bg-[var(--secondary)] flex items-center justify-center flex-shrink-0">
                              <span className="text-lg">✨</span>
                            </div>
                            <div className="flex-1 min-w-0">
                              <h4 className="font-semibold text-sm mb-1">{alt.name}</h4>
                              <p className="text-xs text-[var(--muted-foreground)] line-clamp-2">{alt.description}</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </>
                )}

                {/* Target Users */}
                {analysis.target_users && analysis.target_users.length > 0 && (
                  <div className="mt-8">
                    <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                      <Users className="w-4 h-4 text-[var(--primary)]" />
                      目标用户
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {analysis.target_users.map((user, i) => (
                        <span
                          key={i}
                          className="px-3 py-1.5 bg-[var(--secondary)] rounded-lg text-xs border border-[var(--border)]"
                        >
                          {user}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </aside>
          </div>
        </div>
      </div>

      <Footer />
    </>
  );
}
