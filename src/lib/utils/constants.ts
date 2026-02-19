// ---------------------------------------------------------------------------
// Supported Languages (South African official languages + English)
// ---------------------------------------------------------------------------

export interface SupportedLanguage {
  code: string;
  name: string;
  nativeName: string;
}

export const SUPPORTED_LANGUAGES: SupportedLanguage[] = [
  { code: "en", name: "English", nativeName: "English" },
  { code: "af", name: "Afrikaans", nativeName: "Afrikaans" },
  { code: "zu", name: "Zulu", nativeName: "isiZulu" },
  { code: "xh", name: "Xhosa", nativeName: "isiXhosa" },
  { code: "st", name: "Sotho", nativeName: "Sesotho" },
  { code: "nso", name: "Northern Sotho", nativeName: "Sepedi" },
  { code: "tn", name: "Tswana", nativeName: "Setswana" },
  { code: "ts", name: "Tsonga", nativeName: "Xitsonga" },
  { code: "ve", name: "Venda", nativeName: "Tshivenda" },
  { code: "ss", name: "Swati", nativeName: "siSwati" },
  { code: "nr", name: "Ndebele", nativeName: "isiNdebele" },
];

// ---------------------------------------------------------------------------
// Service Types
// ---------------------------------------------------------------------------

export interface ServiceType {
  id: string;
  name: string;
  icon: string;
  category: string;
}

export const SERVICE_TYPES: ServiceType[] = [
  { id: "domestic-worker", name: "Domestic Worker", icon: "Home", category: "Household" },
  { id: "gardener", name: "Gardener", icon: "Flower2", category: "Outdoor" },
  { id: "painter", name: "Painter", icon: "Paintbrush", category: "Trades" },
  { id: "welder", name: "Welder", icon: "Flame", category: "Trades" },
  { id: "electrician", name: "Electrician", icon: "Zap", category: "Trades" },
  { id: "plumber", name: "Plumber", icon: "Wrench", category: "Trades" },
  { id: "carpenter", name: "Carpenter", icon: "Hammer", category: "Trades" },
  { id: "tiler", name: "Tiler", icon: "LayoutGrid", category: "Trades" },
  { id: "roofer", name: "Roofer", icon: "HardHat", category: "Trades" },
  { id: "pool-cleaner", name: "Pool Cleaner", icon: "Waves", category: "Outdoor" },
  { id: "pest-control", name: "Pest Control", icon: "Bug", category: "Specialist" },
  { id: "window-cleaner", name: "Window Cleaner", icon: "Sparkles", category: "Household" },
  { id: "handyman", name: "Handyman", icon: "Wrench", category: "General" },
  { id: "babysitter", name: "Babysitter", icon: "Baby", category: "Care" },
  { id: "dog-walker", name: "Dog Walker", icon: "Dog", category: "Care" },
  { id: "security-guard", name: "Security Guard", icon: "Shield", category: "Security" },
];

// ---------------------------------------------------------------------------
// Booking Status
// ---------------------------------------------------------------------------

export const BOOKING_STATUS = {
  PENDING: "pending",
  CONFIRMED: "confirmed",
  IN_PROGRESS: "in_progress",
  COMPLETED: "completed",
  CANCELLED: "cancelled",
  DISPUTED: "disputed",
  NO_SHOW: "no_show",
} as const;

export type BookingStatus = (typeof BOOKING_STATUS)[keyof typeof BOOKING_STATUS];

// ---------------------------------------------------------------------------
// File & Pagination Limits
// ---------------------------------------------------------------------------

/** Maximum upload size for images (5 MB) */
export const MAX_FILE_SIZE = 5 * 1024 * 1024;

/** Maximum upload size for documents (10 MB) */
export const MAX_DOC_SIZE = 10 * 1024 * 1024;

/** Default page size for search results */
export const SEARCH_PAGE_SIZE = 20;
