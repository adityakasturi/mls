import Image from "next/image";
import { notFound } from "next/navigation";

import { SiteShell } from "@/components/site-shell";
import { getPropertyBySlug } from "@/lib/data";
import { formatCurrency } from "@/lib/format";

type PageProps = {
  params: Promise<{
    slug: string;
  }>;
};

export default async function PropertyDetailsPage({ params }: PageProps) {
  const { slug } = await params;
  const property = getPropertyBySlug(slug);

  if (!property) {
    notFound();
  }

  const groupedPlaces = property.places.reduce<Record<string, typeof property.places>>(
    (acc, place) => {
      acc[place.category] ??= [];
      acc[place.category].push(place);
      return acc;
    },
    {}
  );

  return (
    <SiteShell>
      <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:py-12">
        <div className="grid gap-5 lg:grid-cols-[1.15fr_0.85fr]">
          <div className="space-y-5">
            <div className="rounded-[2rem] border border-white/10 bg-white/4 p-2">
              <div className="grid gap-2 md:grid-cols-[1.5fr_0.9fr]">
                <Image
                  src={property.media[0].url}
                  alt={property.media[0].alt}
                  width={1600}
                  height={1200}
                  className="min-h-[320px] rounded-[1.5rem] object-cover md:min-h-[560px]"
                />
                <div className="grid gap-2">
                  {property.media.slice(1).map((item) => (
                    <Image
                      key={item.id}
                      src={item.url}
                      alt={item.alt}
                      width={1200}
                      height={900}
                      className="h-full min-h-[180px] rounded-[1.5rem] object-cover"
                    />
                  ))}
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <p className="text-[11px] uppercase tracking-[0.28em] text-[var(--color-clay)]">
                {property.heroEyebrow}
              </p>
              <div className="space-y-3">
                <h1 className="max-w-5xl font-[var(--font-display)] text-4xl leading-[0.96] tracking-[-0.04em] sm:text-6xl">
                  {property.headline}
                </h1>
                <p className="max-w-3xl text-lg leading-8 text-[var(--color-sand-dim)]">
                  {property.subheadline}
                </p>
              </div>
            </div>
          </div>

          <aside className="space-y-5 lg:pt-8">
            <div className="rounded-[2rem] border border-white/10 bg-[linear-gradient(180deg,rgba(199,152,87,0.18),rgba(255,255,255,0.04))] p-2 shadow-[0_24px_60px_rgba(0,0,0,0.25)]">
              <div className="rounded-[1.65rem] border border-white/8 bg-[var(--color-ink-soft)] p-6">
                <p className="text-[11px] uppercase tracking-[0.24em] text-[var(--color-clay)]">
                  {property.addressLine}
                </p>
                <p className="mt-2 text-sm text-[var(--color-sand-dim)]">{property.cityLine}</p>
                <div className="mt-6 grid gap-3 sm:grid-cols-2">
                  <div>
                    <p className="text-[11px] uppercase tracking-[0.22em] text-white/40">Price</p>
                    <p className="mt-2 text-4xl font-semibold text-white">
                      {formatCurrency(property.price)}
                    </p>
                  </div>
                  <div>
                    <p className="text-[11px] uppercase tracking-[0.22em] text-white/40">Status</p>
                    <p className="mt-2 text-4xl font-semibold text-white">{property.status}</p>
                  </div>
                </div>
                <div className="mt-6 grid grid-cols-2 gap-3">
                  {[
                    `${property.bedrooms} Beds`,
                    `${property.bathrooms} Baths`,
                    `${property.sqft.toLocaleString()} SF`,
                    property.lotSize
                  ].map((item) => (
                    <div key={item} className="rounded-[1.25rem] border border-white/8 bg-white/3 px-4 py-3 text-sm text-[var(--color-sand)]">
                      {item}
                    </div>
                  ))}
                </div>
                <div className="mt-6 space-y-3">
                  {property.linkHub.map((item) => (
                    <a
                      key={item.label}
                      href={item.href}
                      className={
                        item.tone === "primary"
                          ? "flex items-center justify-between rounded-full bg-[var(--color-clay)] px-5 py-4 text-sm font-semibold text-[var(--color-ink)] transition hover:brightness-110"
                          : "flex items-center justify-between rounded-full border border-white/12 px-5 py-4 text-sm font-semibold text-[var(--color-sand)] transition hover:border-[var(--color-moss)]"
                      }
                    >
                      <span>{item.label}</span>
                      <span aria-hidden="true">↗</span>
                    </a>
                  ))}
                </div>
              </div>
            </div>

            <div className="rounded-[2rem] border border-white/10 bg-white/4 p-6">
              <p className="text-[11px] uppercase tracking-[0.24em] text-[var(--color-clay)]">
                Numbers First
              </p>
              <div className="mt-4 grid gap-3">
                {property.metrics.map((metric) => (
                  <div
                    key={metric.label}
                    className="flex items-end justify-between gap-4 border-b border-white/8 pb-3"
                  >
                    <div>
                      <p className="text-sm text-[var(--color-sand-dim)]">{metric.label}</p>
                      {metric.detail ? (
                        <p className="text-xs uppercase tracking-[0.18em] text-white/35">
                          {metric.detail}
                        </p>
                      ) : null}
                    </div>
                    <p className="text-xl font-semibold text-white">{metric.value}</p>
                  </div>
                ))}
              </div>
            </div>
          </aside>
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-8 px-4 py-10 sm:px-6 lg:grid-cols-[0.92fr_1.08fr] lg:py-16">
        <div className="space-y-6">
          <div className="rounded-[2rem] border border-white/10 bg-white/4 p-6">
            <p className="text-[11px] uppercase tracking-[0.24em] text-[var(--color-clay)]">
              Listing Summary
            </p>
            <p className="mt-4 text-base leading-8 text-[var(--color-sand-dim)]">
              {property.description}
            </p>
          </div>

          <div className="rounded-[2rem] border border-white/10 bg-white/4 p-6">
            <p className="text-[11px] uppercase tracking-[0.24em] text-[var(--color-clay)]">
              Map + Commute Layer
            </p>
            <div className="mt-4 rounded-[1.5rem] border border-white/8 bg-[linear-gradient(135deg,rgba(123,152,136,0.12),rgba(255,255,255,0.03))] p-6">
              <div className="grid gap-3 sm:grid-cols-3">
                {property.commutes.map((commute) => (
                  <div key={commute.id} className="rounded-[1.25rem] border border-white/8 bg-black/15 p-4">
                    <p className="text-xs uppercase tracking-[0.18em] text-white/40">{commute.mode}</p>
                    <p className="mt-3 text-xl font-semibold text-white">{commute.durationMinutes} min</p>
                    <p className="mt-1 text-sm text-[var(--color-sand-dim)]">{commute.label}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="flex items-end justify-between gap-4">
            <div>
              <p className="text-[11px] uppercase tracking-[0.24em] text-[var(--color-clay)]">
                Neighborhood Intelligence
              </p>
              <h2 className="mt-3 font-[var(--font-display)] text-4xl tracking-[-0.04em]">
                The surrounding lifestyle is now part of the listing surface.
              </h2>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            {Object.entries(groupedPlaces).map(([category, places]) => (
              <div
                key={category}
                className="rounded-[1.75rem] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.04),rgba(255,255,255,0.02))] p-5"
              >
                <p className="text-[11px] uppercase tracking-[0.2em] text-[var(--color-moss)]">
                  {category}
                </p>
                <div className="mt-4 space-y-3">
                  {places.map((place) => (
                    <div key={place.id} className="rounded-[1.25rem] border border-white/8 bg-black/12 p-4">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <p className="font-semibold text-white">{place.name}</p>
                          <p className="mt-1 text-sm leading-6 text-[var(--color-sand-dim)]">
                            {place.address}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-semibold text-white">{place.distanceMiles} mi</p>
                          {place.rating ? (
                            <p className="text-xs uppercase tracking-[0.18em] text-white/35">
                              {place.rating} rating
                            </p>
                          ) : null}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </SiteShell>
  );
}
