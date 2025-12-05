import type { Metadata } from "next";
import "./globals.css";
import { ThemeProvider } from "@/components/ThemeProvider";
import SmoothScroll from "@/components/SmoothScroll";

export const metadata: Metadata = {
  title: "srcent - AI 产品发现平台",
  description: "洞察 AI 产品的设计灵魂，发现适合你的 AI 工具",
  icons: {
    icon: "/logo.png",
    apple: "/logo.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN" suppressHydrationWarning>
      <head>
        {/* 防止主题闪烁的脚本 */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var theme = localStorage.getItem('theme');
                  if (!theme) {
                    theme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
                  }
                  document.documentElement.setAttribute('data-theme', theme);
                } catch (e) {}
              })();
            `,
          }}
        />
      </head>
      <body>
        <ThemeProvider>
          <SmoothScroll>{children}</SmoothScroll>
        </ThemeProvider>
      </body>
    </html>
  );
}
