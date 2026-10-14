alter table public.wedding_rsvp
  add column if not exists note text not null default '';

alter table public.wedding_rsvp
  drop constraint if exists wedding_rsvp_note_length;
alter table public.wedding_rsvp
  add constraint wedding_rsvp_note_length
  check (char_length(note) <= 300);

revoke all on table public.wedding_rsvp from anon, authenticated;
grant insert (guest_name, side, attending, note) on table public.wedding_rsvp to anon;

drop policy if exists "Guests can submit private wedding RSVPs" on public.wedding_rsvp;
create policy "Guests can submit private wedding RSVPs"
  on public.wedding_rsvp for insert to anon
  with check (
    char_length(btrim(guest_name)) between 1 and 24
    and side in ('groom', 'bride')
    and attending in (true, false)
    and char_length(note) <= 300
  );
