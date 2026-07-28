import { describe, expect, it } from "vitest";

import { axessoUsageSummary, demoProperty, getPropertyBySlug } from "./data";

describe("property model", () => {
  it("returns the flagship property by slug", () => {
    expect(getPropertyBySlug(demoProperty.slug)?.id).toBe(demoProperty.id);
  });

  it("respects the Zillow operational headroom plan", () => {
    expect(
      axessoUsageSummary.monthlyLimit - axessoUsageSummary.monthlyReserved
    ).toBeGreaterThan(axessoUsageSummary.usedThisMonth);
  });
});
