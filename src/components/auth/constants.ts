export const ASSET_DIR = "/images/affiliate-join";

/** Auth page coin image: public/images/auth/auth.png */
export const AUTH_ASSET_DIR = "/images/auth";
export const COIN_SRC = `${AUTH_ASSET_DIR}/auth.png`;

/** Where a user lands after finishing signup (avatar step). */
export const AUTH_REDIRECT_ROUTE = "/dashboard";

export const PLATFORMS = ["Instagram", "Meta", "TikTok"] as const;
export type Platform = (typeof PLATFORMS)[number];

/** 21 avatars, in Figma grid order (row by row, left to right). */
export const AVATARS = Array.from(
  { length: 21 },
  (_, i) => `${ASSET_DIR}/avatars/avatar-${String(i + 1).padStart(2, "0")}.png`,
);

export const PROMO_STEPS = [
  "Buy a challenge",
  "Trade in the terminal",
  "Pass the evaluation",
  "Request and receive a payout",
] as const;

export const OTP_LENGTH = 6;