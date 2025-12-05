"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Menu, Search, Sun, Moon, X } from "lucide-react";
import { useTheme } from "./ThemeProvider";

export default function Header() {
  const pathname = usePathname();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { theme, toggleTheme } = useTheme();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navLinks = [
    { href: "/", label: "AI工作台", icon: "🤖" },
    { href: "/directory", label: "分类目录" },
    { href: "/deep-dive", label: "产品拆解" },
    { href: "/about", label: "关于我们" },
  ];

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ease-out ${
          isScrolled
            ? "py-3"
            : "py-5"
        }`}
      >
        {/* 背景层 - 滚动后显示 */}
        <div
          className={`absolute inset-0 transition-all duration-500 ${
            isScrolled
              ? "bg-[var(--background)]/95 backdrop-blur-xl shadow-lg border-b border-[var(--border)]"
              : "bg-transparent"
          }`}
        />

        {/* 内容容器 */}
        <div
          className={`relative max-w-7xl mx-auto transition-all duration-500 ${
            isScrolled
              ? "px-4"
              : "px-6"
          }`}
        >
          {/* 滚动后的卡片式容器 */}
          <div
            className={`flex items-center justify-between transition-all duration-500 ${
              isScrolled
                ? "bg-[var(--card)] rounded-2xl px-6 py-2 shadow-xl border border-[var(--border)]"
                : ""
            }`}
          >
            {/* Logo */}
            <Link
              href="/"
              className={`flex items-center gap-2 font-bold transition-all duration-300 hover:scale-105 ${
                isScrolled ? "text-lg" : "text-xl"
              }`}
            >
              <img
                src="/logo.png"
                alt="srcent"
                className={`transition-all duration-300 dark:invert ${isScrolled ? "h-6 w-6" : "h-8 w-8"}`}
              />
              <span className="text-[var(--foreground)]">srcent</span>
            </Link>

            {/* Navigation - Desktop */}
            <nav className="hidden md:flex items-center gap-1">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-300 ${
                    pathname === link.href
                      ? "text-[var(--primary)] bg-[var(--primary)]/10"
                      : "text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[var(--secondary)]"
                  }`}
                >
                  {link.icon && <span className="mr-1.5">{link.icon}</span>}
                  {link.label}
                </Link>
              ))}
            </nav>

            {/* Right side */}
            <div className="flex items-center gap-1">
              {/* Search */}
              <button className="p-2.5 rounded-xl hover:bg-[var(--secondary)] transition-all duration-300">
                <Search className="w-5 h-5 text-[var(--muted-foreground)]" />
              </button>

              {/* Theme Toggle */}
              <button
                onClick={toggleTheme}
                className="p-2.5 rounded-xl hover:bg-[var(--secondary)] transition-all duration-300"
                aria-label={theme === "light" ? "切换到暗色模式" : "切换到亮色模式"}
              >
                {theme === "light" ? (
                  <Moon className="w-5 h-5 text-[var(--muted-foreground)]" />
                ) : (
                  <Sun className="w-5 h-5 text-[var(--muted-foreground)]" />
                )}
              </button>

              {/* Language - Desktop */}
              <button className="hidden lg:flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm text-[var(--muted-foreground)] hover:bg-[var(--secondary)] transition-all duration-300">
                <span>🌐</span>
                <span>中文</span>
              </button>

              {/* Mobile menu button */}
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="md:hidden p-2.5 rounded-xl hover:bg-[var(--secondary)] transition-all duration-300"
              >
                {isMobileMenuOpen ? (
                  <X className="w-5 h-5 text-[var(--foreground)]" />
                ) : (
                  <Menu className="w-5 h-5 text-[var(--foreground)]" />
                )}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Menu Overlay */}
      <div
        className={`fixed inset-0 z-40 md:hidden transition-all duration-300 ${
          isMobileMenuOpen
            ? "opacity-100 pointer-events-auto"
            : "opacity-0 pointer-events-none"
        }`}
      >
        {/* Backdrop */}
        <div
          className="absolute inset-0 bg-black/50 backdrop-blur-sm"
          onClick={() => setIsMobileMenuOpen(false)}
        />

        {/* Menu Panel */}
        <div
          className={`absolute top-20 left-4 right-4 bg-[var(--card)] rounded-2xl p-4 shadow-2xl border border-[var(--border)] transition-all duration-300 ${
            isMobileMenuOpen
              ? "translate-y-0 opacity-100"
              : "-translate-y-4 opacity-0"
          }`}
        >
          <nav className="flex flex-col gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setIsMobileMenuOpen(false)}
                className={`px-4 py-3 rounded-xl text-base font-medium transition-colors ${
                  pathname === link.href
                    ? "text-[var(--primary)] bg-[var(--primary)]/10"
                    : "text-[var(--foreground)] hover:bg-[var(--secondary)]"
                }`}
              >
                {link.icon && <span className="mr-2">{link.icon}</span>}
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Mobile Language */}
          <div className="mt-4 pt-4 border-t border-[var(--border)]">
            <button className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-sm text-[var(--muted-foreground)] hover:bg-[var(--secondary)] transition-colors">
              <span>🌐</span>
              <span>简体中文</span>
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
