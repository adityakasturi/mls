import { describe, expect, it } from "vitest";

import { buildWebsiteMarketPulse, MarketPulseBlockedError } from "./market-pulse";

const checkedAt = new Date("2026-08-09T02:00:00Z");

function listing(overrides: Record<string, unknown> = {}) {
  return {
    id: "fixture",
    status: "Active",
    listPrice: 1_500_000,
    daysOnMarket: 22,
    listDate: "2026-08-08T18:00:00Z",
    modifiedAt: "2026-08-09T01:00:00Z",
    ...overrides,
  };
}

describe("website market pulse", () => {
  it("builds aggregate-only lead-generation metrics and compliance copy", () => {
    const result = buildWebsiteMarketPulse(
      [
        {
          city: "Kirkland",
          sourceAsOf: "2026-08-09T01:30:00Z",
          items: [listing(), listing({ id: "fixture-2", status: "Pending", daysOnMarket: 4 })],
        },
      ],
      checkedAt,
    );

    expect(result.status).toBe("ready");
    expect(result.cities[0]).toMatchObject({
      activeInventory: 1,
      pending: 1,
      new24h: 2,
      fastMoving7d: 1,
      sellerOpportunity21d: 1,
    });
    expect(result.compliance.sourceLine).toContain("Northwest MLS");
    expect(JSON.stringify(result)).not.toContain("fixture");
  });

  it("blocks stale listing content even when the provider timestamp is current", () => {
    expect(() =>
      buildWebsiteMarketPulse(
        [
          {
            city: "Kirkland",
            sourceAsOf: "2026-08-09T01:30:00Z",
            items: [listing({ modifiedAt: "2026-06-02T21:27:15Z" })],
          },
        ],
        checkedAt,
      ),
    ).toThrowError(MarketPulseBlockedError);
  });

  it("blocks feeds with inadequate days-on-market coverage", () => {
    expect(() =>
      buildWebsiteMarketPulse(
        [
          {
            city: "Kirkland",
            sourceAsOf: "2026-08-09T01:30:00Z",
            items: [listing({ daysOnMarket: undefined })],
          },
        ],
        checkedAt,
      ),
    ).toThrowError(/coverage is below 50%/);
  });
});
