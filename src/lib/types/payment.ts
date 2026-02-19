// -----------------------------------------------------------------------------
// Payment & Transaction Types — financial backbone of DomestIQ
// -----------------------------------------------------------------------------

export type TransactionStatus =
  | 'pending'
  | 'processing'
  | 'completed'
  | 'failed'
  | 'refunded'
  | 'disputed';

export type PayoutStatus =
  | 'pending'
  | 'processing'
  | 'completed'
  | 'failed';

export type Transaction = {
  id: string;
  booking_id: string;
  client_id: string;
  worker_id: string;
  worker_amount: number;        // What the worker receives (their full rate)
  platform_fee: number;         // What the client pays on top (commission)
  total_amount: number;         // worker_amount + platform_fee
  platform_fee_percent: number; // The fee percentage applied
  currency: string;             // ZAR
  status: TransactionStatus;
  paystack_reference: string | null;
  paystack_access_code: string | null;
  paystack_transfer_code: string | null;
  paid_at: string | null;
  refunded_at: string | null;
  refund_reason: string | null;
  metadata: Record<string, unknown> | null;
  created_at: string;
  updated_at: string;
};

export type WorkerPayout = {
  id: string;
  worker_id: string;
  transaction_id: string;
  amount: number;
  currency: string;
  status: PayoutStatus;
  paystack_transfer_code: string | null;
  paystack_recipient_code: string | null;
  bank_name: string | null;
  account_number_last4: string | null;
  paid_at: string | null;
  failure_reason: string | null;
  created_at: string;
  updated_at: string;
};

export type IncomeStatement = {
  id: string;
  worker_id: string;
  period_start: string;
  period_end: string;
  total_earnings: number;
  total_bookings: number;
  avg_booking_value: number;
  services_breakdown: Record<string, { count: number; total: number }>;
  generated_at: string;
  verification_hash: string;   // SHA-256 hash for tamper detection
  is_shared: boolean;          // Whether worker has shared with a partner
  created_at: string;
};

export type PartnerDataRequest = {
  id: string;
  partner_id: string;
  worker_id: string;
  consent_id: string;          // References consent_records
  request_type: 'income_verification' | 'employment_history' | 'identity_verification';
  status: 'pending_consent' | 'consented' | 'fulfilled' | 'denied' | 'expired';
  data_shared: Record<string, unknown> | null;
  requested_at: string;
  fulfilled_at: string | null;
  expires_at: string;
  created_at: string;
};

export type PartnerApiKey = {
  id: string;
  partner_name: string;
  partner_type: 'bank' | 'insurer' | 'lender' | 'government';
  api_key_hash: string;
  permissions: string[];
  is_active: boolean;
  rate_limit_per_hour: number;
  last_used_at: string | null;
  created_at: string;
};

// Revenue tracking
export type RevenueLedgerEntry = {
  id: string;
  transaction_id: string | null;
  entry_type: 'platform_fee' | 'partner_api_fee' | 'premium_subscription' | 'refund';
  amount: number;
  currency: string;
  description: string;
  created_at: string;
};

// Commission calculation
export const PLATFORM_FEE_PERCENT = 12; // 12% platform fee paid by client
export const MIN_PLATFORM_FEE = 15;     // Minimum R15 fee
export const MAX_PLATFORM_FEE = 500;    // Maximum R500 fee per booking

export function calculatePlatformFee(workerAmount: number): {
  workerAmount: number;
  platformFee: number;
  totalAmount: number;
  feePercent: number;
} {
  let fee = Math.round(workerAmount * (PLATFORM_FEE_PERCENT / 100) * 100) / 100;
  fee = Math.max(fee, MIN_PLATFORM_FEE);
  fee = Math.min(fee, MAX_PLATFORM_FEE);

  return {
    workerAmount,
    platformFee: fee,
    totalAmount: workerAmount + fee,
    feePercent: PLATFORM_FEE_PERCENT,
  };
}
