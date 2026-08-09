const CITIES = [
  "Bellevue",
  "Bothell",
  "Issaquah",
  "Kirkland",
  "Mercer Island",
  "Newcastle",
  "Redmond",
  "Sammamish",
  "Woodinville",
] as const;
const ACTIVE_STATUSES = new Set(["Active", "ComingSoon"]);
const CONTRACT_STATUSES = new Set(["Pending", "ActiveUnderContract"]);
const DAY_MS = 86_400_000;
const PAGE_SIZE = 48;

type Listing = {
  id: string;
  status: string;
  listPrice: number | null;
  daysOnMarket?: number;
  listDate?: string;
  modifiedAt?: string;
  feedUpdatedAt?: string;
};

type SearchResponse = {
  items: Listing[];
  total: number;
  page: number;
  pageSize: number;
  feedUpdatedAt?: string;
};

export type CityMarketPulse = {
  city: string;
  activeInventory: number;
  comingSoon: number;
  pending: number;
  new24h: number;
  new7d: number;
  updated24h: number;
  fastMoving7d: number;
  sellerOpportunity21d: number;
  medianActiveListPrice: number | null;
  medianActiveDaysOnMarket: number | null;
};

export type WebsiteMarketPulse = {
  version: 1;
  status: "ready";
  checkedAt: string;
  sourceAsOf: string;
  latestListingModifiedAt: string;
  listingCount: number;
  daysOnMarketCoveragePercent: number;
  refreshSchedule: ["08:00 America/Los_Angeles", "14:00 America/Los_Angeles", "20:00 America/Los_Angeles"];
  criteria: {
    cities: readonly string[];
    statuses: ["Active", "ComingSoon", "Pending", "ActiveUnderContract"];
  };
  cities: CityMarketPulse[];
  compliance: {
    sourceLine: string;
    consumerDisclaimer: string;
    displayCriteriaRequired: true;
    brokerageIdentityRequired: true;
    dmcaNoticeRequired: true;
  };
};

export class MarketPulseBlockedError extends Error {
  constructor(
    message: string,
    public readonly code: "empty_feed" | "stale_provider" | "stale_content" | "missing_dom",
  ) {
    super(message);
  }
}

function parsedTime(value?: string) {
  const parsed = value ? Date.parse(value) : NaN;
  return Number.isFinite(parsed) ? parsed : null;
}

function median(values: number[]) {
  const sorted = [...values].sort((a, b) => a - b);
  if (!sorted.length) return null;
  const middle = Math.floor(sorted.length / 2);
  return sorted.length % 2 ? sorted[middle] : (sorted[middle - 1] + sorted[middle]) / 2;
}

function parseSearchResponse(value: unknown): SearchResponse {
  if (!value || typeof value !== "object") throw new Error("Website MLS upstream returned invalid JSON.");
  const input = value as Partial<SearchResponse>;
  if (!Array.isArray(input.items) || !Number.isFinite(input.total)) {
    throw new Error("Website MLS upstream returned an invalid search response.");
  }
  return {
    items: input.items as Listing[],
    total: Number(input.total),
    page: Number(input.page) || 1,
    pageSize: Number(input.pageSize) || PAGE_SIZE,
    feedUpdatedAt: input.feedUpdatedAt,
  };
}

async function fetchCity(city: string) {
  const baseUrl = process.env.MLS_UPSTREAM_URL || "https://adityakasturi.com/api/idx";
  const items: Listing[] = [];
  let sourceAsOf: string | undefined;
  for (let page = 1; page <= 53; page += 1) {
    const url = new URL(`${baseUrl.replace(/\/$/, "")}/properties`);
    url.searchParams.set("city", city);
    url.searchParams.set("page", String(page));
    url.searchParams.set("pageSize", String(PAGE_SIZE));
    for (const status of ["Active", "ComingSoon", "Pending", "ActiveUnderContract"]) {
      url.searchParams.append("status", status);
    }
    const response = await fetch(url, { cache: "no-store" });
    if (!response.ok) throw new Error(`Website MLS upstream failed with HTTP ${response.status}.`);
    const result = parseSearchResponse(await response.json());
    sourceAsOf = result.feedUpdatedAt || sourceAsOf;
    items.push(...result.items);
    if (items.length >= result.total || result.items.length < PAGE_SIZE) break;
    if (page === 53) throw new Error("Website MLS upstream exceeded the 2,500-listing limit.");
  }
  return { city, items, sourceAsOf };
}

