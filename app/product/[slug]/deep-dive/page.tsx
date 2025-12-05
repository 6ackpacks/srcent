"use client";

import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Link from "next/link";
import {
  ChevronRight,
  Play,
  Pause,
  Volume2,
  VolumeX,
  ExternalLink,
  Sparkles,
  Clock,
  ArrowLeft
} from "lucide-react";
import { useState, useEffect, useRef, use, type ReactNode } from "react";
import { getProductBySlug, getSourceArticles, type Product, type SourceArticle } from "@/lib/supabase";

// 格式化时长
function formatDuration(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

// 简单的 Markdown 渲染 (不依赖外部库)
function renderMarkdown(text: string): ReactNode[] {
  const lines = text.split('\n');
  const elements: ReactNode[] = [];
  let key = 0;

  for (const line of lines) {
    if (line.startsWith('# ')) {
      elements.push(
        <h1 key={key++} className="text-3xl font-bold mb-6 mt-8 first:mt-0 text-[var(--foreground)]">
          {line.slice(2)}
        </h1>
      );
    } else if (line.startsWith('## ')) {
      elements.push(
        <h2 key={key++} className="text-xl font-semibold mb-4 mt-8 text-[var(--primary)]">
          {line.slice(3)}
        </h2>
      );
    } else if (line.startsWith('### ')) {
      elements.push(
        <h3 key={key++} className="text-lg font-medium mb-3 mt-6 text-[var(--foreground)]">
          {line.slice(4)}
        </h3>
      );
    } else if (line.startsWith('- ')) {
      elements.push(
        <li key={key++} className="ml-4 mb-2 text-[var(--muted-foreground)] list-disc">
          {line.slice(2)}
        </li>
      );
    } else if (line.startsWith('**') && line.endsWith('**')) {
      elements.push(
        <p key={key++} className="font-semibold mb-3 text-[var(--foreground)]">
          {line.slice(2, -2)}
        </p>
      );
    } else if (line.trim()) {
      elements.push(
        <p key={key++} className="mb-4 text-[var(--muted-foreground)] leading-relaxed">
          {line}
        </p>
      );
    }
  }

  return elements;
}

// 波形可视化组件
function WaveformVisualizer({ isPlaying }: { isPlaying: boolean }) {
  return (
    <div className="flex items-center justify-center gap-1 h-16">
      {[...Array(20)].map((_, i) => (
        <div
          key={i}
          className={`w-1 bg-[var(--primary)] rounded-full transition-all duration-150 ${
            isPlaying ? 'animate-pulse' : ''
          }`}
          style={{
            height: isPlaying
              ? `${Math.random() * 100}%`
              : `${20 + Math.sin(i * 0.5) * 15}%`,
            animationDelay: `${i * 50}ms`,
            opacity: isPlaying ? 1 : 0.5
          }}
        />
      ))}
    </div>
  );
}

// 播放器组件
function PodcastPlayer({
  audioUrl,
  duration,
  productName
}: {
  audioUrl: string;
  duration: number;
  productName: string;
}) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [isMuted, setIsMuted] = useState(false);

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

  const toggleMute = () => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.muted = !isMuted;
    setIsMuted(!isMuted);
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const audio = audioRef.current;
    if (!audio) return;
    const time = Number(e.target.value);
    audio.currentTime = time;
    setCurrentTime(time);
  };

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[var(--card)] to-[var(--secondary)] border border-[var(--border)] p-8 backdrop-blur-xl">
      {/* 背景装饰 */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-0 left-0 w-64 h-64 bg-[var(--primary)] rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-[var(--primary)] rounded-full blur-3xl" />
      </div>

      <audio ref={audioRef} src={audioUrl} preload="metadata" />

      {/* 标题 */}
      <div className="relative z-10 text-center mb-6">
        <p className="text-sm text-[var(--muted-foreground)] mb-2">正在收听</p>
        <h2 className="text-xl font-semibold">{productName} 深度拆解</h2>
      </div>

      {/* 波形可视化 */}
      <div className="relative z-10 mb-6">
        <WaveformVisualizer isPlaying={isPlaying} />
      </div>

      {/* 进度条 */}
      <div className="relative z-10 mb-4">
        <input
          type="range"
          min={0}
          max={duration}
          value={currentTime}
          onChange={handleSeek}
          className="w-full h-1 bg-[var(--border)] rounded-full appearance-none cursor-pointer
            [&::-webkit-slider-thumb]:appearance-none
            [&::-webkit-slider-thumb]:w-3
            [&::-webkit-slider-thumb]:h-3
            [&::-webkit-slider-thumb]:bg-[var(--primary)]
            [&::-webkit-slider-thumb]:rounded-full
            [&::-webkit-slider-thumb]:cursor-pointer
            [&::-webkit-slider-thumb]:transition-transform
            [&::-webkit-slider-thumb]:hover:scale-125"
          style={{
            background: `linear-gradient(to right, var(--primary) ${progress}%, var(--border) ${progress}%)`
          }}
        />
        <div className="flex justify-between text-xs text-[var(--muted-foreground)] mt-2">
          <span>{formatDuration(Math.floor(currentTime))}</span>
          <span>{formatDuration(duration)}</span>
        </div>
      </div>

      {/* 控制按钮 */}
      <div className="relative z-10 flex items-center justify-center gap-6">
        <button
          onClick={toggleMute}
          className="p-3 rounded-full hover:bg-[var(--secondary)] transition-colors"
        >
          {isMuted ? (
            <VolumeX className="w-5 h-5 text-[var(--muted-foreground)]" />
          ) : (
            <Volume2 className="w-5 h-5 text-[var(--muted-foreground)]" />
          )}
        </button>

        <button
          onClick={togglePlay}
          className="w-16 h-16 rounded-full bg-[var(--primary)] text-[var(--primary-foreground)] flex items-center justify-center hover:opacity-90 transition-all active:scale-95 shadow-lg"
        >
          {isPlaying ? (
            <Pause className="w-6 h-6" />
          ) : (
            <Play className="w-6 h-6 ml-1" />
          )}
        </button>

        <div className="p-3 flex items-center gap-1 text-xs text-[var(--muted-foreground)]">
          <Clock className="w-4 h-4" />
          <span>{Math.ceil(duration / 60)} 分钟</span>
        </div>
      </div>
    </div>
  );
}

