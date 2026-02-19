import { z } from "zod";

// ---------------------------------------------------------------------------
// Phone (South African format)
// Accepts numbers starting with 0 (local) or +27 (international), 10-12 digits
// ---------------------------------------------------------------------------

export const phoneSchema = z
  .string()
  .regex(
    /^(?:\+27|0)\d{9,11}$/,
    "Please enter a valid South African phone number (e.g. 0821234567 or +27821234567)"
  );

// ---------------------------------------------------------------------------
// Email
// ---------------------------------------------------------------------------

export const emailSchema = z
  .string()
  .email("Please enter a valid email address")
  .min(1, "Email is required");

// ---------------------------------------------------------------------------
// Booking
// ---------------------------------------------------------------------------

export const bookingSchema = z.object({
  date: z
    .string()
    .min(1, "Date is required")
    .refine((val) => !isNaN(Date.parse(val)), {
      message: "Please enter a valid date",
    }),
  startTime: z
    .string()
    .min(1, "Start time is required")
    .regex(/^\d{2}:\d{2}$/, "Start time must be in HH:MM format"),
  endTime: z
    .string()
    .min(1, "End time is required")
    .regex(/^\d{2}:\d{2}$/, "End time must be in HH:MM format"),
  serviceId: z.string().min(1, "Service is required"),
  workerId: z.string().uuid("Invalid worker ID"),
  address: z
    .string()
    .min(5, "Address must be at least 5 characters")
    .max(500, "Address must be less than 500 characters"),
  instructions: z
    .string()
    .max(1000, "Instructions must be less than 1000 characters")
    .optional()
    .default(""),
});

export type BookingFormValues = z.infer<typeof bookingSchema>;

// ---------------------------------------------------------------------------
// Review
// ---------------------------------------------------------------------------

const ratingField = (label: string) =>
  z
    .number()
    .int(`${label} must be a whole number`)
    .min(1, `${label} must be at least 1`)
    .max(5, `${label} must be at most 5`);

export const reviewSchema = z.object({
  rating: ratingField("Overall rating"),
  punctuality: ratingField("Punctuality"),
  quality: ratingField("Quality"),
  communication: ratingField("Communication"),
  comment: z
    .string()
    .min(1, "Please leave a comment")
    .max(2000, "Comment must be less than 2000 characters"),
});

export type ReviewFormValues = z.infer<typeof reviewSchema>;

// ---------------------------------------------------------------------------
// Profile
// ---------------------------------------------------------------------------

export const profileSchema = z.object({
  name: z
    .string()
    .min(2, "Name must be at least 2 characters")
    .max(100, "Name must be less than 100 characters"),
  phone: phoneSchema,
  email: emailSchema.optional(),
});

export type ProfileFormValues = z.infer<typeof profileSchema>;
