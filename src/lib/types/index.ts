// -----------------------------------------------------------------------------
// DomestIQ Type Definitions - Barrel Export
// -----------------------------------------------------------------------------

// User & Profile
export type { UserRole, Profile } from './user';

// Worker
export type {
  WorkerProfile,
  WorkerService,
  WorkerAvailability,
  WorkerBlockedDate,
  WorkerServiceArea,
  DayOfWeek,
} from './worker';

// Client
export type { ClientProfile } from './client';

// Booking & Service
export type {
  Booking,
  BookingStatus,
  Service,
  RecurrenceRule,
  RecurrenceFrequency,
} from './booking';

// Review
export type { Review, ReviewSubRatings } from './review';

// Message & Conversation
export type {
  Conversation,
  ConversationStatus,
  Message,
  MessageType,
  TranslationCache,
} from './message';

// Notification
export type {
  Notification,
  NotificationType,
} from './notification';

// Payment & Financial
export type {
  Transaction,
  TransactionStatus,
  WorkerPayout,
  PayoutStatus,
  IncomeStatement,
  PartnerDataRequest,
  PartnerApiKey,
  RevenueLedgerEntry,
} from './payment';

export {
  calculatePlatformFee,
  PLATFORM_FEE_PERCENT,
  MIN_PLATFORM_FEE,
  MAX_PLATFORM_FEE,
} from './payment';

// Referral
export type {
  Referral,
  ReferralStatus,
  ReferralStats,
} from './referral';

// Portfolio
export type { PortfolioImage } from './portfolio';
