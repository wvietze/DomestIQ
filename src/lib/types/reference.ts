// -----------------------------------------------------------------------------
// Reference Types — matches worker_references, reference_requests,
// reference_share_tokens tables
// -----------------------------------------------------------------------------

export type ReferenceRelationship = 'employer' | 'client' | 'regular_client';

export type WorkerReference = {
  id: string;
  worker_id: string;
  client_id: string;
  booking_id: string | null;
  reference_text: string;
  relationship: ReferenceRelationship;
  duration_months: number | null;
  is_visible_on_profile: boolean;
  created_at: string;
  // Joined fields (optional)
  client_name?: string;
};

export type ReferenceRequest = {
  id: string;
  worker_id: string;
  client_id: string;
  message: string | null;
  status: 'pending' | 'completed' | 'expired';
  created_at: string;
  expires_at: string;
  // Joined fields (optional)
  worker_name?: string;
  client_name?: string;
};

export type ReferenceShareToken = {
  id: string;
  worker_id: string;
  reference_ids: string[];
  token: string;
  expires_at: string;
  view_count: number;
  created_at: string;
};

export const RELATIONSHIP_LABELS: Record<ReferenceRelationship, string> = {
  employer: 'Employer',
  client: 'Client',
  regular_client: 'Regular Client',
};
