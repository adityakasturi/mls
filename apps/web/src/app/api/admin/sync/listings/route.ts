import { NextResponse } from "next/server";

import { fetchSimplyRETSListings } from "@/lib/vendor";

function isAuthorized(request: Request) {
  const token = request.headers.get("x-admin-token");
  return Boolean(token && token === process.env.ADMIN_API_TOKEN);
}

export async function GET(request: Request) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const result = await fetchSimplyRETSListings();

  if (!result.ok) {
    return NextResponse.json(
      {
        status: "skipped",
        provider: "simplyrets",
        message: result.message
      },
      { status: 200 }
    );
  }

  const items = Array.isArray(result.payload) ? result.payload.length : 0;

  return NextResponse.json({
    status: "ok",
    provider: "simplyrets",
    imported: items,
    refreshedAt: new Date().toISOString()
  });
}

