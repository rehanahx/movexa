import { z } from "zod";

export const movieStatusSchema = z.enum([
    "now_showing",
    "coming_soon",
    "ended",
]);

export const createMovieSchema = z.object({
    title: z
        .string()
        .trim()
        .min(1, "Title is required"),

    slug: z
        .string()
        .trim()
        .min(1, "Slug is required")
        .toLowerCase(),

    shortDescription: z
        .string()
        .trim()
        .min(10, "Short description must be at least 10 characters")
        .max(300, "Short description cannot exceed 300 characters"),

    longDescription: z
        .string()
        .trim()
        .min(20, "Long description must be at least 20 characters")
        .max(2000, "Long description cannot exceed 2000 characters"),

    thumbnail: z.object({
        url: z.string().min(1, "Thumbnail image URL is required"),
        publicId: z.string().optional().default("poster"),
    }),

    bannerImage: z
        .object({
            url: z.string().min(1, "Banner image URL is required"),
            publicId: z.string().optional().default("banner"),
        })
        .optional()
        .nullable(),

    isFeatured: z.boolean().optional().default(false),

    tagline: z.string().trim().optional().nullable(),

    trailerUrl: z
        .string()
        .trim()
        .optional()
        .nullable()
        .or(z.literal("")),

    genre: z
        .array(z.string().trim().min(1))
        .min(1, "At least one genre is required"),

    language: z
        .string()
        .trim()
        .min(1, "Language is required"),

    duration: z
        .number()
        .int("Duration must be a whole number")
        .positive("Duration must be greater than 0"),

    releaseDate: z.string(),

    director: z
        .string()
        .trim()
        .optional()
        .nullable()
        .or(z.literal("")),

    cast: z
        .array(z.string().trim().min(1))
        .min(1, "At least one cast member is required"),

    rating: z
        .number()
        .min(0)
        .max(10)
        .optional()
        .nullable(),

    status: movieStatusSchema.optional().default("now_showing"),
});

export type CreateMovieInput = z.infer<typeof createMovieSchema>;
