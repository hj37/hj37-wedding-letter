-- Shared no-login wedding guestbook. RLS and column grants allow read/add only.
create table if not exists public.wedding_guestbook (
  id uuid primary key default gen_random_uuid(),
  guest_name text not null,
  message text not null,
  created_at timestamptz not null default now(),
  constraint wedding_guestbook_name_length check (char_length(btrim(guest_name)) between 1 and 24),
  constraint wedding_guestbook_message_length check (char_length(btrim(message)) between 1 and 300)
);

alter table public.wedding_guestbook enable row level security;
revoke all on table public.wedding_guestbook from anon, authenticated;
grant select on table public.wedding_guestbook to anon;
grant insert (guest_name, message) on table public.wedding_guestbook to anon;

drop policy if exists "Anyone can read wedding guestbook" on public.wedding_guestbook;
create policy "Anyone can read wedding guestbook"
  on public.wedding_guestbook for select to anon using (true);

drop policy if exists "Guests can add wedding guestbook messages" on public.wedding_guestbook;
create policy "Guests can add wedding guestbook messages"
  on public.wedding_guestbook for insert to anon
  with check (
    char_length(btrim(guest_name)) between 1 and 24
    and char_length(btrim(message)) between 1 and 300
  );
