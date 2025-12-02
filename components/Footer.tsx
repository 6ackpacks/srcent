import Link from "next/link";

export default function Footer() {
  return (
    <footer className="py-12 px-6 border-t border-[var(--border)]">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="text-xl">🔬</span>
            <span className="text-sm text-[var(--muted-foreground)]">srcent © 2025</span>
          </div>
          <div className="flex gap-6 text-sm">
            <Link
              href="/about"
              className="text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors"
            >
              关于我们
            </Link>
            <Link
              href="/contact"
              className="text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors"
            >
              联系方式
            </Link>
            <Link
              href="/privacy"
              className="text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors"
            >
              隐私政策
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
