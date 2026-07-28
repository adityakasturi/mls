import { NextResponse } from "next/server";

import { axessoUsageSummary } from "@/lib/data";

function isAuthorized(request: Request) {
  const token = request.headers.get("x-admin-token");
  return Boolean(token && token === process.env.ADMIN_API_TOKEN);
}

export async function GET(request: Request) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  return NextResponse.json(axessoUsageSummary);
}

