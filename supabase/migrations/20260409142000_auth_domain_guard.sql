-- Hard gate: only allow @stanford.edu users to insert anchors and stay_requests.
-- This complements app-level checks and prevents bypassing the UI.

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
      and exists (
        select 1
        from auth.users u
        where u.id = auth.uid()
          and u.email ilike '%@stanford.edu'
      )
    );

  -- anchors_update_owner
  drop policy if exists "anchors_update_owner" on public.anchors;
  create policy "anchors_update_owner"
    on public.anchors
    for update
    using (
      auth.uid() = user_id
      and exists (
        select 1
        from auth.users u
        where u.id = auth.uid()
          and u.email ilike '%@stanford.edu'
      )
    )
    with check (
      auth.uid() = user_id
      and exists (
        select 1
        from auth.users u
        where u.id = auth.uid()
          and u.email ilike '%@stanford.edu'
      )
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
        from auth.users u
        where u.id = auth.uid()
          and u.email ilike '%@stanford.edu'
      )
      and exists (
        select 1
        from public.anchors a
        where a.id = anchor_id
          and a.is_active = true
      )
    );

  -- availability_*: also enforce @stanford.edu ownership
  drop policy if exists "availability_insert_owner" on public.availability;
  create policy "availability_insert_owner"
    on public.availability
    for insert
    with check (
      exists (
        select 1 from public.anchors a
        where a.id = anchor_id and a.user_id = auth.uid()
      )
      and exists (
        select 1
        from auth.users u
        where u.id = auth.uid()
          and u.email ilike '%@stanford.edu'
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
      and exists (
        select 1
        from auth.users u
        where u.id = auth.uid()
          and u.email ilike '%@stanford.edu'
      )
    )
    with check (
      exists (
        select 1 from public.anchors a
        where a.id = anchor_id and a.user_id = auth.uid()
      )
      and exists (
        select 1
        from auth.users u
        where u.id = auth.uid()
          and u.email ilike '%@stanford.edu'
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
      and exists (
        select 1
        from auth.users u
        where u.id = auth.uid()
          and u.email ilike '%@stanford.edu'
      )
    );

  -- stay_requests_update_anchor_owner: enforce @stanford.edu anchor owners
  drop policy if exists "stay_requests_update_anchor_owner" on public.stay_requests;
  create policy "stay_requests_update_anchor_owner"
    on public.stay_requests
    for update
    using (
      exists (
        select 1 from public.anchors a
        where a.id = anchor_id and a.user_id = auth.uid()
      )
      and exists (
        select 1
        from auth.users u
        where u.id = auth.uid()
          and u.email ilike '%@stanford.edu'
      )
    )
    with check (
      exists (
        select 1 from public.anchors a
        where a.id = anchor_id and a.user_id = auth.uid()
      )
      and exists (
        select 1
        from auth.users u
        where u.id = auth.uid()
          and u.email ilike '%@stanford.edu'
      )
    );
end
$$;

