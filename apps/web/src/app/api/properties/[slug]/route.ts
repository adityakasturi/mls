import { NextResponse } from "next/server";

import { getPropertyBySlug } from "@/lib/data";

type RouteProps = {
  params: Promise<{
    slug: string;
  }>;
};

export async function GET(_: Request, { params }: RouteProps) {
  const { slug } = await params;
  const property = getPropertyBySlug(slug);

  if (!property) {
    return NextResponse.json({ error: "Property not found." }, { status: 404 });
  }

  return NextResponse.json(property);
}

