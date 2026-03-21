import { z } from 'zod'

// ─── Shared primitives ───
export const uuidSchema = z.string().uuid()
export const shortString = z.string().min(1).max(500)
export const longString = z.string().min(1).max(5000)

// ─── Bookings ───
export const createBookingSchema = z.object({
  worker_id: uuidSchema,
  service_id: uuidSchema,
  scheduled_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  scheduled_start_time: z.string().regex(/^\d{2}:\d{2}$/),
  scheduled_end_time: z.string().regex(/^\d{2}:\d{2}$/),
  location_address: z.string().max(500).optional(),
  location_lat: z.number().min(-90).max(90).optional(),
  location_lng: z.number().min(-180).max(180).optional(),
  estimated_cost: z.number().positive().optional(),
  client_notes: z.string().max(2000).optional(),
})

export const updateBookingSchema = z.object({
  status: z.enum([
    'accepted',
    'declined',
    'confirmed',
    'cancelled',
    'in_progress',
    'completed',
    'no_show',
  ]),
  cancellation_reason: z.string().max(1000).optional(),
  worker_notes: z.string().max(2000).optional(),
})

// ─── Messages ───
export const sendMessageSchema = z.object({
  conversationId: uuidSchema,
  content: shortString,
  messageType: z.enum(['text', 'image']).default('text'),
  imageUrl: z.string().url().optional(),
})

// ─── Reviews ───
export const createReviewSchema = z.object({
  booking_id: uuidSchema,
  rating: z.number().int().min(1).max(5),
  comment: z.string().max(2000).optional(),
  traits: z.array(z.string().max(50)).max(10).optional(),
  professionalism_rating: z.number().int().min(1).max(5).optional(),
  punctuality_rating: z.number().int().min(1).max(5).optional(),
  quality_rating: z.number().int().min(1).max(5).optional(),
})

// ─── Referrals ───
export const createReferralSchema = z.object({
  referral_code: z.string().min(2).max(20),
  referred_user_id: uuidSchema,
})

// ─── Notifications ───
export const sendNotificationSchema = z.object({
  userId: uuidSchema,
  title: z.string().min(1).max(200),
  body: z.string().min(1).max(1000),
  url: z.string().max(500).optional(),
  tag: z.string().max(100).optional(),
})

// ─── Translation ───
export const translateSchema = z.object({
  text: z.string().min(1).max(5000),
  targetLanguage: z.string().min(2).max(10),
  sourceLanguage: z.string().min(2).max(10).optional(),
})

// ─── Helpdesk ───
export const helpdeskRegisterSchema = z.object({
  fullName: z.string().min(2).max(200),
  phone: z.string().max(20).optional(),
  city: z.string().min(1).max(200),
  selectedServices: z.array(z.string().max(100)).min(1),
  availableDays: z.array(z.number().int().min(0).max(6)),
  popiConsent: z.literal(true),
  avatarBase64: z.string().optional(),
  idDocBase64: z.string().optional(),
  password: z.string().min(6).max(100).optional(),
})

// ─── Blocked Dates ───
export const blockedDateSchema = z.object({
  blocked_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  reason: z.string().max(500).optional(),
})

export const deleteBlockedDateSchema = z.object({
  blocked_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
})

// ─── Consent ───
export const consentSchema = z.object({
  consent_type: z.enum([
    'platform_terms',
    'privacy_policy',
    'popi_consent',
    'income_data_sharing',
    'identity_sharing',
    'cv_data_sharing',
    'marketing',
    'location_tracking',
  ]),
  consent_category: z.string().max(100).optional(),
  consent_text: z.string().max(2000).optional(),
})

// ─── CV Data ───
export const cvDataSchema = z.object({
  personal_statement: z.string().max(5000).optional(),
  work_history: z
    .array(
      z.object({
        title: z.string().max(200),
        company: z.string().max(200).optional(),
        period: z.string().max(100).optional(),
        description: z.string().max(1000).optional(),
      })
    )
    .optional(),
  education: z
    .array(
      z.object({
        qualification: z.string().max(200),
        institution: z.string().max(200).optional(),
        year: z.string().max(10).optional(),
      })
    )
    .optional(),
  skills: z.array(z.string().max(100)).optional(),
  languages: z.array(z.string().max(50)).optional(),
})

// ─── Partner verification requests ───
export const partnerVerifySchema = z.object({
  worker_id: uuidSchema,
  consent_reference: uuidSchema,
})

// ─── Favorites ───
export const favoriteSchema = z.object({
  worker_id: uuidSchema,
})

// ─── Review requests ───
export const reviewRequestSchema = z.object({
  booking_id: uuidSchema,
})

// ─── Reference requests ───
export const referenceRequestSchema = z.object({
  client_id: uuidSchema,
  message: z.string().max(1000).optional(),
})

// ─── References ───
export const createReferenceSchema = z.object({
  worker_id: uuidSchema,
  reference_text: z.string().min(20).max(2000),
  relationship: z.enum(['employer', 'client', 'regular_client']),
  duration_months: z.number().int().positive().optional(),
  booking_id: uuidSchema.optional(),
})

// ─── Worker estates ───
export const workerEstateSchema = z.object({
  estate_id: uuidSchema,
  registration_number: z.string().max(100).optional(),
  registered_since: z.string().max(50).optional(),
})

// ─── Payments ───
export const paymentInitializeSchema = z.object({
  booking_id: uuidSchema,
})

// ─── Partner application ───
export const partnerApplySchema = z.object({
  company_name: z.string().min(1).max(300),
  contact_name: z.string().min(1).max(200),
  contact_email: z.string().email().max(300),
  contact_phone: z.string().max(20).optional(),
  company_type: z.enum([
    'bank',
    'insurer',
    'micro_lender',
    'sponsor',
    'advertiser',
    'government',
    'other',
  ]),
  interest: z.enum(['data_api', 'sponsorship', 'advertising', 'multiple']),
  message: z.string().max(2000).optional(),
  website: z.string().url().max(500).optional(),
})

// ─── Helper: parse and return error info on failure ───
export function parseBody<T>(
  schema: z.ZodSchema<T>,
  data: unknown
): { success: true; data: T } | { success: false; error: string } {
  const result = schema.safeParse(data)
  if (!result.success) {
    const firstError = result.error.issues[0]
    return {
      success: false,
      error: `Validation error: ${firstError.path.join('.')} — ${firstError.message}`,
    }
  }
  return { success: true, data: result.data }
}
