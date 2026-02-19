// -----------------------------------------------------------------------------
// Paystack Integration — South Africa's leading payment gateway
// Server-side only — uses PAYSTACK_SECRET_KEY
// -----------------------------------------------------------------------------

const PAYSTACK_BASE_URL = 'https://api.paystack.co';

function getHeaders(): HeadersInit {
  const secretKey = process.env.PAYSTACK_SECRET_KEY;
  if (!secretKey) throw new Error('PAYSTACK_SECRET_KEY is not configured');
  return {
    Authorization: `Bearer ${secretKey}`,
    'Content-Type': 'application/json',
  };
}

// ─── Types ───

export interface PaystackInitializeResponse {
  status: boolean;
  message: string;
  data: {
    authorization_url: string;
    access_code: string;
    reference: string;
  };
}

export interface PaystackVerifyResponse {
  status: boolean;
  message: string;
  data: {
    id: number;
    status: 'success' | 'failed' | 'abandoned';
    reference: string;
    amount: number; // in kobo (cents)
    currency: string;
    channel: string;
    paid_at: string | null;
    customer: {
      email: string;
      customer_code: string;
    };
    metadata: Record<string, unknown>;
  };
}

export interface PaystackTransferRecipient {
  status: boolean;
  message: string;
  data: {
    recipient_code: string;
    name: string;
    type: string;
  };
}

export interface PaystackTransferResponse {
  status: boolean;
  message: string;
  data: {
    transfer_code: string;
    reference: string;
    status: string;
    amount: number;
  };
}

// ─── Initialize Transaction ───
// Client pays: worker rate + platform fee

export async function initializeTransaction(params: {
  email: string;
  amount: number; // in Rands (will be converted to cents)
  reference: string;
  callbackUrl: string;
  metadata: {
    booking_id: string;
    client_id: string;
    worker_id: string;
    worker_amount: number;
    platform_fee: number;
  };
}): Promise<PaystackInitializeResponse> {
  const response = await fetch(`${PAYSTACK_BASE_URL}/transaction/initialize`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify({
      email: params.email,
      amount: Math.round(params.amount * 100), // Convert Rands to cents
      reference: params.reference,
      callback_url: params.callbackUrl,
      currency: 'ZAR',
      metadata: {
        custom_fields: [
          {
            display_name: 'Booking ID',
            variable_name: 'booking_id',
            value: params.metadata.booking_id,
          },
          {
            display_name: 'Worker Amount',
            variable_name: 'worker_amount',
            value: `R${params.metadata.worker_amount.toFixed(2)}`,
          },
          {
            display_name: 'Platform Fee',
            variable_name: 'platform_fee',
            value: `R${params.metadata.platform_fee.toFixed(2)}`,
          },
        ],
        ...params.metadata,
      },
    }),
  });

  return response.json();
}

// ─── Verify Transaction ───

export async function verifyTransaction(
  reference: string
): Promise<PaystackVerifyResponse> {
  const response = await fetch(
    `${PAYSTACK_BASE_URL}/transaction/verify/${encodeURIComponent(reference)}`,
    { headers: getHeaders() }
  );

  return response.json();
}

// ─── Create Transfer Recipient (Worker's bank details) ───

export async function createTransferRecipient(params: {
  name: string;
  accountNumber: string;
  bankCode: string;
  currency?: string;
}): Promise<PaystackTransferRecipient> {
  const response = await fetch(`${PAYSTACK_BASE_URL}/transferrecipient`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify({
      type: 'nuban',
      name: params.name,
      account_number: params.accountNumber,
      bank_code: params.bankCode,
      currency: params.currency || 'ZAR',
    }),
  });

  return response.json();
}

// ─── Initiate Transfer (Pay worker) ───

export async function initiateTransfer(params: {
  amount: number; // in Rands
  recipientCode: string;
  reference: string;
  reason: string;
}): Promise<PaystackTransferResponse> {
  const response = await fetch(`${PAYSTACK_BASE_URL}/transfer`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify({
      source: 'balance',
      amount: Math.round(params.amount * 100), // Convert to cents
      recipient: params.recipientCode,
      reference: params.reference,
      reason: params.reason,
    }),
  });

  return response.json();
}

// ─── List Banks (SA banks for worker payout setup) ───

export async function listBanks(): Promise<{
  status: boolean;
  data: Array<{
    id: number;
    name: string;
    code: string;
    slug: string;
    active: boolean;
    country: string;
    currency: string;
    type: string;
  }>;
}> {
  const response = await fetch(
    `${PAYSTACK_BASE_URL}/bank?country=south africa&currency=ZAR`,
    { headers: getHeaders() }
  );

  return response.json();
}

// ─── Verify Webhook Signature ───

export function verifyWebhookSignature(
  body: string,
  signature: string
): boolean {
  // Use Node.js crypto (available in Next.js API routes)
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const crypto = require('crypto');
  const secretKey = process.env.PAYSTACK_SECRET_KEY;
  if (!secretKey) return false;

  const hash = crypto
    .createHmac('sha512', secretKey)
    .update(body)
    .digest('hex');

  return hash === signature;
}

// ─── Generate Reference ───

export function generateReference(prefix: string = 'DIQ'): string {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substring(2, 8);
  return `${prefix}-${timestamp}-${random}`.toUpperCase();
}
