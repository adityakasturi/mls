import Link from "next/link";
import type { ReactNode } from "react";

export function SiteShell({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-[100dvh] bg-[var(--color-ink)] text-[var(--color-sand)]">
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_top_left,rgba(171,119,61,0.24),transparent_42%),radial-gradient(circle_at_bottom_right,rgba(94,129,113,0.16),transparent_32%)]" />
      <header className="sticky top-0 z-20 border-b border-white/10 bg-[color:rgba(12,15,15,0.82)] backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6">
          <Link href="/" className="text-sm uppercase tracking-[0.28em] text-[var(--color-clay)]">
            MLS / Aditya Kasturi
          </Link>
          <nav className="flex items-center gap-3 text-sm text-white/70">
            <Link href={`/properties/kirkland-waterline-reserve`} className="transition hover:text-white">
              Flagship PDP
            </Link>
            <a
              href="https://calendly.com/adityakasturi/annual-wealth-review"
              className="rounded-full border border-white/15 px-4 py-2 text-white transition hover:border-[var(--color-clay)] hover:text-[var(--color-clay)]"
            >
              Book Review
            </a>
          </nav>
        </div>
      </header>
      <main>{children}</main>
    </div>
  );
}

