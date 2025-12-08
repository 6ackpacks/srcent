"use client";

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
import { useState, useEffect, useRef, type ReactNode } from "react";
import { type Product, type SourceArticle } from "@/lib/supabase";

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

// 波形可视化组件 - 修复 hydration 问题
function WaveformVisualizer({ isPlaying }: { isPlaying: boolean }) {
  const [heights, setHeights] = useState<number[]>([]);

  // 初始化静态高度
  useEffect(() => {
    const initialHeights = Array.from({ length: 20 }, (_, i) => 20 + Math.sin(i * 0.5) * 15);
    setHeights(initialHeights);
  }, []);

  // 播放时动态更新
  useEffect(() => {
    if (!isPlaying) return;
    const interval = setInterval(() => {
      setHeights(Array.from({ length: 20 }, () => 20 + Math.random() * 80));
    }, 150);
    return () => clearInterval(interval);
  }, [isPlaying]);

  return (
    <div className="flex items-center justify-center gap-1 h-16">
      {heights.map((height, i) => (
        <div
          key={i}
          className="w-1 bg-[var(--primary)] rounded-full transition-all duration-150"
          style={{
            height: `${height}%`,
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
    <div className="relative overflow-hidden rounded-xl sm:rounded-2xl bg-gradient-to-br from-[var(--card)] to-[var(--secondary)] border border-[var(--border)] p-4 sm:p-6 md:p-8 backdrop-blur-xl">
      {/* 背景装饰 */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-0 left-0 w-32 sm:w-64 h-32 sm:h-64 bg-[var(--primary)] rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-0 w-48 sm:w-96 h-48 sm:h-96 bg-[var(--primary)] rounded-full blur-3xl" />
      </div>

      <audio ref={audioRef} src={audioUrl} preload="metadata" />

      {/* 标题 */}
      <div className="relative z-10 text-center mb-4 sm:mb-6">
        <p className="text-xs sm:text-sm text-[var(--muted-foreground)] mb-1 sm:mb-2">正在收听</p>
        <h2 className="text-base sm:text-xl font-semibold truncate px-4">{productName} 深度拆解</h2>
      </div>

      {/* 波形可视化 */}
      <div className="relative z-10 mb-4 sm:mb-6">
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
      <div className="relative z-10 flex items-center justify-center gap-4 sm:gap-6">
        <button
          onClick={toggleMute}
          className="p-2 sm:p-3 rounded-full hover:bg-[var(--secondary)] transition-colors"
        >
          {isMuted ? (
            <VolumeX className="w-4 h-4 sm:w-5 sm:h-5 text-[var(--muted-foreground)]" />
          ) : (
            <Volume2 className="w-4 h-4 sm:w-5 sm:h-5 text-[var(--muted-foreground)]" />
          )}
        </button>

        <button
          onClick={togglePlay}
          className="w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-[var(--primary)] text-[var(--primary-foreground)] flex items-center justify-center hover:opacity-90 transition-all active:scale-95 shadow-lg"
        >
          {isPlaying ? (
            <Pause className="w-5 h-5 sm:w-6 sm:h-6" />
          ) : (
            <Play className="w-5 h-5 sm:w-6 sm:h-6 ml-0.5 sm:ml-1" />
          )}
        </button>

        <div className="p-2 sm:p-3 flex items-center gap-1 text-xs text-[var(--muted-foreground)]">
          <Clock className="w-3 h-3 sm:w-4 sm:h-4" />
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

interface DeepDiveClientProps {
  product: Product;
  sources: SourceArticle[];
  slug: string;
}

export default function DeepDiveClient({ product, sources, slug }: DeepDiveClientProps) {
  return (
    <div className="pt-20 sm:pt-24 pb-16 sm:pb-20 px-4 sm:px-6">
      <div className="max-w-4xl mx-auto">
        {/* Breadcrumb - 移动端隐藏部分 */}
        <div className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm text-[var(--muted-foreground)] mb-6 sm:mb-8 overflow-x-auto">
          <Link href="/" className="hover:text-[var(--foreground)] transition-colors whitespace-nowrap">首页</Link>
          <ChevronRight className="w-3 h-3 sm:w-3.5 sm:h-3.5 flex-shrink-0" />
          <Link href="/directory" className="hover:text-[var(--foreground)] transition-colors whitespace-nowrap hidden sm:inline">分类目录</Link>
          <ChevronRight className="w-3 h-3 sm:w-3.5 sm:h-3.5 flex-shrink-0 hidden sm:inline" />
          <Link href={`/product/${slug}`} className="hover:text-[var(--foreground)] transition-colors whitespace-nowrap truncate max-w-[100px] sm:max-w-none">{product.name}</Link>
          <ChevronRight className="w-3 h-3 sm:w-3.5 sm:h-3.5 flex-shrink-0" />
          <span className="text-[var(--foreground)] whitespace-nowrap">深度拆解</span>
        </div>

        {/* 返回链接 */}
        <Link
          href={`/product/${slug}`}
          className="inline-flex items-center gap-2 text-sm text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors mb-6 sm:mb-8"
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="hidden sm:inline">返回 {product.name}</span>
          <span className="sm:hidden">返回</span>
        </Link>

        {/* Hero 区域 */}
        <div className="mb-8 sm:mb-12 animate-fade-in">
          <div className="flex items-center gap-3 sm:gap-4 mb-4 sm:mb-6">
            {product.logo_url && (
              <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-xl bg-[var(--card)] border border-[var(--border)] flex items-center justify-center overflow-hidden flex-shrink-0">
                <img src={product.logo_url} alt={product.name} className="w-8 h-8 sm:w-10 sm:h-10 object-contain" />
              </div>
            )}
            <div className="min-w-0">
              <h1 className="text-xl sm:text-2xl font-bold truncate">{product.name}</h1>
              <p className="text-sm sm:text-base text-[var(--muted-foreground)] line-clamp-2">{product.tagline}</p>
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

        {/* 主内容区域 - 响应式布局 */}
        <div className="flex flex-col lg:grid lg:grid-cols-12 gap-6 lg:gap-8">
          {/* 文稿内容 */}
          <main className="lg:col-span-8 order-2 lg:order-1">
            <div className="prose prose-lg max-w-none">
              <h2 className="text-lg sm:text-xl font-semibold mb-4 sm:mb-6 text-[var(--primary)] flex items-center gap-2">
                <span className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-[var(--primary)] text-[var(--primary-foreground)] flex items-center justify-center text-xs sm:text-sm">
                  📝
                </span>
                播客文稿
              </h2>
              <div className="bg-[var(--card)] rounded-xl border border-[var(--border)] p-4 sm:p-6 md:p-8">
                {product.podcast_transcript ? (
                  <div className="space-y-0 text-sm sm:text-base">
                    {renderMarkdown(product.podcast_transcript)}
                  </div>
                ) : (
                  <p className="text-[var(--muted-foreground)]">暂无文稿内容</p>
                )}
              </div>
            </div>
          </main>

          {/* 侧边栏 - 灵感来源 */}
          <aside className="lg:col-span-4 order-1 lg:order-2">
            <div className="lg:sticky lg:top-24">
              <h3 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4 flex items-center gap-2">
                <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 text-[var(--primary)]" />
                灵感来源
              </h3>
              <p className="text-xs sm:text-sm text-[var(--muted-foreground)] mb-3 sm:mb-4">
                本次深度拆解综合了以下 {sources.length} 篇文章的精华观点
              </p>

              {/* 移动端横向滚动，桌面端垂直列表 */}
              <div className="flex lg:flex-col gap-3 overflow-x-auto lg:overflow-x-visible pb-2 lg:pb-0 -mx-4 px-4 lg:mx-0 lg:px-0">
                {sources.map((source) => (
                  <div key={source.id} className="flex-shrink-0 w-[280px] sm:w-[300px] lg:w-full">
                    <SourceCard source={source} />
                  </div>
                ))}
              </div>

              {/* 访问官网 */}
              {product.website_url && (
                <a
                  href={product.website_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-4 sm:mt-6 w-full inline-flex items-center justify-center gap-2 bg-[var(--primary)] text-[var(--primary-foreground)] px-4 py-2.5 sm:py-3 rounded-lg font-medium text-sm hover:opacity-90 transition-opacity"
                >
                  访问 {product.name} 官网
                  <ExternalLink className="w-4 h-4" />
                </a>
              )}
            </div>
          </aside>
        </div>
      </div>

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
    </div>
  );
}
