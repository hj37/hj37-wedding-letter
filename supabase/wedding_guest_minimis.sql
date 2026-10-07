-- Public, no-login minimi board for the wedding invitation.
-- Run once in the linked Supabase project's SQL editor; safe to re-run.
create table if not exists public.wedding_guest_minimis (
  id uuid primary key default gen_random_uuid(),
  minimi_id smallint not null check (minimi_id between 1 and 6),
  created_at timestamptz not null default now()
);

alter table public.wedding_guest_minimis enable row level security;
revoke all on table public.wedding_guest_minimis from anon, authenticated;
grant select, insert on table public.wedding_guest_minimis to anon;

drop policy if exists "Public can see wedding guest minimis" on public.wedding_guest_minimis;
create policy "Public can see wedding guest minimis"
  on public.wedding_guest_minimis for select to anon using (true);

drop policy if exists "Public can add wedding guest minimis" on public.wedding_guest_minimis;
create policy "Public can add wedding guest minimis"
  on public.wedding_guest_minimis for insert to anon
  with check (minimi_id between 1 and 6);
