"use client";

import { X, ArrowRight, Mail } from "lucide-react";
import Link from "next/link";

interface Product {
  name: string;
  slug: string;
  tagline: string;
  category: string;
  logo_url?: string;
  has_deep_dive?: boolean;
}

interface SubscribeSuccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  email: string;
  featuredProduct?: Product;
  otherProductsCount: number;
}

export default function SubscribeSuccessModal({
  isOpen,
  onClose,
  email,
  featuredProduct,
  otherProductsCount,
}: SubscribeSuccessModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative w-full max-w-md bg-[var(--background)] rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-full hover:bg-[var(--muted)] transition-colors"
        >
          <X className="w-4 h-4 text-[var(--muted-foreground)]" />
        </button>

        {/* Header */}
        <div className="px-6 pt-6 pb-4">
          <div className="flex items-center gap-2 text-green-500 mb-2">
            <div className="w-5 h-5 rounded-full bg-green-500 flex items-center justify-center">
              <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <span className="text-sm font-medium">订阅成功</span>
          </div>
          <h2 className="text-xl font-bold">首期日报已发送</h2>
          <p className="text-sm text-[var(--muted-foreground)] mt-1 flex items-center gap-1.5">
            <Mail className="w-3.5 h-3.5" />
            {email}
          </p>
        </div>

        {/* Featured Product Card */}
        {featuredProduct && (
          <div className="px-6 pb-4">
            <p className="text-xs font-medium text-orange-500 mb-2">今日推荐</p>
            <Link
              href={`/product/${featuredProduct.slug}`}
              onClick={onClose}
              className="block p-4 rounded-xl border border-[var(--border)] hover:border-orange-500/50 bg-[var(--card)] transition-all group"
            >
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-lg bg-[var(--muted)] flex items-center justify-center flex-shrink-0 overflow-hidden">
                  {featuredProduct.logo_url ? (
                    <img
                      src={featuredProduct.logo_url}
                      alt={featuredProduct.name}
                      className="w-6 h-6 object-contain"
                    />
                  ) : (
                    <span className="text-lg">🤖</span>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-sm group-hover:text-orange-500 transition-colors">
                      {featuredProduct.name}
                    </h3>
                    {featuredProduct.has_deep_dive && (
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400">
                        播客
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-[var(--muted-foreground)] mt-0.5 line-clamp-2">
                    {featuredProduct.tagline}
                  </p>
                </div>
                <ArrowRight className="w-4 h-4 text-[var(--muted-foreground)] group-hover:text-orange-500 transition-colors flex-shrink-0 mt-1" />
              </div>
            </Link>
          </div>
        )}

        {/* Other products hint */}
        {otherProductsCount > 0 && (
          <div className="px-6 pb-4">
            <p className="text-xs text-[var(--muted-foreground)]">
              +{otherProductsCount} 款更多产品已发送到你的邮箱
            </p>
          </div>
        )}

        {/* Actions */}
        <div className="px-6 pb-6 flex gap-3">
          <Link
            href="/directory"
            onClick={onClose}
            className="flex-1 h-10 flex items-center justify-center gap-2 bg-[var(--primary)] text-[var(--primary-foreground)] rounded-lg text-sm font-medium hover:bg-[var(--primary)]/90 transition-colors"
          >
            浏览全部产品
          </Link>
          <button
            onClick={onClose}
            className="h-10 px-4 flex items-center justify-center border border-[var(--border)] rounded-lg text-sm text-[var(--muted-foreground)] hover:bg-[var(--muted)] transition-colors"
          >
            稍后
          </button>
        </div>
      </div>
    </div>
  );
}
