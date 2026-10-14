-- Private RSVP inbox. Only the couple can view replies through the Supabase dashboard.
create table if not exists public.wedding_rsvp (
  id uuid primary key default gen_random_uuid(),
  guest_name text not null,
  side text check (side in ('groom', 'bride')),
  attending boolean not null,
  note text not null default '',
  created_at timestamptz not null default now(),
  constraint wedding_rsvp_name_length check (char_length(btrim(guest_name)) between 1 and 24)
);
alter table public.wedding_rsvp add column if not exists note text not null default '';
alter table public.wedding_rsvp drop constraint if exists wedding_rsvp_note_length;
alter table public.wedding_rsvp add constraint wedding_rsvp_note_length check (char_length(note) <= 300);
alter table public.wedding_rsvp alter column side drop not null;
alter table public.wedding_rsvp enable row level security;
revoke all on table public.wedding_rsvp from anon, authenticated;
grant insert (guest_name, side, attending, note) on table public.wedding_rsvp to anon;
drop policy if exists "Guests can submit private wedding RSVPs" on public.wedding_rsvp;
create policy "Guests can submit private wedding RSVPs"
  on public.wedding_rsvp for insert to anon
  with check (char_length(btrim(guest_name)) between 1 and 24 and side in ('groom', 'bride') and attending in (true, false) and char_length(note) <= 300);
