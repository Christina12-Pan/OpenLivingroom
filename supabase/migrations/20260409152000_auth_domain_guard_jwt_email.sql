-- Fix: avoid querying auth.users in RLS policies.
-- Some clients lack SELECT privileges on auth.users, causing:
-- "permission denied for table users" and 403 Forbidden.
--
-- Use JWT email claim instead: auth.jwt()->>'email'

do $$
begin
  -- anchors_insert_authenticated_owner
  drop policy if exists "anchors_insert_authenticated_owner" on public.anchors;
  create policy "anchors_insert_authenticated_owner"
    on public.anchors
    for insert
    with check (
      auth.uid() is not null
      and auth.uid() = user_id
      and coalesce(auth.jwt() ->> 'email', '') ilike '%@stanford.edu'
    );

  -- anchors_update_owner
  drop policy if exists "anchors_update_owner" on public.anchors;
  create policy "anchors_update_owner"
    on public.anchors
    for update
    using (
      auth.uid() = user_id
      and coalesce(auth.jwt() ->> 'email', '') ilike '%@stanford.edu'
    )
    with check (
      auth.uid() = user_id
      and coalesce(auth.jwt() ->> 'email', '') ilike '%@stanford.edu'
    );

  -- stay_requests_insert_authenticated_roamer
  drop policy if exists "stay_requests_insert_authenticated_roamer" on public.stay_requests;
  create policy "stay_requests_insert_authenticated_roamer"
    on public.stay_requests
    for insert
    with check (
      auth.uid() is not null
      and auth.uid() = roamer_user_id
      and coalesce(auth.jwt() ->> 'email', '') ilike '%@stanford.edu'
      and exists (
        select 1
        from public.anchors a
        where a.id = anchor_id
          and a.is_active = true
      )
    );

  -- availability_insert_owner
  drop policy if exists "availability_insert_owner" on public.availability;
  create policy "availability_insert_owner"
    on public.availability
    for insert
    with check (
      exists (
        select 1 from public.anchors a
        where a.id = anchor_id and a.user_id = auth.uid()
      )
      and coalesce(auth.jwt() ->> 'email', '') ilike '%@stanford.edu'
    );

  -- availability_update_owner
  drop policy if exists "availability_update_owner" on public.availability;
  create policy "availability_update_owner"
    on public.availability
    for update
    using (
      exists (
        select 1 from public.anchors a
        where a.id = anchor_id and a.user_id = auth.uid()
      )
      and coalesce(auth.jwt() ->> 'email', '') ilike '%@stanford.edu'
    )
    with check (
      exists (
        select 1 from public.anchors a
        where a.id = anchor_id and a.user_id = auth.uid()
      )
      and coalesce(auth.jwt() ->> 'email', '') ilike '%@stanford.edu'
    );

  -- availability_delete_owner
  drop policy if exists "availability_delete_owner" on public.availability;
  create policy "availability_delete_owner"
    on public.availability
    for delete
    using (
      exists (
        select 1 from public.anchors a
        where a.id = anchor_id and a.user_id = auth.uid()
      )
      and coalesce(auth.jwt() ->> 'email', '') ilike '%@stanford.edu'
    );

  -- stay_requests_update_anchor_owner
  drop policy if exists "stay_requests_update_anchor_owner" on public.stay_requests;
  create policy "stay_requests_update_anchor_owner"
    on public.stay_requests
    for update
    using (
      exists (
        select 1 from public.anchors a
        where a.id = anchor_id and a.user_id = auth.uid()
      )
      and coalesce(auth.jwt() ->> 'email', '') ilike '%@stanford.edu'
    )
    with check (
      exists (
        select 1 from public.anchors a
        where a.id = anchor_id and a.user_id = auth.uid()
      )
      and coalesce(auth.jwt() ->> 'email', '') ilike '%@stanford.edu'
    );
end
$$;

