create extension if not exists pgcrypto;

create table if not exists mls_sources (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  provider text not null,
  vendor_code text,
  refresh_minutes integer not null default 30,
  created_at timestamptz not null default now()
);

create table if not exists properties (
  id uuid primary key default gen_random_uuid(),
  source_id uuid references mls_sources(id),
  slug text not null unique,
  mls_number text not null,
  simplyrets_listing_id text,
  zillow_zpid text,
  address_line_1 text not null,
  address_line_2 text,
  city text not null,
  state text not null,
  postal_code text not null,
  lat double precision,
  lng double precision,
  status text not null,
  property_type text not null,
  list_price numeric(14,2) not null,
  bedrooms numeric(5,2),
  bathrooms numeric(5,2),
  sqft integer,
  lot_size_text text,
  year_built integer,
  hoa_monthly numeric(12,2),
  taxes_annual numeric(12,2),
  description text,
  canonical_payload jsonb not null default '{}'::jsonb,
  published_at timestamptz,
  updated_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);

create table if not exists property_media (
  id uuid primary key default gen_random_uuid(),
  property_id uuid not null references properties(id) on delete cascade,
  position integer not null default 0,
  media_kind text not null default 'image',
  url text not null,
  alt_text text,
  source text not null,
  created_at timestamptz not null default now()
);

create table if not exists property_location (
  property_id uuid primary key references properties(id) on delete cascade,
  neighborhood text,
  county text,
  school_district text,
  walkability_summary text,
  map_payload jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

create table if not exists property_enrichment (
  property_id uuid primary key references properties(id) on delete cascade,
  zillow_payload jsonb not null default '{}'::jsonb,
  public_record_payload jsonb not null default '{}'::jsonb,
  freshness_score integer not null default 0,
  source_tags text[] not null default '{}',
  last_enriched_at timestamptz,
  expires_at timestamptz
);

create table if not exists property_places (
  id uuid primary key default gen_random_uuid(),
  property_id uuid not null references properties(id) on delete cascade,
  category text not null,
  place_name text not null,
  address text not null,
  rating numeric(3,2),
  distance_miles numeric(6,2),
  payload jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

create table if not exists property_commutes (
  id uuid primary key default gen_random_uuid(),
  property_id uuid not null references properties(id) on delete cascade,
  anchor_label text not null,
  destination text not null,
  mode text not null,
  duration_minutes integer not null,
  payload jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

create table if not exists property_page_cache (
  property_id uuid primary key references properties(id) on delete cascade,
  page_model jsonb not null,
  refreshed_at timestamptz not null default now()
);

create table if not exists sync_runs (
  id uuid primary key default gen_random_uuid(),
  provider text not null,
  sync_type text not null,
  status text not null,
  imported_count integer not null default 0,
  error_message text,
  payload jsonb not null default '{}'::jsonb,
  started_at timestamptz not null default now(),
  finished_at timestamptz
);

create table if not exists api_usage_daily (
  id uuid primary key default gen_random_uuid(),
  provider text not null,
  usage_date date not null,
  calls_made integer not null default 0,
  monthly_limit integer not null,
  reserved_calls integer not null default 0,
  unique (provider, usage_date)
);

create table if not exists lead_events (
  id uuid primary key default gen_random_uuid(),
  property_id uuid references properties(id) on delete set null,
  event_name text not null,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists link_hub_items (
  id uuid primary key default gen_random_uuid(),
  property_id uuid references properties(id) on delete cascade,
  label text not null,
  href text not null,
  tone text not null default 'secondary',
  position integer not null default 0,
  active boolean not null default true
);

create index if not exists idx_properties_status on properties(status);
create index if not exists idx_properties_city on properties(city);
create index if not exists idx_property_places_property on property_places(property_id);
create index if not exists idx_property_commutes_property on property_commutes(property_id);
create index if not exists idx_sync_runs_provider on sync_runs(provider, started_at desc);
create index if not exists idx_api_usage_daily_provider on api_usage_daily(provider, usage_date desc);
