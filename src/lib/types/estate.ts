// -----------------------------------------------------------------------------
// Estate Types — matches estates and worker_estate_registrations tables
// -----------------------------------------------------------------------------

export type SAProvince =
  | 'Gauteng'
  | 'Western Cape'
  | 'KwaZulu-Natal'
  | 'Eastern Cape'
  | 'Free State'
  | 'Mpumalanga'
  | 'Limpopo'
  | 'North West'
  | 'Northern Cape';

export type Estate = {
  id: string;
  name: string;
  suburb: string;
  city: string;
  province: string;
  location_lat: number | null;
  location_lng: number | null;
  security_company: string | null;
  requires_preregistration: boolean;
  is_verified: boolean;
  added_by: string | null;
  created_at: string;
};

export type WorkerEstateRegistration = {
  id: string;
  worker_id: string;
  estate_id: string;
  registration_number: string | null;
  registered_since: string | null;
  created_at: string;
  // Joined fields (optional)
  estate?: Estate;
};
