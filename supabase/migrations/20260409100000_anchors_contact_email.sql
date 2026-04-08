-- Roamer 联系 Anchor：展示注册时的 @stanford.edu（auth 邮箱不落 public 表，故冗余存储）
alter table public.anchors
  add column if not exists contact_email text;

comment on column public.anchors.contact_email is 'Stanford Google email captured at listing creation for Roamer mailto contact';
