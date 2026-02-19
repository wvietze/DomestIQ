// -----------------------------------------------------------------------------
// User & Profile Types — matches profiles table in database
// -----------------------------------------------------------------------------

export type UserRole = 'worker' | 'client' | 'admin';

export type Profile = {
  id: string;
  role: string;
  full_name: string;
  phone: string | null;
  email: string | null;
  preferred_language: string;
  avatar_url: string | null;
  popi_consent: boolean;
  created_at: string;
  updated_at: string;
};
