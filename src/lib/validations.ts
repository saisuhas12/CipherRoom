import { z } from "zod";

export const usernameSchema = z
  .string()
  .min(3, "Username must be at least 3 characters")
  .max(20, "Username must be at most 20 characters")
  .regex(
    /^[a-zA-Z0-9_]+$/,
    "Username can only contain letters, numbers, and underscores"
  );

export const roomNameSchema = z
  .string()
  .min(1, "Room name is required")
  .max(50, "Room name must be at most 50 characters")
  .regex(
    /^[a-zA-Z0-9_-]+$/,
    "Room name can only contain letters, numbers, hyphens, and underscores"
  );

export const passwordSchema = z
  .string()
  .min(4, "Password must be at least 4 characters")
  .max(128, "Password must be at most 128 characters");

export const messageSchema = z
  .string()
  .min(1, "Message cannot be empty")
  .max(5000, "Message must be at most 5000 characters");

export const noteSchema = z
  .string()
  .max(50000, "Note must be at most 50000 characters");

export const roomExpirySchema = z.enum(["1", "6", "24"], {
  errorMap: () => ({ message: "Expiry must be 1, 6, or 24 hours" }),
});

export const createRoomSchema = z.object({
  name: roomNameSchema,
  password: passwordSchema,
  expiryHours: roomExpirySchema,
});

export const joinRoomSchema = z.object({
  slug: z.string().min(1, "Room slug is required"),
  password: passwordSchema,
});

// Allowed file types
export const ALLOWED_MIME_TYPES = [
  "image/jpeg",
  "image/png",
  "image/gif",
  "image/webp",
  "image/svg+xml",
  "application/pdf",
  "application/zip",
  "application/x-zip-compressed",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "text/plain",
  "text/csv",
  "text/markdown",
  "application/json",
] as const;

export const MAX_FILE_SIZE = 100 * 1024 * 1024; // 100MB

export function isAllowedMimeType(mime: string): boolean {
  return (ALLOWED_MIME_TYPES as readonly string[]).includes(mime);
}

export function sanitizeInput(input: string): string {
  return input
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#x27;")
    .replace(/\//g, "&#x2F;");
}
