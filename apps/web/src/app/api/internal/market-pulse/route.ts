import { timingSafeEqual } from "node:crypto";
import { NextRequest, NextResponse } from "next/server";

import { getWebsiteMarketPulse, MarketPulseBlockedError } from "@/lib/market-pulse";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

function authorized(request: NextRequest) {
  const expected = process.env.WEBSITE_MLS_DATA_TOKEN;
  const supplied = request.headers.get("authorization")?.replace(/^Bearer\s+/i, "");
  if (!expected || !supplied) return false;
  const expectedBuffer = Buffer.from(expected);
  const suppliedBuffer = Buffer.from(supplied);
  return expectedBuffer.length === suppliedBuffer.length && timingSafeEqual(expectedBuffer, suppliedBuffer);
}

export async function GET(request: NextRequest) {
  if (!authorized(request)) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  try {
    return NextResponse.json(await getWebsiteMarketPulse(), {
      headers: { "Cache-Control": "private, no-store" },
    });
  } catch (error) {
    if (error instanceof MarketPulseBlockedError) {
      return NextResponse.json(
        { version: 1, status: "blocked", code: error.code, message: error.message },
        { status: 503, headers: { "Cache-Control": "private, no-store" } },
      );
    }
    console.error("Website MLS market pulse failed", error);
    return NextResponse.json(
      { version: 1, status: "error", message: "Market pulse is temporarily unavailable." },
      { status: 502, headers: { "Cache-Control": "private, no-store" } },
    );
  }
}
