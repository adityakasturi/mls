import { McpServer } from "@modelcontextprotocol/server";
import { serveStdio } from "@modelcontextprotocol/server/stdio";
import * as z from "zod/v4";

const MONTHLY_LIMIT = 10000;
const RESERVED_CALLS = 2000;
const USED_THIS_MONTH = 1180;

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

function ensureConfigured() {
  if (!process.env.AXESSO_API_KEY) {
    throw new Error("Axesso API key is not configured.");
  }
}

function remainingOperationalCalls() {
  return MONTHLY_LIMIT - RESERVED_CALLS - USED_THIS_MONTH;
}

const server = new McpServer({
  name: "zillow-enrichment-plugin",
  version: "0.1.0"
});

server.registerTool(
  "match_property_to_zillow",
  {
    title: "Match Property To Zillow",
    description: "Create a deterministic candidate match payload for a property address.",
    inputSchema: z.object({
      address: z.string().min(8),
      city: z.string().min(2),
      state: z.string().length(2),
      postalCode: z.string().min(5)
    }),
    annotations: {
      readOnlyHint: true,
      destructiveHint: false,
      idempotentHint: true,
      openWorldHint: false
    }
  },
  async ({ address, city, state, postalCode }) =>
    content(
      JSON.stringify(
        {
          status: "candidate_match",
          normalized_query: `${address}, ${city}, ${state} ${postalCode}`,
          confidence: "manual_review_first",
          note: "Use this normalized address string before calling the live Axesso endpoint."
        },
        null,
        2
      )
    )
);

server.registerTool(
  "get_usage_summary",
  {
    title: "Get Zillow Usage Summary",
    description: "Show the current monthly budget posture for Axesso enrichment.",
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
          provider: "axesso",
          monthly_limit: MONTHLY_LIMIT,
          reserved_calls: RESERVED_CALLS,
          used_this_month: USED_THIS_MONTH,
          remaining_operational_calls: remainingOperationalCalls()
        },
        null,
        2
      )
    )
);

server.registerTool(
  "refresh_property_enrichment",
  {
    title: "Refresh Property Enrichment",
    description:
      "Quota-guarded enrichment entrypoint. Returns a queue-style response until the live Axesso fetcher is wired in.",
    inputSchema: z.object({
      propertyId: z.string().min(1),
      priority: z.enum(["normal", "featured"]).default("normal")
    }),
    annotations: {
      readOnlyHint: false,
      destructiveHint: false,
      idempotentHint: true,
      openWorldHint: true
    }
  },
  async ({ propertyId, priority }) => {
    try {
      ensureConfigured();

      if (remainingOperationalCalls() <= 0 && priority !== "featured") {
        return errorContent("Operational Axesso budget is exhausted for this month.");
      }

      return content(
        JSON.stringify(
          {
            status: "queued",
            propertyId,
            priority,
            provider: "axesso",
            note: "Replace this placeholder with the live enrichment queue and Supabase write path."
          },
          null,
          2
        )
      );
    } catch (error) {
      return errorContent(error instanceof Error ? error.message : "Unknown error");
    }
  }
);

server.registerTool(
  "disable_enrichment_for_property",
  {
    title: "Disable Enrichment For Property",
    description: "Return the command payload needed to disable enrichment for a specific property.",
    inputSchema: z.object({
      propertyId: z.string().min(1),
      reason: z.string().min(8)
    }),
    annotations: {
      readOnlyHint: false,
      destructiveHint: false,
      idempotentHint: true,
      openWorldHint: false
    }
  },
  async ({ propertyId, reason }) =>
    content(
      JSON.stringify(
        {
          status: "prepared",
          propertyId,
          action: "disable_enrichment",
          reason
        },
        null,
        2
      )
    )
);

await serveStdio(server);

