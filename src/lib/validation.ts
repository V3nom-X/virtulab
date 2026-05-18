import { z } from "zod";

/** Reject payloads larger than 50KB before serialization. */
export const MAX_PAYLOAD_BYTES = 50 * 1024;

export function assertPayloadSize(value: unknown, limit = MAX_PAYLOAD_BYTES) {
  const size = new Blob([JSON.stringify(value ?? null)]).size;
  if (size > limit) {
    throw new Error(`Payload too large (${size} bytes, max ${limit}).`);
  }
}

const trimmed = (min: number, max: number, label: string) =>
  z
    .string()
    .transform((s) => s.trim())
    .pipe(z.string().min(min, `${label} must be at least ${min} characters`).max(max, `${label} must be at most ${max} characters`));

export const emailSchema = z
  .string()
  .trim()
  .toLowerCase()
  .email("Please enter a valid email address")
  .max(254, "Email is too long");

export const passwordSchema = z
  .string()
  .min(8, "Password must be at least 8 characters")
  .max(128, "Password is too long")
  .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, "Password must contain uppercase, lowercase, and a number");

export const usernameSchema = trimmed(3, 32, "Username").pipe(
  z.string().regex(/^[a-zA-Z0-9_.-]+$/, "Username may only contain letters, numbers, _ . -"),
);

export const fullNameSchema = trimmed(1, 80, "Name");

export const profileUpdateSchema = z.object({
  username: usernameSchema.optional(),
  full_name: fullNameSchema.optional(),
  bio: z.string().trim().max(500, "Bio must be 500 characters or fewer").optional(),
  avatar_url: z.string().url().max(2000).optional().or(z.literal("")),
});

export const experimentRequestSchema = z.object({
  title: trimmed(3, 150, "Title"),
  description: trimmed(10, 2000, "Description"),
  category: z.string().max(50).optional(),
});

export const communityPostSchema = z.object({
  title: trimmed(3, 200, "Title"),
  content: trimmed(1, 5000, "Content"),
});

export const chatMessageSchema = z.object({
  role: z.enum(["user", "assistant", "system"]),
  content: z.string().min(1).max(4000),
});

export const auraChatRequestSchema = z.object({
  messages: z.array(chatMessageSchema).min(1).max(40),
});

export const ttsRequestSchema = z.object({
  text: z.string().min(1).max(5000),
  voiceId: z
    .string()
    .regex(/^[A-Za-z0-9]{8,40}$/, "Invalid voice id")
    .optional(),
});
