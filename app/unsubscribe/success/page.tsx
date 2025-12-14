import Link from "next/link";

export default function UnsubscribeSuccessPage() {
  return (
    <div className="min-h-screen flex items-center justify-center px-6">
      <div className="max-w-md text-center">
        <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
          <svg
            className="w-8 h-8 text-green-500"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M5 13l4 4L19 7"
            />
          </svg>
        </div>

        <h1 className="text-2xl font-bold mb-4">已取消订阅</h1>

        <p className="text-[var(--muted-foreground)] mb-8">
          你已成功取消订阅 srcent AI 产品日报。
          <br />
          我们不会再向你发送邮件。
        </p>

        <p className="text-sm text-[var(--muted-foreground)] mb-8">
          如果你改变主意，随时可以重新订阅。
        </p>

        <Link
          href="/"
          className="inline-flex items-center justify-center px-6 py-3 bg-[var(--primary)] text-[var(--primary-foreground)] rounded-full text-sm font-medium hover:bg-[var(--primary)]/90 transition-all"
        >
          返回首页
        </Link>
      </div>
    </div>
  );
}