export function buildWebsiteMarketPulse(
  cityResults: Array<{ city: string; items: Listing[]; sourceAsOf?: string }>,
  checkedAt = new Date(),
): WebsiteMarketPulse {
  const allItems = cityResults.flatMap((result) => result.items);
  if (!allItems.length) throw new MarketPulseBlockedError("No displayable listing data was returned.", "empty_feed");

  const sourceTimes = cityResults
    .map((result) => parsedTime(result.sourceAsOf))
    .filter((value): value is number => value !== null);
  const modifiedTimes = allItems
    .map((item) => parsedTime(item.modifiedAt))
    .filter((value): value is number => value !== null);
  const sourceAsOf = sourceTimes.length ? Math.max(...sourceTimes) : null;
  const latestModifiedAt = modifiedTimes.length ? Math.max(...modifiedTimes) : null;
  const domCount = allItems.filter((item) => Number.isFinite(item.daysOnMarket)).length;
  const domCoverage = domCount / allItems.length;
  if (sourceAsOf === null || checkedAt.getTime() - sourceAsOf > 24 * 60 * 60 * 1000) {
    throw new MarketPulseBlockedError("Provider timestamp is more than 24 hours old.", "stale_provider");
  }
  if (latestModifiedAt === null || checkedAt.getTime() - latestModifiedAt > 48 * 60 * 60 * 1000) {
    throw new MarketPulseBlockedError("Listing content is more than 48 hours old.", "stale_content");
  }
  if (domCoverage < 0.5) {
    throw new MarketPulseBlockedError("Days-on-market coverage is below 50%.", "missing_dom");
  }

  const cities = cityResults.map(({ city, items }) => {
    const active = items.filter((item) => ACTIVE_STATUSES.has(item.status));
    const sinceList = (item: Listing) => {
      const value = parsedTime(item.listDate);
      return value === null ? Infinity : checkedAt.getTime() - value;
    };
    const sinceModified = (item: Listing) => {
      const value = parsedTime(item.modifiedAt);
      return value === null ? Infinity : checkedAt.getTime() - value;
    };
    return {
      city,
      activeInventory: active.length,
      comingSoon: items.filter((item) => item.status === "ComingSoon").length,
      pending: items.filter((item) => CONTRACT_STATUSES.has(item.status)).length,
      new24h: items.filter((item) => sinceList(item) >= 0 && sinceList(item) <= DAY_MS).length,
      new7d: items.filter((item) => sinceList(item) >= 0 && sinceList(item) <= 7 * DAY_MS).length,
      updated24h: items.filter((item) => sinceModified(item) >= 0 && sinceModified(item) <= DAY_MS).length,
      fastMoving7d: items.filter(
        (item) => CONTRACT_STATUSES.has(item.status) && sinceList(item) >= 0 && sinceList(item) <= 7 * DAY_MS,
      ).length,
      sellerOpportunity21d: active.filter(
        (item) => Number.isFinite(item.daysOnMarket) && Number(item.daysOnMarket) >= 21,
      ).length,
      medianActiveListPrice: median(
        active.map((item) => item.listPrice).filter((value): value is number => Number.isFinite(value)),
      ),
      medianActiveDaysOnMarket: median(
        active
          .map((item) => item.daysOnMarket)
          .filter((value): value is number => Number.isFinite(value)),
      ),
    };
  });

  const sourceAsOfIso = new Date(sourceAsOf).toISOString();
  return {
    version: 1,
    status: "ready",
    checkedAt: checkedAt.toISOString(),
    sourceAsOf: sourceAsOfIso,
    latestListingModifiedAt: new Date(latestModifiedAt).toISOString(),
    listingCount: allItems.length,
    daysOnMarketCoveragePercent: Math.round(domCoverage * 100),
    refreshSchedule: [
      "08:00 America/Los_Angeles",
      "14:00 America/Los_Angeles",
      "20:00 America/Los_Angeles",
    ],
    criteria: {
      cities: cityResults.map((result) => result.city),
      statuses: ["Active", "ComingSoon", "Pending", "ActiveUnderContract"],
    },
    cities,
    compliance: {
      sourceLine: "Listings courtesy of Northwest MLS as distributed by MLS GRID",
      consumerDisclaimer: `Based on information submitted to the MLS GRID as of ${sourceAsOfIso}. All data is obtained from various sources and may not have been verified by broker or MLS GRID. Supplied Open House Information is subject to change without notice. All information should be independently reviewed and verified for accuracy. Properties may or may not be listed by the office/agent presenting the information.`,
      displayCriteriaRequired: true,
      brokerageIdentityRequired: true,
      dmcaNoticeRequired: true,
    },
  };
}

export async function getWebsiteMarketPulse() {
  const results = await Promise.all(CITIES.map((city) => fetchCity(city)));
  return buildWebsiteMarketPulse(results);
}
