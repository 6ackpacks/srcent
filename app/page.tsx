"use client";

import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Link from "next/link";
import {
  ArrowRight,
  Check,
  Headphones,
  Brain,
  Target,
} from "lucide-react";
import { useEffect, useState, useRef } from "react";
import { getProducts, getDeepDiveProducts, type Product } from "@/lib/supabase";

export default function Home() {
  const [isLoaded, setIsLoaded] = useState(false);
  const [email, setEmail] = useState("");
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [deepDiveProducts, setDeepDiveProducts] = useState<Product[]>([]);

  useEffect(() => {
    setIsLoaded(true);
    loadData();
  }, []);

  async function loadData() {
    try {
      const [allProducts, ddProducts] = await Promise.all([
        getProducts(),
        getDeepDiveProducts(),
      ]);
      setProducts(allProducts);
      setDeepDiveProducts(ddProducts);
    } catch (error) {
      console.error("Failed to load data:", error);
    }
  }

  const handleSubscribe = () => {
    if (email && email.includes("@")) {
      setIsSubscribed(true);
      setTimeout(() => {
        setIsSubscribed(false);
        setEmail("");
      }, 2000);
    }
  };

  const scrollToFeatures = () => {
    document.getElementById("features")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <>
      <Header />

      {/* Hero Section - Full Height */}
      <section className="relative flex h-[calc(100vh-80px)] w-full items-center justify-center px-6">
        <div className="container mx-auto">
          <div className="grid grid-cols-1 items-center gap-8 md:grid-cols-2">
            {/* Left: Content */}
            <div className="ml-0 md:ml-10 flex flex-col gap-4">
              <h1
                className={`font-normal max-w-lg text-left text-5xl tracking-tighter md:text-7xl transition-all duration-700 ${
                  isLoaded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
                }`}
              >
                srcent
              </h1>

              <div
                className={`font-light text-lg md:text-2xl transition-all duration-700 delay-100 ${
                  isLoaded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
                }`}
              >
                <b className="font-semibold text-orange-500 text-xl md:text-3xl">
                  AI 产品发现平台
                </b>{" "}
                / 洞察设计灵魂，解读产品价值
              </div>

              <div
                className={`flex flex-row items-center gap-4 pt-4 transition-all duration-700 delay-200 ${
                  isLoaded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
                }`}
              >
                <Link
                  href="/directory"
                  className="inline-flex items-center justify-center h-11 px-8 bg-[var(--primary)] text-[var(--primary-foreground)] rounded-full text-sm font-medium hover:bg-[var(--primary)]/90 transition-all duration-300"
                >
                  探索产品
                </Link>
                <button
                  onClick={scrollToFeatures}
                  className="inline-flex items-center justify-center h-11 px-8 border border-[var(--border)] bg-[var(--background)] rounded-full text-sm font-medium hover:bg-[var(--secondary)] transition-all duration-300 select-none"
                >
                  了解更多
                </button>
              </div>
            </div>

            {/* Right: Visual */}
            <div
              className={`flex items-center justify-center transition-all duration-700 delay-300 ${
                isLoaded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
              }`}
            >
              <div className="relative w-full max-w-xl lg:max-w-2xl">
                {/* Main visual */}
                <div className="w-full rounded-3xl flex items-center justify-center overflow-hidden">
                  <img
                    src="/pic.png"
                    alt="AI 产品实验室"
                    className="w-full h-auto object-contain"
                  />
                </div>
              </div>
            </div>

            {/* Scroll Indicator - memene style */}
            <div
              className={`w-fit absolute inset-x-0 bottom-8 mx-auto transition-all duration-700 delay-500 ${
                isLoaded ? "opacity-100" : "opacity-0"
              }`}
            >
              <button
                onClick={scrollToFeatures}
                className="group relative grid justify-center rounded-full border-2 border-orange-500/50 pt-2 h-12 w-8 hover:border-orange-500 transition-colors duration-300"
              >
                <div className="animate-scroll-bounce rounded-full bg-orange-500/70 h-3 w-1" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Email Subscription Section */}
      <section className="my-20 flex items-center justify-center px-4 py-16">
        <div className="mx-auto w-full max-w-xl text-center">
          <h2 className="mb-6 text-3xl font-bold">订阅 AI 产品日报</h2>
          <p className="mb-8 text-[var(--muted-foreground)]">
            每周精选优质 AI 产品，深度解析设计理念与使用场景
          </p>
          <div className="mx-auto flex max-w-md items-center gap-2">
            <div className="relative flex-1">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSubscribe()}
                className="flex h-11 w-full border border-[var(--border)] bg-transparent px-4 py-1 text-sm transition-colors focus:outline-none focus:ring-0 focus:border-orange-500 rounded-full"
                placeholder="输入邮箱地址"
              />
              <button
                onClick={handleSubscribe}
                className="absolute -right-1 top-1/2 -translate-y-1/2 h-11 px-6 bg-[var(--primary)] text-[var(--primary-foreground)] rounded-full text-sm font-medium hover:bg-[var(--primary)]/90 transition-all"
              >
                {isSubscribed ? "已订阅" : "立即订阅"}
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section - memene style */}
      <section id="features" className="max-w-6xl mx-auto space-y-20 px-6 pt-20">
        {/* Feature 1: AI Analysis */}
        <div className="grid grid-cols-1 items-center gap-12 rounded-lg py-8 lg:grid-cols-2">
          <div className="flex flex-col gap-10 lg:order-1">
            <div className="flex flex-col gap-4">
              <div className="flex flex-col gap-2">
                <h2 className="font-normal max-w-xl text-left text-2xl tracking-tighter lg:text-4xl">
                  AI 智能分析
                </h2>
                <p className="text-md max-w-xl text-left leading-relaxed tracking-tight text-[var(--muted-foreground)]">
                  基于大语言模型，深度解析每个 AI 产品的设计理念、核心功能与目标用户
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 items-start gap-6 lg:pl-6">
              <div className="flex flex-row items-start gap-6 group cursor-pointer">
                <Check className="mt-2 h-4 w-4 text-orange-500 transition-transform group-hover:scale-125" />
                <div className="flex flex-col gap-1">
                  <p className="font-medium">设计理念洞察</p>
                  <p className="text-sm text-[var(--muted-foreground)]">
                    挖掘产品背后的设计哲学，理解创始团队的愿景与思考
                  </p>
                </div>
              </div>
              <div className="flex flex-row items-start gap-6 group cursor-pointer">
                <Check className="mt-2 h-4 w-4 text-orange-500 transition-transform group-hover:scale-125" />
                <div className="flex flex-col gap-1">
                  <p className="font-medium">功能深度拆解</p>
                  <p className="text-sm text-[var(--muted-foreground)]">
                    逐一分析核心功能，对比竞品优劣势，给出客观评价
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-center lg:order-2">
            <div className="aspect-square w-full max-w-[20rem] rounded-xl bg-[var(--muted)] overflow-hidden transition-transform duration-300 hover:scale-105">
              <div className="w-full h-full flex items-center justify-center">
                <div className="text-center space-y-4">
                  <Brain className="w-24 h-24 mx-auto text-orange-500" />
                  <p className="text-[var(--muted-foreground)] text-lg">AI 驱动分析</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Feature 2: Podcast Deep Dive */}
        <div className="grid grid-cols-1 items-center gap-12 rounded-lg py-8 lg:grid-cols-2">
          <div className="flex flex-col gap-10 lg:order-2">
            <div className="flex flex-col gap-4">
              <div className="flex flex-col gap-2">
                <h2 className="font-normal max-w-xl text-left text-2xl tracking-tighter lg:text-4xl">
                  播客深度拆解
                </h2>
                <p className="text-md max-w-xl text-left leading-relaxed tracking-tight text-[var(--muted-foreground)]">
                  将多篇行业文章精华提炼，生成双人对话播客，边听边学
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 items-start gap-6 lg:pl-6">
              <div className="flex flex-row items-start gap-6 group cursor-pointer">
                <Check className="mt-2 h-4 w-4 text-orange-500 transition-transform group-hover:scale-125" />
                <div className="flex flex-col gap-1">
                  <p className="font-medium">多源信息整合</p>
                  <p className="text-sm text-[var(--muted-foreground)]">
                    聚合行业文章、媒体报道、用户评价，多角度呈现产品全貌
                  </p>
                </div>
              </div>
              <div className="flex flex-row items-start gap-6 group cursor-pointer">
                <Check className="mt-2 h-4 w-4 text-orange-500 transition-transform group-hover:scale-125" />
                <div className="flex flex-col gap-1">
                  <p className="font-medium">AI 语音播客</p>
                  <p className="text-sm text-[var(--muted-foreground)]">
                    双人对话形式，轻松愉快地了解产品精髓，适合通勤收听
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-center lg:order-1">
            <div className="aspect-square w-full max-w-[20rem] rounded-xl bg-[var(--muted)] overflow-hidden transition-transform duration-300 hover:scale-105">
              <div className="w-full h-full flex items-center justify-center">
                <div className="text-center space-y-4">
                  <Headphones className="w-24 h-24 mx-auto text-orange-500" />
                  <p className="text-[var(--muted-foreground)] text-lg">播客拆解</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Feature 3: Smart Discovery */}
        <div className="grid grid-cols-1 items-center gap-12 rounded-lg py-8 lg:grid-cols-2">
          <div className="flex flex-col gap-10 lg:order-1">
            <div className="flex flex-col gap-4">
              <div className="flex flex-col gap-2">
                <h2 className="font-normal max-w-xl text-left text-2xl tracking-tighter lg:text-4xl">
                  智能发现推荐
                </h2>
                <p className="text-md max-w-xl text-left leading-relaxed tracking-tight text-[var(--muted-foreground)]">
                  根据你的兴趣和使用场景，精准推荐最适合的 AI 工具
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 items-start gap-6 lg:pl-6">
              <div className="flex flex-row items-start gap-6 group cursor-pointer">
                <Check className="mt-2 h-4 w-4 text-orange-500 transition-transform group-hover:scale-125" />
                <div className="flex flex-col gap-1">
                  <p className="font-medium">分类导航</p>
                  <p className="text-sm text-[var(--muted-foreground)]">
                    文本、图像、视频、代码... 按需求快速找到目标产品
                  </p>
                </div>
              </div>
              <div className="flex flex-row items-start gap-6 group cursor-pointer">
                <Check className="mt-2 h-4 w-4 text-orange-500 transition-transform group-hover:scale-125" />
                <div className="flex flex-col gap-1">
                  <p className="font-medium">替代方案对比</p>
                  <p className="text-sm text-[var(--muted-foreground)]">
                    每个产品都有替代方案推荐，帮你做出最佳选择
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-center lg:order-2">
            <div className="aspect-square w-full max-w-[20rem] rounded-xl bg-[var(--muted)] overflow-hidden transition-transform duration-300 hover:scale-105">
              <div className="w-full h-full flex items-center justify-center">
                <div className="text-center space-y-4">
                  <Target className="w-24 h-24 mx-auto text-orange-500" />
                  <p className="text-[var(--muted-foreground)] text-lg">精准推荐</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-24 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-3 gap-8 text-center">
            <div className="space-y-2 group cursor-pointer">
              <p className="text-5xl md:text-6xl font-bold bg-gradient-to-br from-orange-500 to-orange-700 bg-clip-text text-transparent group-hover:scale-110 transition-transform duration-300 inline-block">
                {products.length}+
              </p>
              <p className="text-[var(--muted-foreground)] text-lg">收录产品</p>
            </div>
            <div className="space-y-2 group cursor-pointer">
              <p className="text-5xl md:text-6xl font-bold bg-gradient-to-br from-orange-500 to-orange-700 bg-clip-text text-transparent group-hover:scale-110 transition-transform duration-300 inline-block">
                {deepDiveProducts.length}
              </p>
              <p className="text-[var(--muted-foreground)] text-lg">播客拆解</p>
            </div>
            <div className="space-y-2 group cursor-pointer">
              <p className="text-5xl md:text-6xl font-bold bg-gradient-to-br from-orange-500 to-orange-700 bg-clip-text text-transparent group-hover:scale-110 transition-transform duration-300 inline-block">
                10+
              </p>
              <p className="text-[var(--muted-foreground)] text-lg">产品分类</p>
            </div>
          </div>
        </div>
      </section>

      {/* Deep Dive Products Showcase */}
      {deepDiveProducts.length > 0 && (
        <section className="py-24 bg-[var(--muted)]/50">
          <div className="max-w-6xl mx-auto px-6">
            <div className="flex items-center justify-between mb-12">
              <div>
                <h2 className="text-3xl lg:text-4xl font-bold mb-3">播客拆解</h2>
                <p className="text-[var(--muted-foreground)] text-lg">
                  深度解析热门 AI 产品
                </p>
              </div>
              <Link
                href="/deep-dive"
                className="inline-flex items-center gap-2 text-orange-500 hover:text-orange-600 text-lg transition-colors"
              >
                查看全部
                <ArrowRight className="w-5 h-5" />
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {deepDiveProducts.slice(0, 3).map((product, index) => (
                <Link
                  key={product.id}
                  href={`/product/${product.slug}/deep-dive`}
                  className="group bg-[var(--card)] rounded-2xl p-6 shadow-lg transition-all duration-300 hover:scale-105 hover:shadow-xl"
                  style={{
                    animationDelay: `${index * 100}ms`
                  }}
                >
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-14 h-14 bg-[var(--muted)] rounded-xl flex items-center justify-center overflow-hidden">
                      {product.logo_url ? (
                        <img
                          src={product.logo_url}
                          alt={product.name}
                          className="w-8 h-8 object-contain"
                        />
                      ) : (
                        <span className="text-2xl">🤖</span>
                      )}
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg group-hover:text-orange-500 transition-colors">
                        {product.name}
                      </h3>
                      <p className="text-sm text-[var(--muted-foreground)] line-clamp-1">
                        {product.tagline}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-[var(--muted-foreground)]">
                    <Headphones className="w-4 h-4" />
                    <span>
                      {product.podcast_duration
                        ? `${Math.floor(product.podcast_duration / 60)}分钟`
                        : "播客拆解"}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* CTA Section - memene gradient style */}
      <section className="py-20">
        <div className="space-y-10">
          <h1 className="bg-gradient-to-br from-orange-500 to-orange-700 bg-clip-text py-4 text-center text-4xl font-medium tracking-tight text-transparent md:text-5xl">
            开始探索 AI 产品世界
          </h1>
          <p className="text-[var(--muted-foreground)] text-xl text-center max-w-2xl mx-auto">
            已收录 {products.length}+ 个优质 AI 产品，等你发现
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4">
            <Link
              href="/directory"
              className="inline-flex items-center gap-2 px-8 py-4 bg-[var(--primary)] text-[var(--primary-foreground)] rounded-full text-base font-medium hover:bg-[var(--primary)]/90 transition-all duration-300 hover:scale-105"
            >
              浏览产品目录
              <ArrowRight className="w-5 h-5" />
            </Link>
            <Link
              href="/deep-dive"
              className="inline-flex items-center gap-2 px-8 py-4 bg-[var(--secondary)] rounded-full text-base font-medium hover:bg-[var(--muted)] transition-all duration-300 hover:scale-105"
            >
              <Headphones className="w-5 h-5" />
              收听播客拆解
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </>
  );
}
