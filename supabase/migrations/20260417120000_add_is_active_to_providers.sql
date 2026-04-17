alter table public.providers
  add column if not exists is_active boolean not null default true;

create index if not exists providers_is_active_idx
  on public.providers (is_active);
