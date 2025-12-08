import Header from "@/components/Header";
import Footer from "@/components/Footer";

export default function DirectoryLoading() {
  return (
    <>
      <Header />
      <div className="pt-20 sm:pt-24 pb-16 sm:pb-20 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto">
          {/* Page Header skeleton */}
          <div className="mb-6 sm:mb-10">
            <div className="h-8 w-32 bg-[var(--secondary)] rounded animate-pulse mb-2 sm:mb-3" />
            <div className="h-5 w-64 bg-[var(--secondary)] rounded animate-pulse" />
          </div>

          {/* Search Bar skeleton */}
          <div className="mb-6 sm:mb-8 max-w-2xl">
            <div className="h-12 bg-[var(--secondary)] rounded-xl animate-pulse" />
          </div>

          <div className="flex flex-col lg:grid lg:grid-cols-12 gap-6 lg:gap-8">
            {/* Sidebar skeleton */}
            <aside className="hidden lg:block lg:col-span-3">
              <div className="space-y-2">
                {[...Array(8)].map((_, i) => (
                  <div key={i} className="h-10 bg-[var(--secondary)] rounded-lg animate-pulse" />
                ))}
              </div>
            </aside>

            {/* Product Grid skeleton */}
            <main className="lg:col-span-9">
              <div className="mb-4 sm:mb-6">
                <div className="h-4 w-24 bg-[var(--secondary)] rounded animate-pulse" />
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4">
                {[...Array(12)].map((_, i) => (
                  <div
                    key={i}
                    className="bg-[var(--card)] border border-[var(--border)] rounded-xl p-4 sm:p-5"
                  >
                    <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-[var(--secondary)] animate-pulse mb-3 sm:mb-4" />
                    <div className="h-4 w-3/4 bg-[var(--secondary)] rounded animate-pulse mb-2" />
                    <div className="h-3 w-full bg-[var(--secondary)] rounded animate-pulse mb-1" />
                    <div className="h-3 w-2/3 bg-[var(--secondary)] rounded animate-pulse mb-3" />
                    <div className="h-5 w-16 bg-[var(--secondary)] rounded animate-pulse" />
                  </div>
                ))}
              </div>
            </main>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}