// 来源卡片组件
function SourceCard({ source }: { source: SourceArticle }) {
  return (
    <a
      href={source.url}
      target="_blank"
      rel="noopener noreferrer"
      className="group block p-4 rounded-xl bg-[var(--card)] border border-[var(--border)] hover:border-[var(--primary)] transition-all hover:-translate-y-1"
    >
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex-1 min-w-0">
          <p className="text-xs text-[var(--muted-foreground)] mb-1">
            {source.source_name || '参考来源'}
          </p>
          <h4 className="font-medium text-sm line-clamp-2 group-hover:text-[var(--primary)] transition-colors">
            {source.title || '查看原文'}
          </h4>
        </div>
        <ExternalLink className="w-4 h-4 text-[var(--muted-foreground)] flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" />
      </div>
      {source.key_insight && (
        <div className="flex items-start gap-2 p-3 rounded-lg bg-[var(--secondary)]">
          <Sparkles className="w-4 h-4 text-[var(--primary)] flex-shrink-0 mt-0.5" />
          <p className="text-xs text-[var(--muted-foreground)] leading-relaxed">
            {source.key_insight}
          </p>
        </div>
      )}
    </a>
  );
}

export default function DeepDivePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);
  const [product, setProduct] = useState<Product | null>(null);
  const [sources, setSources] = useState<SourceArticle[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      try {
        const productData = await getProductBySlug(slug);
        setProduct(productData);

        if (productData?.id) {
          const sourcesData = await getSourceArticles(productData.id);
          setSources(sourcesData);
        }
      } catch (error) {
        console.error("Failed to load data:", error);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [slug]);

  if (loading) {
    return (
      <>
        <Header />
        <div className="pt-24 pb-20 px-6 flex items-center justify-center min-h-screen">
          <div className="flex flex-col items-center gap-4">
            <div className="w-12 h-12 rounded-full border-2 border-[var(--primary)] border-t-transparent animate-spin" />
            <p className="text-[var(--muted-foreground)]">加载中...</p>
          </div>
        </div>
        <Footer />
      </>
    );
  }

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

  return (
    <>
      <Header />

      <div className="pt-24 pb-20 px-6">
        <div className="max-w-4xl mx-auto">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-sm text-[var(--muted-foreground)] mb-8">
            <Link href="/" className="hover:text-[var(--foreground)] transition-colors">首页</Link>
            <ChevronRight className="w-3.5 h-3.5" />
            <Link href="/directory" className="hover:text-[var(--foreground)] transition-colors">分类目录</Link>
            <ChevronRight className="w-3.5 h-3.5" />
            <Link href={`/product/${slug}`} className="hover:text-[var(--foreground)] transition-colors">{product.name}</Link>
            <ChevronRight className="w-3.5 h-3.5" />
            <span className="text-[var(--foreground)]">深度拆解</span>
          </div>

          {/* 返回链接 */}
          <Link
            href={`/product/${slug}`}
            className="inline-flex items-center gap-2 text-sm text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors mb-8"
          >
            <ArrowLeft className="w-4 h-4" />
            返回 {product.name}
          </Link>

          {/* Hero 区域 */}
          <div className="mb-12 animate-fade-in">
            <div className="flex items-center gap-4 mb-6">
              {product.logo_url && (
                <div className="w-16 h-16 rounded-xl bg-[var(--card)] border border-[var(--border)] flex items-center justify-center overflow-hidden">
                  <img src={product.logo_url} alt={product.name} className="w-10 h-10 object-contain" />
                </div>
              )}
              <div>
                <h1 className="text-2xl font-bold">{product.name}</h1>
                <p className="text-[var(--muted-foreground)]">{product.tagline}</p>
              </div>
            </div>

            {/* 播放器 */}
            {product.podcast_audio_url && (
              <PodcastPlayer
                audioUrl={product.podcast_audio_url}
                duration={product.podcast_duration || 300}
                productName={product.name}
              />
            )}
          </div>

          {/* 主内容区域 */}
          <div className="grid grid-cols-12 gap-8">
            {/* 文稿内容 */}
            <main className="col-span-8">
              <div className="prose prose-lg max-w-none">
                <h2 className="text-xl font-semibold mb-6 text-[var(--primary)] flex items-center gap-2">
                  <span className="w-8 h-8 rounded-full bg-[var(--primary)] text-[var(--primary-foreground)] flex items-center justify-center text-sm">
                    📝
                  </span>
                  播客文稿
                </h2>
                <div className="bg-[var(--card)] rounded-xl border border-[var(--border)] p-6 md:p-8">
                  {product.podcast_transcript ? (
                    <div className="space-y-0">
                      {renderMarkdown(product.podcast_transcript)}
                    </div>
                  ) : (
                    <p className="text-[var(--muted-foreground)]">暂无文稿内容</p>
                  )}
                </div>
              </div>
            </main>

            {/* 侧边栏 - 灵感来源 */}
            <aside className="col-span-4">
              <div className="sticky top-24">
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-[var(--primary)]" />
                  灵感来源
                </h3>
                <p className="text-sm text-[var(--muted-foreground)] mb-4">
                  本次深度拆解综合了以下 {sources.length} 篇文章的精华观点
                </p>
                <div className="space-y-3">
                  {sources.map((source) => (
                    <SourceCard key={source.id} source={source} />
                  ))}
                </div>

                {/* 访问官网 */}
                {product.website_url && (
                  <a
                    href={product.website_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-6 w-full inline-flex items-center justify-center gap-2 bg-[var(--primary)] text-[var(--primary-foreground)] px-4 py-3 rounded-lg font-medium text-sm hover:opacity-90 transition-opacity"
                  >
                    访问 {product.name} 官网
                    <ExternalLink className="w-4 h-4" />
                  </a>
                )}
              </div>
            </aside>
          </div>
        </div>
      </div>

      <Footer />

      <style jsx>{`
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fade-in {
          animation: fade-in 0.6s ease-out;
        }
      `}</style>
    </>
  );
}
