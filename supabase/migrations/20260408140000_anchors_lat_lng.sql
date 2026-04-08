-- 地图点位：目录内城市用 slug 查表；手动添加的地点存 Nominatim 解析的经纬度
alter table public.anchors
  add column if not exists latitude double precision,
  add column if not exists longitude double precision;

alter table public.anchors
  add column if not exists location_source text not null default 'catalog';

alter table public.anchors
  drop constraint if exists anchors_location_source_check;

alter table public.anchors
  add constraint anchors_location_source_check
  check (location_source in ('catalog', 'geocoded_manual'));

comment on column public.anchors.latitude is 'Map marker latitude; set when location_source = geocoded_manual or future catalog enrich';
comment on column public.anchors.longitude is 'Map marker longitude';
comment on column public.anchors.location_source is 'catalog: from geo_city_options; geocoded_manual: from /api/geocode (Nominatim)';
