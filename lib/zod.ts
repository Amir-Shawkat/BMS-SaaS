import { z } from "zod";
import {
  ACCEPTED_IMAGE_TYPES,
  ACCEPTED_PDF_TYPES,
  DEFAULT_VOICE,
  MAX_FILE_SIZE,
  MAX_IMAGE_SIZE,
  voiceOptions,
} from "@/lib/constants";

const isFile = (value: unknown): value is File =>
  typeof File !== "undefined" && value instanceof File;

const requiredPdfSchema = z
  .custom<File>((value) => isFile(value), { message: "Please upload a PDF file." })
  .refine((file) => ACCEPTED_PDF_TYPES.includes(file.type), {
    message: "Only PDF files are allowed.",
  })
  .refine((file) => file.size <= MAX_FILE_SIZE, {
    message: "PDF must be 50MB or smaller.",
  });

const optionalImageSchema = z
  .custom<File | undefined>((value) => value === undefined || isFile(value), {
    message: "Invalid cover image file.",
  })
  .refine((file) => !file || ACCEPTED_IMAGE_TYPES.includes(file.type), {
    message: "Cover image must be JPG, PNG, or WEBP.",
  })
  .refine((file) => !file || file.size <= MAX_IMAGE_SIZE, {
    message: "Cover image must be 10MB or smaller.",
  });

export const UploadSchema = z.object({
  pdfFile: requiredPdfSchema,
  coverImage: optionalImageSchema.optional(),
  title: z
    .string()
    .trim()
    .min(2, "Title must be at least 2 characters.")
    .max(120, "Title must be 120 characters or fewer."),
  author: z
    .string()
    .trim()
    .min(2, "Author name must be at least 2 characters.")
    .max(120, "Author name must be 120 characters or fewer."),
  voice: z
    .enum([
      voiceOptions.dave.name,
      voiceOptions.daniel.name,
      voiceOptions.chris.name,
      voiceOptions.rachel.name,
      voiceOptions.sarah.name,
    ])
    .default(DEFAULT_VOICE.charAt(0).toUpperCase() + DEFAULT_VOICE.slice(1)),
});

export type UploadFormSchema = z.infer<typeof UploadSchema>;
