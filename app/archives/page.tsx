import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Link from "next/link";
import { Layers, Clock } from "lucide-react";

const issues = [
  {
    number: 42,
    date: "2025.11.27",
    title: "学术写作工具专场",
    desc: "深度拆解 Grammarly、Notion AI、ChatPDF 等学术写作辅助工具",
    products: ["Grammarly", "Notion AI", "ChatPDF", "Scite.ai"],
    count: 4,
    time: "30",
    isLatest: true,
  },
  {
    number: 41,
    date: "2025.11.26",
    title: "视频创作工具集锦",
    desc: "解析 Runway、Pika、CapCut 等 AI 视频生成工具的设计逻辑",
    products: ["Runway", "Pika", "CapCut", "Descript", "Synthesia"],
    count: 5,
    time: "40",
  },
  {
    number: 40,
    date: "2025.11.25",
    title: "代码辅助神器大盘点",
    desc: "深入剖析 Cursor、GitHub Copilot、v0 等 AI 编程工具",
    products: ["Cursor", "GitHub Copilot", "v0.dev", "Tabnine"],
    count: 4,
    time: "35",
  },
];

export default function ArchivesPage() {
  return (
    <>
      <Header />

      <div className="pt-28 pb-20 px-6 bg-[var(--background)]">
        <div className="max-w-4xl mx-auto">
          {/* Page Header */}
          <div className="mb-12">
            <h1 className="text-4xl font-bold mb-3">往期归档</h1>
            <p className="text-[var(--muted-foreground)]">探索已发布的 42 期产品拆解报告</p>
          </div>

          {/* Timeline */}
          <div className="space-y-6">
            {issues.map((issue, i) => (
              <div key={i} className="relative pl-8 border-l-2 border-[var(--border)]">
                <div className="absolute left-[-6px] top-8 w-3 h-3 bg-[var(--foreground)] rounded-full border-[3px] border-[var(--background)] shadow-[0_0_0_1px_var(--border)]" />

                <div className="bg-[var(--card)] border border-[var(--border)] rounded-xl p-8 hover:border-[var(--primary)] hover:shadow-lg transition-all cursor-pointer card-hover">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <div className="text-sm text-[var(--muted-foreground)] mb-2 font-mono">
                        第 {issue.number} 期 · {issue.date}
                      </div>
                      <h2 className="text-2xl font-semibold mb-2">{issue.title}</h2>
                      <p className="text-[var(--muted-foreground)]">{issue.desc}</p>
                    </div>
                    {issue.isLatest && (
                      <span className="px-3 py-1 bg-[var(--primary)]/10 text-[var(--primary)] rounded text-xs font-mono border border-[var(--primary)]/20">
                        最新
                      </span>
                    )}
                  </div>

                  <div className="mb-4">
                    <h3 className="text-sm font-semibold mb-2 text-[var(--foreground)]">本期产品：</h3>
                    <div className="flex flex-wrap gap-2">
                      {issue.products.map((product, j) => (
                        <span
                          key={j}
                          className="inline-flex items-center gap-2 px-3 py-1.5 bg-[var(--secondary)] text-[var(--secondary-foreground)] rounded text-sm border border-[var(--border)]"
                        >
                          📦 {product}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t border-[var(--border)]">
                    <div className="flex items-center gap-4 text-sm text-[var(--muted-foreground)]">
                      <span className="flex items-center gap-1">
                        <Layers className="w-3.5 h-3.5" />
                        {issue.count} 个产品
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" />
                        约 {issue.time} 分钟
                      </span>
                    </div>
                    <Link href="/" className="text-sm font-medium text-[var(--primary)] hover:underline">
                      查看详情 →
                    </Link>
                  </div>
                </div>
              </div>
            ))}

            {/* Load More */}
            <div className="text-center py-8">
              <p className="text-[var(--muted-foreground)] mb-4">还有 39 期内容...</p>
              <button className="px-6 py-2 border border-[var(--border)] rounded-lg hover:bg-[var(--secondary)] hover:border-[var(--primary)] text-sm text-[var(--foreground)] transition-all">
                加载更多
              </button>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </>
  );
}
