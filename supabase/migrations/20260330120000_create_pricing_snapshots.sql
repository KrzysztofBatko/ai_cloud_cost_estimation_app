create table if not exists public.pricing_snapshots (
  id uuid primary key default gen_random_uuid(),
  region text not null,
  pricing_as_of date not null,
  source text not null,
  catalog jsonb not null,
  notes text,
  created_at timestamptz not null default now(),
  created_by text
);

create index if not exists pricing_snapshots_region_created_at_idx
  on public.pricing_snapshots (region, created_at desc);

create index if not exists pricing_snapshots_pricing_as_of_idx
  on public.pricing_snapshots (pricing_as_of desc);
