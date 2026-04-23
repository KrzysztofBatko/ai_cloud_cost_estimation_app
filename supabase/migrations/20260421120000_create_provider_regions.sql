create table if not exists public.provider_regions (
  id uuid primary key default gen_random_uuid(),
  provider_id uuid not null references public.providers (id) on delete cascade,
  value text not null,
  label text not null,
  is_default boolean not null default false,
  created_at timestamptz not null default now()
);

create unique index if not exists provider_regions_provider_value_unique_idx
  on public.provider_regions (provider_id, value);

create unique index if not exists provider_regions_single_default_idx
  on public.provider_regions (provider_id)
  where is_default = true;

create index if not exists provider_regions_provider_idx
  on public.provider_regions (provider_id);

insert into public.provider_regions (provider_id, value, label, is_default)
select
  p.id,
  region.value,
  region.label,
  region.is_default
from public.providers p
cross join lateral (
  values
    ('eu-west-1', 'Europe (Ireland)', true),
    ('eu-central-1', 'Europe (Frankfurt)', false),
    ('us-east-1', 'US East (N. Virginia)', false),
    ('us-west-2', 'US West (Oregon)', false),
    ('ap-southeast-1', 'Asia Pacific (Singapore)', false),
    ('ap-northeast-1', 'Asia Pacific (Tokyo)', false)
) as region(value, label, is_default)
where lower(p.name) like '%aws%' or lower(p.name) like '%amazon%'
on conflict (provider_id, value) do nothing;

insert into public.provider_regions (provider_id, value, label, is_default)
select
  p.id,
  region.value,
  region.label,
  region.is_default
from public.providers p
cross join lateral (
  values
    ('westeurope', 'West Europe', true),
    ('northeurope', 'North Europe', false),
    ('eastus', 'East US', false),
    ('westus3', 'West US 3', false),
    ('southeastasia', 'Southeast Asia', false),
    ('japaneast', 'Japan East', false)
) as region(value, label, is_default)
where lower(p.name) like '%azure%'
on conflict (provider_id, value) do nothing;

insert into public.provider_regions (provider_id, value, label, is_default)
select
  p.id,
  region.value,
  region.label,
  region.is_default
from public.providers p
cross join lateral (
  values
    ('europe-west1', 'Europe West 1 (Belgium)', true),
    ('europe-west3', 'Europe West 3 (Frankfurt)', false),
    ('us-east1', 'US East 1 (South Carolina)', false),
    ('us-west1', 'US West 1 (Oregon)', false),
    ('asia-southeast1', 'Asia Southeast 1 (Singapore)', false),
    ('asia-northeast1', 'Asia Northeast 1 (Tokyo)', false)
) as region(value, label, is_default)
where lower(p.name) like '%google%' or lower(p.name) like '%gcp%'
on conflict (provider_id, value) do nothing;

insert into public.provider_regions (provider_id, value, label, is_default)
select
  p.id,
  region.value,
  region.label,
  region.is_default
from public.providers p
cross join lateral (
  values
    ('eu-frankfurt-1', 'Europe (Frankfurt)', true),
    ('eu-amsterdam-1', 'Europe (Amsterdam)', false),
    ('us-ashburn-1', 'US East (Ashburn)', false),
    ('us-phoenix-1', 'US West (Phoenix)', false),
    ('ap-singapore-1', 'Asia Pacific (Singapore)', false),
    ('ap-tokyo-1', 'Asia Pacific (Tokyo)', false)
) as region(value, label, is_default)
where lower(p.name) like '%oracle%'
on conflict (provider_id, value) do nothing;
