import { NextResponse } from "next/server";

import { axessoUsageSummary } from "@/lib/data";
import { hasAxessoConfig } from "@/lib/vendor";

type RouteProps = {
  params: Promise<{
    propertyId: string;
  }>;
};

function isAuthorized(request: Request) {
  const token = request.headers.get("x-admin-token");
  return Boolean(token && token === process.env.ADMIN_API_TOKEN);
}

export async function POST(request: Request, { params }: RouteProps) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const { propertyId } = await params;

  if (!hasAxessoConfig()) {
    return NextResponse.json({
      status: "skipped",
      propertyId,
      provider: "axesso",
      message: "Axesso API key is not configured."
    });
  }

  if (axessoUsageSummary.remainingOperational <= 0) {
    return NextResponse.json(
      {
        status: "blocked",
        propertyId,
        provider: "axesso",
        message: "Operational Zillow enrichment budget is exhausted for this month."
      },
      { status: 429 }
    );
  }

  return NextResponse.json({
    status: "queued",
    propertyId,
    provider: "axesso",
    message: "Enrichment job accepted. Replace this stub with the live Supabase-backed queue."
  });
}

