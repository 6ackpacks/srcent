"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Menu, Search, Sun, Moon } from "lucide-react";
import { useTheme } from "./ThemeProvider";

export default function Header() {
  const pathname = usePathname();
  const [isScrolled, setIsScrolled] = useState(false);
  const { theme, toggleTheme } = useTheme();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navLinks = [
    { href: "/", label: "AI工作台", icon: "🤖" },
    { href: "/directory", label: "分类目录" },
    { href: "/archives", label: "每日推文精选" },
    { href: "/about", label: "关于我们" },
  ];

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled
          ? "h-16 bg-[var(--background)]/95 backdrop-blur-md border-b border-[var(--border)]"
          : "h-20 bg-[var(--background)]/80 backdrop-blur-sm"
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 h-full flex items-center justify-between">
        {/* Logo */}
        <Link
          href="/"
          className="flex items-center gap-2 font-bold text-xl transition-transform duration-300 hover:scale-105"
        >
          <span className="text-2xl">🔬</span>
          <span className="text-[var(--foreground)]">srcent</span>
        </Link>

        {/* Navigation */}
        <nav className="hidden md:flex items-center gap-1">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                pathname === link.href
                  ? "text-[var(--foreground)] bg-[var(--secondary)]"
                  : "text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[var(--secondary)]"
              }`}
            >
              {link.icon && <span className="mr-1.5">{link.icon}</span>}
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Right side */}
        <div className="flex items-center gap-2">
          {/* Search */}
          <button className="p-2.5 rounded-lg hover:bg-[var(--secondary)] transition-colors">
            <Search className="w-5 h-5 text-[var(--muted-foreground)]" />
          </button>

          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            className="p-2.5 rounded-lg hover:bg-[var(--secondary)] transition-colors"
            aria-label={theme === "light" ? "切换到暗色模式" : "切换到亮色模式"}
          >
            {theme === "light" ? (
              <Moon className="w-5 h-5 text-[var(--muted-foreground)]" />
            ) : (
              <Sun className="w-5 h-5 text-[var(--muted-foreground)]" />
            )}
          </button>

          {/* Language */}
          <button className="hidden sm:flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm text-[var(--muted-foreground)] hover:bg-[var(--secondary)] transition-colors border border-[var(--border)]">
            <span>🌐</span>
            <span>简体中文</span>
          </button>

          {/* Mobile menu */}
          <button className="md:hidden p-2.5 rounded-lg hover:bg-[var(--secondary)] transition-colors">
            <Menu className="w-5 h-5 text-[var(--foreground)]" />
          </button>
        </div>
      </div>
    </header>
  );
}
