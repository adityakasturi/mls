import { McpServer } from "@modelcontextprotocol/server";
import { serveStdio } from "@modelcontextprotocol/server/stdio";
import * as z from "zod/v4";

const baseUrl = "https://api.simplyrets.com";

type ListingSummary = {
  id: string;
  address: string;
  price: number | null;
  beds: number | null;
  baths: number | null;
  status: string | null;
};

function getAuthHeader() {
  const key = process.env.SIMPLYRETS_API_KEY;
  const secret = process.env.SIMPLYRETS_API_SECRET;

  if (!key || !secret) {
    return null;
  }

  return `Basic ${Buffer.from(`${key}:${secret}`).toString("base64")}`;
}

async function fetchJson<T>(path: string) {
  const auth = getAuthHeader();

  if (!auth) {
    throw new Error("SimplyRETS credentials are not configured.");
  }

  const response = await fetch(`${baseUrl}${path}`, {
    headers: {
      Authorization: auth
    }
  });

  if (!response.ok) {
    throw new Error(`SimplyRETS request failed with ${response.status}.`);
  }

  return (await response.json()) as T;
}

function toListingSummary(listing: Record<string, unknown>): ListingSummary {
  const address = listing.address as Record<string, unknown> | undefined;
  const property = listing.property as Record<string, unknown> | undefined;

  return {
    id: String(listing.mlsId ?? listing.id ?? "unknown"),
    address: [address?.full, address?.city, address?.state]
      .filter(Boolean)
      .join(", "),
    price:
      typeof listing.listPrice === "number"
        ? listing.listPrice
        : typeof listing.closePrice === "number"
          ? listing.closePrice
          : null,
    beds: typeof property?.bedrooms === "number" ? property.bedrooms : null,
    baths:
      typeof property?.bathsFull === "number"
        ? property.bathsFull
        : typeof property?.bathsHalf === "number"
          ? property.bathsHalf
          : null,
    status: typeof listing.status === "string" ? listing.status : null
  };
}

function content(text: string) {
  return {
    content: [{ type: "text" as const, text }]
  };
}

function errorContent(text: string) {
  return {
    content: [{ type: "text" as const, text }],
    isError: true
  };
}

const server = new McpServer({
  name: "mls-plugin",
  version: "0.1.0"
});

server.registerTool(
  "search_listings",
  {
    title: "Search MLS Listings",
    description: "Search SimplyRETS listings by city, status, and limit.",
    inputSchema: z.object({
      city: z.string().optional(),
      status: z.string().default("Active"),
      limit: z.number().int().min(1).max(25).default(10)
    }),
    annotations: {
      readOnlyHint: true,
      destructiveHint: false,
      idempotentHint: true,
      openWorldHint: true
    }
  },
  async ({ city, status, limit }) => {
    try {
      const params = new URLSearchParams({
        limit: String(limit),
        status
      });

      if (city) {
        params.set("cities", city);
      }

      const listings = await fetchJson<Record<string, unknown>[]>(
        `/properties?${params.toString()}`
      );

      const items = listings.slice(0, limit).map(toListingSummary);

      return content(JSON.stringify({ items, total_count: items.length }, null, 2));
    } catch (error) {
      return errorContent(error instanceof Error ? error.message : "Unknown error");
    }
  }
);

server.registerTool(
  "get_listing",
  {
    title: "Get One Listing",
    description: "Fetch one MLS listing by its SimplyRETS listing id.",
    inputSchema: z.object({
      listingId: z.string().min(1)
    }),
    annotations: {
      readOnlyHint: true,
      destructiveHint: false,
      idempotentHint: true,
      openWorldHint: true
    }
  },
  async ({ listingId }) => {
    try {
      const listing = await fetchJson<Record<string, unknown>>(`/properties/${listingId}`);
      return content(JSON.stringify(listing, null, 2));
    } catch (error) {
      return errorContent(error instanceof Error ? error.message : "Unknown error");
    }
  }
);

server.registerTool(
  "sync_featured_listings",
  {
    title: "Sync Featured Listings",
    description:
      "Prepare a batch sync instruction for featured listings. This is the repo-safe placeholder before the live Supabase queue is wired in.",
    inputSchema: z.object({
      listingIds: z.array(z.string()).min(1).max(20)
    }),
    annotations: {
      readOnlyHint: false,
      destructiveHint: false,
      idempotentHint: true,
      openWorldHint: false
    }
  },
  async ({ listingIds }) => {
    return content(
      JSON.stringify(
        {
          status: "queued",
          queued_count: listingIds.length,
          next_step:
            "Replace this placeholder with the Supabase-backed sync worker in production."
        },
        null,
        2
      )
    );
  }
);

server.registerTool(
  "get_sync_status",
  {
    title: "Get Sync Status",
    description: "Return a compact sync status summary for the MLS ingest flow.",
    inputSchema: z.object({}),
    annotations: {
      readOnlyHint: true,
      destructiveHint: false,
      idempotentHint: true,
      openWorldHint: false
    }
  },
  async () =>
    content(
      JSON.stringify(
        {
          provider: "simplyrets",
          cadence_minutes: 30,
          first_market: "NWMLS",
          source_of_truth: "MLS listing facts"
        },
        null,
        2
      )
    )
);

await serveStdio(server);

