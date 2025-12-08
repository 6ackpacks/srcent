import Header from "@/components/Header";
import Footer from "@/components/Footer";

export default function ProductLoading() {
  return (
    <>
      <Header />
      <div className="pt-20 sm:pt-24 pb-16 sm:pb-20 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto">
          {/* Breadcrumb skeleton */}
          <div className="flex items-center gap-2 mb-6 sm:mb-8">
            <div className="h-4 w-12 bg-[var(--secondary)] rounded animate-pulse" />
            <div className="h-4 w-4 bg-[var(--secondary)] rounded animate-pulse" />
            <div className="h-4 w-20 bg-[var(--secondary)] rounded animate-pulse" />
            <div className="h-4 w-4 bg-[var(--secondary)] rounded animate-pulse" />
            <div className="h-4 w-24 bg-[var(--secondary)] rounded animate-pulse" />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-10">
            {/* Main Content */}
            <main className="lg:col-span-8 space-y-6 sm:space-y-8">
              {/* Hero skeleton */}
              <div className="flex items-start gap-4 sm:gap-6">
                <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-[var(--secondary)] animate-pulse flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="h-7 w-48 bg-[var(--secondary)] rounded animate-pulse mb-2" />
                  <div className="h-5 w-full bg-[var(--secondary)] rounded animate-pulse mb-3" />
                  <div className="flex gap-2">
                    <div className="h-6 w-16 bg-[var(--secondary)] rounded animate-pulse" />
                    <div className="h-6 w-16 bg-[var(--secondary)] rounded animate-pulse" />
                  </div>
                </div>
              </div>

              {/* Description skeleton */}
              <div className="bg-[var(--card)] rounded-xl border border-[var(--border)] p-4 sm:p-6">
                <div className="h-6 w-24 bg-[var(--secondary)] rounded animate-pulse mb-4" />
                <div className="space-y-2">
                  <div className="h-4 w-full bg-[var(--secondary)] rounded animate-pulse" />
                  <div className="h-4 w-5/6 bg-[var(--secondary)] rounded animate-pulse" />
                  <div className="h-4 w-4/5 bg-[var(--secondary)] rounded animate-pulse" />
                </div>
              </div>

              {/* AI Analysis skeleton */}
              <div className="bg-[var(--card)] rounded-xl border border-[var(--border)] p-4 sm:p-6">
                <div className="h-6 w-32 bg-[var(--secondary)] rounded animate-pulse mb-4" />
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {[...Array(4)].map((_, i) => (
                    <div key={i} className="p-4 bg-[var(--secondary)]/30 rounded-lg">
                      <div className="h-4 w-20 bg-[var(--secondary)] rounded animate-pulse mb-2" />
                      <div className="h-3 w-full bg-[var(--secondary)] rounded animate-pulse" />
                    </div>
                  ))}
                </div>
              </div>
            </main>

            {/* Sidebar skeleton */}
            <aside className="lg:col-span-4">
              <div className="lg:sticky lg:top-24 space-y-4">
                {/* Deep Dive Card skeleton */}
                <div className="bg-[var(--card)] rounded-xl border border-[var(--border)] p-4 sm:p-6">
                  <div className="h-6 w-32 bg-[var(--secondary)] rounded animate-pulse mb-4" />
                  <div className="h-24 bg-[var(--secondary)] rounded-lg animate-pulse mb-4" />
                  <div className="h-10 bg-[var(--secondary)] rounded-lg animate-pulse" />
                </div>

                {/* Quick Info skeleton */}
                <div className="bg-[var(--card)] rounded-xl border border-[var(--border)] p-4 sm:p-6">
                  <div className="h-5 w-24 bg-[var(--secondary)] rounded animate-pulse mb-4" />
                  <div className="space-y-3">
                    {[...Array(4)].map((_, i) => (
                      <div key={i} className="flex justify-between">
                        <div className="h-4 w-16 bg-[var(--secondary)] rounded animate-pulse" />
                        <div className="h-4 w-20 bg-[var(--secondary)] rounded animate-pulse" />
                      </div>
                    ))}
                  </div>
                </div>

                {/* CTA Button skeleton */}
                <div className="h-12 bg-[var(--secondary)] rounded-lg animate-pulse" />
              </div>
            </aside>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}
