// src/features/candy/schemas/candy.schema.ts
import { z } from "zod";

export const candyStatusSchema = z.enum([
  "PROPOSED",
  "IN_BOWL",
  "SCHEDULED",
  "COMPLETED",
]);

export const budgetTierSchema = z.enum(["FREE", "LOW", "MEDIUM", "HIGH"]);

export const weatherConditionSchema = z.enum([
  "ANY",
  "SUNNY",
  "RAINY",
  "NIGHT",
]);

export const swipeDirectionSchema = z.enum(["LEFT", "RIGHT"]);

const hexColorSchema = z
  .string()
  .trim()
  .regex(/^#[0-9A-Fa-f]{6}$/, "Must be a valid 6-digit hex color (e.g. #FF5A8A)");

const nullableDateTimeStringSchema = z
  .string()
  .trim()
  .refine(
    (val) => val === "" || !Number.isNaN(Date.parse(val)),
    "Must be a valid date and time"
  )
  .transform((val) => (val === "" ? null : new Date(val).toISOString()));

// --- Category Schemas ---

export const createCandyCategorySchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Category name is required")
    .max(50, "Category name must be 50 characters or fewer"),
  color_hex: hexColorSchema.optional().or(z.literal("")).transform((val) =>
    val ? val : undefined
  ),
});

export type CreateCandyCategoryFormValues = z.infer<
  typeof createCandyCategorySchema
>;

// --- Candy Create / Update / Patch Schemas ---

export const createCandySchema = z
  .object({
    bowl: z.number().int().positive("Bowl is required"),
    title: z
      .string()
      .trim()
      .min(1, "Title is required")
      .max(120, "Title must be 120 characters or fewer"),
    description: z.string().trim().optional().default(""),
    category: z.number().int().positive().nullable().optional(),
    status: candyStatusSchema.optional().default("IN_BOWL"),
    start_date_time: nullableDateTimeStringSchema.optional(),
    duration: z
      .string()
      .trim()
      .max(100)
      .nullable()
      .optional()
      .transform((val) => (val === "" ? null : val ?? null)),
    budget: budgetTierSchema.optional().default("FREE"),
    weather: weatherConditionSchema.optional().default("ANY"),
    is_surprise: z.boolean().optional().default(false),
    reveal_at: nullableDateTimeStringSchema.optional(),
  })
  .superRefine((data, ctx) => {
    if (data.is_surprise && !data.reveal_at) {
      ctx.addIssue({
        code: "custom",
        path: ["reveal_at"],
        message: "Reveal date & time is required for surprise dates",
      });
    }
  });

export type CreateCandyFormValues = z.infer<typeof createCandySchema>;

export const patchCandySchema = z.object({
  bowl: z.number().int().positive().optional(),
  title: z
    .string()
    .trim()
    .min(1, "Title cannot be empty")
    .max(120, "Title must be 120 characters or fewer")
    .optional(),
  description: z.string().trim().optional(),
  category: z.number().int().positive().nullable().optional(),
  status: candyStatusSchema.optional(),
  start_date_time: nullableDateTimeStringSchema.optional(),
  duration: z
    .string()
    .trim()
    .max(100)
    .nullable()
    .optional()
    .transform((val) => (val === "" ? null : val ?? null)),
  budget: budgetTierSchema.optional(),
  weather: weatherConditionSchema.optional(),
  is_surprise: z.boolean().optional(),
  reveal_at: nullableDateTimeStringSchema.optional(),
});

export type PatchCandyFormValues = z.infer<typeof patchCandySchema>;

// --- Photo Upload Schema ---

const MAX_PHOTO_SIZE_BYTES = 10 * 1024 * 1024; // 10 MB
const ACCEPTED_IMAGE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
];

export const uploadCandyPhotoSchema = z.object({
  image: z
    .instanceof(File, { message: "Please select an image file" })
    .refine(
      (file) => ACCEPTED_IMAGE_TYPES.includes(file.type),
      "Only JPEG, PNG, WebP, or GIF images are allowed"
    )
    .refine(
      (file) => file.size <= MAX_PHOTO_SIZE_BYTES,
      "Image size must be 10 MB or smaller"
    ),
  caption: z
    .string()
    .trim()
    .max(200, "Caption must be 200 characters or fewer")
    .optional()
    .default(""),
});

export type UploadCandyPhotoFormValues = z.infer<typeof uploadCandyPhotoSchema>;

// --- Date Roulette & Swipe Schemas ---

export const dateRouletteFilterSchema = z.object({
  bowl: z.number().int().positive(),
  budget: budgetTierSchema.optional(),
  weather: weatherConditionSchema.optional(),
  duration: z.string().trim().optional(),
  category: z.number().int().positive().optional(),
});

export type DateRouletteFilterValues = z.infer<typeof dateRouletteFilterSchema>;

export const candySwipeSchema = z.object({
  direction: swipeDirectionSchema,
  start_date_time: nullableDateTimeStringSchema.optional(),
});

export type CandySwipeFormValues = z.infer<typeof candySwipeSchema>;