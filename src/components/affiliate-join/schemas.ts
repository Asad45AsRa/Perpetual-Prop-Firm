import { z } from "zod";
import { OTP_LENGTH, PLATFORMS } from "./constants";

export const welcomeSchema = z.object({
  email: z.string().trim().min(1, "Email is required").email("Enter a valid email"),
  // Plain string (not z.enum) so the form can start on the empty placeholder option.
  platform: z
    .string()
    .refine((v) => (PLATFORMS as readonly string[]).includes(v), "Select your platform"),
  handle: z
    .string()
    .trim()
    .min(1, "Username is required")
    .max(30, "Username is too long")
    .regex(/^@?[A-Za-z0-9._]+$/, "Only letters, numbers, dots and underscores"),
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
