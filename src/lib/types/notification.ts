// -----------------------------------------------------------------------------
// Notification Types — matches notifications table in database
// -----------------------------------------------------------------------------

export type NotificationType =
  | 'booking_request'
  | 'booking_accepted'
  | 'booking_declined'
  | 'booking_confirmed'
  | 'booking_cancelled'
  | 'booking_completed'
  | 'booking_reminder'
  | 'new_message'
  | 'new_review'
  | 'verification_approved'
  | 'verification_rejected'
  | 'system_alert';

export type Notification = {
  id: string;
  user_id: string;
  type: string;
  title: string;
  body: string | null;
  data: Record<string, unknown> | null;
  action_url: string | null;
  is_read: boolean;
  created_at: string;
};
