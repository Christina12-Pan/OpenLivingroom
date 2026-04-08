-- Minimal testing gate:
-- - Keep strict "ownership" checks via auth.uid() == anchors.user_id
-- - Remove dependency on auth.jwt()->>'email' (or auth.users access) to avoid "permission denied for table users"
--   and make local testing work even if JWT email claim is missing.

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
    );

  -- anchors_update_owner
  drop policy if exists "anchors_update_owner" on public.anchors;
  create policy "anchors_update_owner"
    on public.anchors
    for update
    using (
      auth.uid() = user_id
    )
    with check (
      auth.uid() = user_id
    );

  -- stay_requests_insert_authenticated_roamer
  drop policy if exists "stay_requests_insert_authenticated_roamer" on public.stay_requests;
  create policy "stay_requests_insert_authenticated_roamer"
    on public.stay_requests
    for insert
    with check (
      auth.uid() is not null
      and auth.uid() = roamer_user_id
      and exists (
        select 1
        from public.anchors a
        where a.id = anchor_id
          and a.is_active = true
      )
    );

  -- availability_*: also enforce ownership
  drop policy if exists "availability_insert_owner" on public.availability;
  create policy "availability_insert_owner"
    on public.availability
    for insert
    with check (
      exists (
        select 1 from public.anchors a
        where a.id = anchor_id and a.user_id = auth.uid()
      )
    );

  drop policy if exists "availability_update_owner" on public.availability;
  create policy "availability_update_owner"
    on public.availability
    for update
    using (
      exists (
        select 1 from public.anchors a
        where a.id = anchor_id and a.user_id = auth.uid()
      )
    )
    with check (
      exists (
        select 1 from public.anchors a
        where a.id = anchor_id and a.user_id = auth.uid()
      )
    );

  drop policy if exists "availability_delete_owner" on public.availability;
  create policy "availability_delete_owner"
    on public.availability
    for delete
    using (
      exists (
        select 1 from public.anchors a
        where a.id = anchor_id and a.user_id = auth.uid()
      )
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
    )
    with check (
      exists (
        select 1 from public.anchors a
        where a.id = anchor_id and a.user_id = auth.uid()
      )
    );
end
$$;

