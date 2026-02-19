// -----------------------------------------------------------------------------
// Booking Types — matches database schema
// -----------------------------------------------------------------------------

export type BookingStatus =
  | 'pending'
  | 'accepted'
  | 'declined'
  | 'confirmed'
  | 'in_progress'
  | 'completed'
  | 'cancelled'
  | 'no_show';

export type RecurrenceFrequency = 'daily' | 'weekly' | 'biweekly' | 'monthly';

export type RecurrenceRule = {
  frequency: RecurrenceFrequency;
  interval: number;
  days_of_week: number[] | null;
  end_date: string | null;
  max_occurrences: number | null;
};

export type Service = {
  id: string;
  name: string;
  name_zu: string | null;
  name_xh: string | null;
  name_af: string | null;
  name_st: string | null;
  description: string | null;
  icon: string;
  category: string;
  base_rate: number | null;
  is_active: boolean;
  sort_order: number;
  created_at: string;
};

export type Booking = {
  id: string;
  client_id: string;
  worker_id: string;
  service_id: string;
  status: string;
  scheduled_date: string;
  start_time: string;
  end_time: string | null;
  location_lat: number | null;
  location_lng: number | null;
  address: string | null;
  suburb: string | null;
  instructions: string | null;
  total_amount: number | null;
  is_recurring: boolean;
  recurrence_rule: RecurrenceRule | null;
  parent_booking_id: string | null;
  cancelled_by: string | null;
  cancellation_reason: string | null;
  completed_at: string | null;
  created_at: string;
  updated_at: string;
};
