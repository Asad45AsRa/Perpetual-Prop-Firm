// LeftGlow.tsx
import type { CSSProperties } from "react";
import { cn } from "@/lib/utils";

type LeftGlowProps = {    
  className?: string;
  style?: CSSProperties;
  width?: number;   
  height?: number;  
  color?: string;    
  opacity?: number;  
  blur?: number;     
  rotate?: number;
  from?: number;     
  to?: number;       
  trim?: number;
};

export function LeftGlow({
  className,
  style,
  width = 638,
  height = 295,
  color = "#FFFFFF",
  opacity = 0.68,
  blur = 150,
  rotate = 0,
  from = 0,
  to = 1,
  trim = 0,
}: LeftGlowProps) {
  const f = Math.min(Math.max(from, 0), 1);
  const t = Math.min(Math.max(to, 0), 1);
  const sigma = blur / 2;      // Figma blur = 2 x CSS blur
  const ext = sigma * 3;       // blur ko cut hone se bachane ka margin
  const visibleH = height * (t - f);
   const w = Math.max(width - trim, 1);

  // sirf wo side kategi jahan split hai, baqi sides pe blur free rahega
  const cutTop = f > 0 ? 0 : -ext;
  const cutBottom = t < 1 ? 0 : -ext;

  return (
    <div
      aria-hidden
      className={cn("pointer-events-none absolute select-none", className)}
      style={{
        width : w,
        height: visibleH,
        clipPath: `inset(${cutTop}px ${-ext}px ${cutBottom}px ${-ext}px)`,
        ...style,
      }}
    >
      <div
        style={{
          position: "absolute",
          left: 0,
          top: -height * f,
          width : w,
          height,
          background: color,
          opacity,
          filter: `blur(${sigma}px)`,
          transform: `rotate(${rotate}deg)`,
          borderRadius: 9999,
        }}
      />
    </div>
  );
}