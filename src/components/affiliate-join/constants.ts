export const ASSET_DIR = "/images/affiliate-join";

export const PLATFORMS = ["Instagram", "Meta", "TikTok"] as const;
export type Platform = (typeof PLATFORMS)[number];

/** 21 avatars, in Figma grid order (row by row, left to right). */
export const AVATARS = Array.from(
  { length: 21 },
  (_, i) => `${ASSET_DIR}/avatars/avatar-${String(i + 1).padStart(2, "0")}.png`,
);

/** Promo card pills (Figma "Email code" right panel): commission per affiliate level. */
export const PROMO_TIERS = [
  "15% Commission – Axis",
  "17% Commission – Onyx",
  "20% Commission – Apex",
] as const;

export const AFFILIATE_DASHBOARD_ROUTE = "/affiliates/dashboard";

export const OTP_LENGTH = 6;
