import { z } from "zod";

const simplyRetsEnvSchema = z.object({
  SIMPLYRETS_API_KEY: z.string().min(1),
  SIMPLYRETS_API_SECRET: z.string().min(1),
  SIMPLYRETS_VENDOR: z.string().optional()
});

const axessoEnvSchema = z.object({
  AXESSO_API_KEY: z.string().min(1)
});

export function hasSimplyRETSConfig() {
  return simplyRetsEnvSchema.safeParse(process.env).success;
}

export function hasAxessoConfig() {
  return axessoEnvSchema.safeParse(process.env).success;
}

export async function fetchSimplyRETSListings() {
  const parsed = simplyRetsEnvSchema.safeParse(process.env);

  if (!parsed.success) {
    return {
      ok: false as const,
      message: "SimplyRETS credentials are not configured."
    };
  }

  const auth = Buffer.from(
    `${parsed.data.SIMPLYRETS_API_KEY}:${parsed.data.SIMPLYRETS_API_SECRET}`
  ).toString("base64");

  const response = await fetch("https://api.simplyrets.com/properties", {
    headers: {
      Authorization: `Basic ${auth}`
    },
    next: { revalidate: 1800 }
  });

  if (!response.ok) {
    return {
      ok: false as const,
      message: `SimplyRETS request failed with ${response.status}.`
    };
  }

  const payload = await response.json();

  return {
    ok: true as const,
    payload
  };
}

