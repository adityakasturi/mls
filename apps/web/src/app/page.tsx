import Link from "next/link";

import { SiteShell } from "@/components/site-shell";
import { demoProperty } from "@/lib/data";
import { formatCurrency } from "@/lib/format";

export default function Home() {
  return (
    <SiteShell>
      <section className="mx-auto grid min-h-[100dvh] max-w-7xl gap-10 px-4 py-12 sm:px-6 lg:grid-cols-[1.15fr_0.85fr] lg:items-end lg:py-20">
        <div className="space-y-8">
          <div className="inline-flex rounded-full border border-white/10 px-4 py-2 text-[11px] uppercase tracking-[0.28em] text-[var(--color-clay)]">
            NWMLS-first / Vercel-ready / Supabase-backed
          </div>
          <div className="space-y-6">
            <h1 className="max-w-4xl font-[var(--font-display)] text-5xl leading-[0.95] tracking-[-0.04em] text-[var(--color-sand)] sm:text-6xl lg:text-8xl">
              Property pages that feel like a private-market memo, not an IDX widget.
            </h1>
            <p className="max-w-2xl text-lg leading-8 text-[var(--color-sand-dim)]">
              V1 ships one flagship property page first. The listing facts come from
              SimplyRETS. The trust layer comes from Google Maps intelligence, quota-aware
              Zillow enrichment, and a clean deployment pipeline.
            </p>
          </div>
          <div className="flex flex-col gap-4 sm:flex-row">
            <Link
              href={`/properties/${demoProperty.slug}`}
              className="inline-flex items-center justify-center rounded-full bg-[var(--color-clay)] px-6 py-4 text-sm font-semibold text-[var(--color-ink)] transition hover:brightness-110"
            >
              Open Flagship Property Page
            </Link>
            <a
              href="https://calendly.com/adityakasturi/annual-wealth-review"
              className="inline-flex items-center justify-center rounded-full border border-white/15 px-6 py-4 text-sm font-semibold text-[var(--color-sand)] transition hover:border-[var(--color-moss)] hover:text-white"
            >
              Book Annual Wealth Review
            </a>
          </div>
        </div>

        <div className="rounded-[2rem] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.06),rgba(255,255,255,0.02))] p-2 shadow-[0_30px_80px_rgba(0,0,0,0.35)]">
          <div className="rounded-[1.65rem] border border-white/10 bg-[var(--color-ink-soft)] p-6">
            <div className="space-y-3 border-b border-white/10 pb-6">
              <p className="text-[11px] uppercase tracking-[0.25em] text-[var(--color-clay)]">
                Flagship Listing
              </p>
              <h2 className="font-[var(--font-display)] text-3xl leading-tight">
                {demoProperty.addressLine}
              </h2>
              <p className="text-sm text-[var(--color-sand-dim)]">{demoProperty.cityLine}</p>
            </div>
            <div className="grid gap-4 py-6 sm:grid-cols-2">
              <div>
                <p className="text-[11px] uppercase tracking-[0.25em] text-white/45">Price</p>
                <p className="mt-2 text-3xl font-semibold text-white">
                  {formatCurrency(demoProperty.price)}
                </p>
              </div>
              <div>
                <p className="text-[11px] uppercase tracking-[0.25em] text-white/45">Commute</p>
                <p className="mt-2 text-3xl font-semibold text-white">16 min</p>
                <p className="text-sm text-[var(--color-sand-dim)]">to Microsoft Redmond</p>
              </div>
            </div>
            <div className="grid gap-3 sm:grid-cols-3">
              {demoProperty.metrics.slice(1).map((metric) => (
                <div key={metric.label} className="rounded-[1.3rem] border border-white/8 bg-white/3 p-4">
                  <p className="text-[11px] uppercase tracking-[0.22em] text-white/45">{metric.label}</p>
                  <p className="mt-2 text-xl font-semibold text-white">{metric.value}</p>
                  <p className="mt-1 text-sm text-[var(--color-sand-dim)]">{metric.detail}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </SiteShell>
  );
}
