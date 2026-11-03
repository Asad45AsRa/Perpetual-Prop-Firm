import { z } from "zod";
import { OTP_LENGTH } from "./constants";

export const welcomeSchema = z.object({
  email: z.string().trim().min(1, "Email is required").email("Enter a valid email"),
  // Optional: empty string is valid.
  referral: z
    .string()
    .trim()
    .max(32, "Code is too long")
    .regex(/^[A-Za-z0-9_-]*$/, "Only letters, numbers, - and _"),
});
export type WelcomeValues = z.infer<typeof welcomeSchema>;

export const codeSchema = z.object({
  code: z.string().regex(new RegExp(`^\\d{${OTP_LENGTH}}$`), `Enter the ${OTP_LENGTH}-digit code`),
});
export type CodeValues = z.infer<typeof codeSchema>;

export const usernameSchema = z.object({
  username: z
    .string()
    .trim()
    .min(3, "At least 3 characters")
    .max(20, "At most 20 characters")
    .regex(/^[A-Za-z0-9_]+$/, "Only letters, numbers and underscores"),
});
export type UsernameValues = z.infer<typeof usernameSchema>;

export const avatarSchema = z.object({
  avatar: z.string().min(1, "Pick an avatar"),
});
export type AvatarValues = z.infer<typeof avatarSchema>;