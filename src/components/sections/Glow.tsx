import { cn } from "@/lib/utils";

type GlowProps = {
  className?: string;
  color?: string;   // rgba/hex
  width: number;    // px (Figma width)
  height: number;   // px (Figma height)
  blur?: number;    // px (Figma layer blur)
  opacity?: number;
  rotate?: number;  // deg
};

export function Glow({
  className,
  color = "#8A8472",
  width,
  height,
  blur = 150,
  opacity = 0.55,
  rotate = 0,
}: GlowProps) {
  return (
    <div
      aria-hidden
      className={cn("pointer-events-none absolute select-none", className)}
      style={{
        width,
        height,
        background: color,
        opacity,
        filter: `blur(${blur}px)`,
        transform: `rotate(${rotate}deg)`,
        borderRadius: "9999px",
      }}
    />
  );
}