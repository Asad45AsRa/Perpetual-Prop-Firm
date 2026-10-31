// RightGlow.tsx
import type { ComponentProps } from "react";
import { LeftGlow } from "./LeftGlow";

type RightGlowProps = ComponentProps<typeof LeftGlow> & {
  right?: number; // px, negative = frame se bahar nikla hua
};

export function RightGlow({ right = -464, style, ...props }: RightGlowProps) {
  return <LeftGlow {...props} style={{ right, left: "auto", ...style }} />;
}