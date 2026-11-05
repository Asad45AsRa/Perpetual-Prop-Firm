"use client";

import { ReactLenis } from "lenis/react";
import type { ReactNode } from "react";


const LENIS_OPTIONS = {
  lerp: 0.07,           
  wheelMultiplier: 0.6,  
  touchMultiplier: 1,
  smoothWheel: true,
  anchors: true,  
} as const;

export function SmoothScrollProvider({ children }: { children: ReactNode }) {
  return (
    <ReactLenis root options={LENIS_OPTIONS}>
      {children}
    </ReactLenis>
  );
}