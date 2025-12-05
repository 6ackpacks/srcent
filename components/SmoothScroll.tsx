"use client";

import { ReactNode, useEffect, useRef } from "react";
import Lenis from "lenis";

interface SmoothScrollProps {
  children: ReactNode;
}

export default function SmoothScroll({ children }: SmoothScrollProps) {
  const lenisRef = useRef<Lenis | null>(null);

  useEffect(() => {
    // 初始化 Lenis 平滑滚动
    const lenis = new Lenis({
      lerp: 0.1, // 惯性延迟效果，值越小延迟越明显
      duration: 1.2, // 滚动持续时间
      smoothWheel: true, // 启用平滑滚轮滚动
      wheelMultiplier: 1, // 滚轮灵敏度
      touchMultiplier: 2, // 触摸灵敏度
      infinite: false, // 是否无限滚动
    });

    lenisRef.current = lenis;

    // 动画帧循环
    function raf(time: number) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }

    requestAnimationFrame(raf);

    // 清理函数
    return () => {
      lenis.destroy();
      lenisRef.current = null;
    };
  }, []);

  return <>{children}</>;
}

// 导出 useLenis hook 供其他组件使用
export function useLenis() {
  const lenisRef = useRef<Lenis | null>(null);

  useEffect(() => {
    // 获取全局 Lenis 实例
    const getLenis = () => {
      if (typeof window !== "undefined" && (window as unknown as { lenis?: Lenis }).lenis) {
        lenisRef.current = (window as unknown as { lenis: Lenis }).lenis;
      }
    };
    getLenis();
  }, []);

  return lenisRef.current;
}
