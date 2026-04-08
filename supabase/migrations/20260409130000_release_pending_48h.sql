-- Release rule: auto-decline pending stay requests after 48 hours.
-- This keeps the community moving and unblocks decision-makers.

create extension if not exists pg_cron;

do $$
begin
  perform cron.unschedule('release_pending_48h');
exception
  when others then null;
end$$;

create or replace function public.release_pending_48h()
returns void
language plpgsql
security definer
set row_security = off
as $$
begin
  update public.stay_requests
  set status = 'declined'
  where status = 'pending'
    and created_at < (now() - interval '48 hours');
end;
$$;

select cron.schedule(
  'release_pending_48h',
  '*/30 * * * *',
  $$
    perform public.release_pending_48h();
  $$
);

