/**
 * 与 public 表行结构对应的类型（ hand-maintained，与 .cursorrules / 迁移保持一致）
 */
export type StayRequestStatus = "pending" | "confirmed" | "declined";

/** anchors.location_source */
export type AnchorLocationSource = "catalog" | "geocoded_manual";

export type AnchorRow = {
  id: string;
  user_id: string | null;
  name: string;
  city: string;
  city_slug: string;
  country: string;
  neighborhood: string | null;
  internship: string | null;
  max_guests: number | null;
  notes: string | null;
  is_active: boolean | null;
  /** 登记 listing 时的 Stanford 邮箱，供 Roamer 联系 */
  contact_email: string | null;
  latitude: number | null;
  longitude: number | null;
  location_source: AnchorLocationSource;
  created_at: string;
};

export type AvailabilityRow = {
  id: string;
  anchor_id: string;
  start_date: string;
  end_date: string;
};

export type StayRequestRow = {
  id: string;
  anchor_id: string;
  roamer_user_id: string | null;
  roamer_name: string;
  roamer_email: string;
  roamer_blurb: string | null;
  check_in: string;
  check_out: string;
  status: StayRequestStatus;
  created_at: string;
};
