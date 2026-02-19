// -----------------------------------------------------------------------------
// Client Types — matches client_profiles table in database
// -----------------------------------------------------------------------------

export type ClientProfile = {
  id: string;
  user_id: string;
  address: string | null;
  suburb: string | null;
  city: string | null;
  province: string | null;
  location_lat: number | null;
  location_lng: number | null;
  preferred_contact: string;
  created_at: string;
  updated_at: string;
};
