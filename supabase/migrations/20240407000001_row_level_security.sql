-- RLS: public read for active listings; Anchors edit only their rows; Roamers insert/read own requests.

alter table public.anchors enable row level security;
alter table public.availability enable row level security;
alter table public.stay_requests enable row level security;

-- anchors
create policy "anchors_select_visible_or_owner"
  on public.anchors
  for select
  using (is_active = true or auth.uid() = user_id);

create policy "anchors_insert_authenticated_owner"
  on public.anchors
  for insert
  with check (auth.uid() is not null and auth.uid() = user_id);

create policy "anchors_update_owner"
  on public.anchors
  for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "anchors_delete_owner"
  on public.anchors
  for delete
  using (auth.uid() = user_id);

-- availability
create policy "availability_select_linked_anchor"
  on public.availability
  for select
  using (
    exists (
      select 1
      from public.anchors a
      where a.id = anchor_id
        and (a.is_active = true or a.user_id = auth.uid())
    )
  );

create policy "availability_insert_owner"
  on public.availability
  for insert
  with check (
    exists (
      select 1 from public.anchors a
      where a.id = anchor_id and a.user_id = auth.uid()
    )
  );

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

create policy "availability_delete_owner"
  on public.availability
  for delete
  using (
    exists (
      select 1 from public.anchors a
      where a.id = anchor_id and a.user_id = auth.uid()
    )
  );

-- stay_requests
create policy "stay_requests_select_roamer_anchor_or_public_active"
  on public.stay_requests
  for select
  using (
    roamer_user_id = auth.uid()
    or exists (
      select 1 from public.anchors a
      where a.id = anchor_id and a.user_id = auth.uid()
    )
    or exists (
      select 1 from public.anchors a
      where a.id = anchor_id and a.is_active = true
    )
  );

create policy "stay_requests_insert_authenticated_roamer"
  on public.stay_requests
  for insert
  with check (
    auth.uid() is not null
    and auth.uid() = roamer_user_id
    and exists (
      select 1 from public.anchors a
      where a.id = anchor_id and a.is_active = true
    )
  );

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
