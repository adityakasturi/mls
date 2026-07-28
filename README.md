# MLS.adityakasturi.com V1

NWMLS-first property platform for `mls.adityakasturi.com`.

## What ships in V1

- Next.js property site with one flagship property details page
- Supabase-ready schema for listing, enrichment, usage, and cache tables
- SimplyRETS-first ingestion model
- Axesso Zillow enrichment wrapper with quota guardrails
- Google Maps neighborhood intelligence hooks
- GitHub Actions CI + Vercel deployment workflow
- Two Codex plugin packages:
  - `mls-plugin`
  - `zillow-enrichment-plugin`

## Local setup

1. Copy `.env.example` to `.env.local`
2. Fill in Supabase, SimplyRETS, Axesso, and Google Maps credentials
3. Run `pnpm install`
4. Run `pnpm dev`

## Database

Apply the migration in [supabase/migrations/20260728_init_mls.sql](/Users/ak/SIR/ai/Systems/website/mls/supabase/migrations/20260728_init_mls.sql:1) to your Supabase project.

## Deploy

GitHub Actions expects these repository secrets:

- `VERCEL_TOKEN`
- `VERCEL_ORG_ID`
- `VERCEL_PROJECT_ID`

The workflow deploys preview builds on pull requests and production on pushes to `main`.

