import Header from "@/components/Header";
import Footer from "@/components/Footer";

export default function DeepDiveLoading() {
  return (
    <>
      <Header />
      <div className="pt-24 pb-20 px-6">
        <div className="max-w-4xl mx-auto">
          {/* Breadcrumb skeleton */}
          <div className="flex items-center gap-2 mb-8">
            <div className="h-4 w-12 bg-[var(--secondary)] rounded animate-pulse" />
            <div className="h-4 w-4 bg-[var(--secondary)] rounded animate-pulse" />
            <div className="h-4 w-16 bg-[var(--secondary)] rounded animate-pulse" />
            <div className="h-4 w-4 bg-[var(--secondary)] rounded animate-pulse" />
            <div className="h-4 w-20 bg-[var(--secondary)] rounded animate-pulse" />
          </div>

          {/* Back link skeleton */}
          <div className="h-5 w-32 bg-[var(--secondary)] rounded animate-pulse mb-8" />

          {/* Hero skeleton */}
          <div className="mb-12">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-16 h-16 rounded-xl bg-[var(--secondary)] animate-pulse" />
              <div>
                <div className="h-7 w-40 bg-[var(--secondary)] rounded animate-pulse mb-2" />
                <div className="h-5 w-60 bg-[var(--secondary)] rounded animate-pulse" />
              </div>
            </div>

            {/* Player skeleton */}
            <div className="rounded-2xl bg-[var(--card)] border border-[var(--border)] p-8">
              <div className="text-center mb-6">
                <div className="h-4 w-20 bg-[var(--secondary)] rounded animate-pulse mx-auto mb-2" />
                <div className="h-6 w-48 bg-[var(--secondary)] rounded animate-pulse mx-auto" />
              </div>

              {/* Waveform skeleton */}
              <div className="flex items-center justify-center gap-1 h-16 mb-6">
                {[...Array(20)].map((_, i) => (
                  <div
                    key={i}
                    className="w-1 bg-[var(--secondary)] rounded-full animate-pulse"
                    style={{ height: `${20 + Math.sin(i * 0.5) * 15}%` }}
                  />
                ))}
              </div>

              {/* Progress skeleton */}
              <div className="h-1 w-full bg-[var(--secondary)] rounded-full mb-4" />

              {/* Controls skeleton */}
              <div className="flex items-center justify-center gap-6">
                <div className="w-11 h-11 rounded-full bg-[var(--secondary)] animate-pulse" />
                <div className="w-16 h-16 rounded-full bg-[var(--secondary)] animate-pulse" />
                <div className="w-11 h-11 rounded-full bg-[var(--secondary)] animate-pulse" />
              </div>
            </div>
          </div>

          {/* Content skeleton */}
          <div className="grid grid-cols-12 gap-8">
            <main className="col-span-12 lg:col-span-8">
              <div className="h-7 w-32 bg-[var(--secondary)] rounded animate-pulse mb-6" />
              <div className="bg-[var(--card)] rounded-xl border border-[var(--border)] p-6 md:p-8 space-y-4">
                <div className="h-4 w-full bg-[var(--secondary)] rounded animate-pulse" />
                <div className="h-4 w-5/6 bg-[var(--secondary)] rounded animate-pulse" />
                <div className="h-4 w-4/5 bg-[var(--secondary)] rounded animate-pulse" />
                <div className="h-4 w-full bg-[var(--secondary)] rounded animate-pulse" />
                <div className="h-4 w-3/4 bg-[var(--secondary)] rounded animate-pulse" />
              </div>
            </main>

            <aside className="col-span-12 lg:col-span-4">
              <div className="h-6 w-24 bg-[var(--secondary)] rounded animate-pulse mb-4" />
              <div className="h-4 w-full bg-[var(--secondary)] rounded animate-pulse mb-4" />
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="p-4 rounded-xl bg-[var(--card)] border border-[var(--border)]">
                    <div className="h-3 w-20 bg-[var(--secondary)] rounded animate-pulse mb-2" />
                    <div className="h-4 w-full bg-[var(--secondary)] rounded animate-pulse" />
                  </div>
                ))}
              </div>
            </aside>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}
