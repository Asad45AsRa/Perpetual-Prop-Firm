import Image from "next/image";
import type { CSSProperties } from "react";
import { cn } from "@/lib/utils";
import { DASH_ASSETS } from "../data";

const ART = `${DASH_ASSETS}/giveaways`;

/** Figma card frame size; every layer below is in these px and rendered as % of the box so it scales. */
const W = 547;
const H = 274;

type ImgLayer = {
  src: string;
  /** Intrinsic size of the PNG in /public (aspect ratio only). */
  iw: number;
  ih: number;
  /** Figma rect: top-left corner (pre-rotation), size, rotation about that corner (deg, clockwise). */
  x: number;
  y: number;
  w: number;
  h: number;
  rot?: number;
  mirror?: boolean;
  /** How the image sits inside the rect (fractions of the rect), from Figma's "crop" fill. Defaults to fill. */
  fit?: { sx: number; sy: number; tx: number; ty: number };
};

type GlowLayer = {
  glow: true;
  cx: number;
  cy: number;
  rx: number;
  ry: number;
  rot?: number;
  color: string;
  blur: number;
  blend?: "plus-lighter";
};

type Layer = ImgLayer | GlowLayer;

const isGlow = (l: Layer): l is GlowLayer => "glow" in l;

// Shared top-left white highlight present on every card.
const topLeftHighlight: GlowLayer = { glow: true, cx: -88.5, cy: 8, rx: 184.5, ry: 113, color: "rgba(255,255,255,0.3)", blur: 70 };

/** Layer stacks copied from the Figma card exports (Frame 2131332258 / 2131332262 / 2131332260). Order = z-order. */
const LAYERS: Record<string, Layer[]> = {
  AXIS: [
    { glow: true, cx: 481.5, cy: 285.5, rx: 206.6, ry: 110.8, rot: -11.44, color: "#99804A", blur: 70 },
    { glow: true, cx: 484.5, cy: 300.4, rx: 177.5, ry: 95.5, rot: -11.44, color: "#FFF1D3", blur: 50, blend: "plus-lighter" },
    topLeftHighlight,
    // Trophy full of silver coins; the rect crops the (scaled-up) render.
    { src: `${ART}/axis.png`, iw: 900, ih: 900, x: 223, y: 149.9, w: 348.1, h: 340.6, rot: -18.58, fit: { sx: 1.1785, sy: 1.2044, tx: -0.0831, ty: -0.1101 } },
    { src: `${ART}/bolt.png`, iw: 280, ih: 507, x: 208, y: 70.5, w: 70.4, h: 127.4, rot: -60.83 },
    { src: `${ART}/bolt.png`, iw: 280, ih: 507, x: 508.2, y: 31, w: 29.2, h: 52.8, rot: 16.69 },
  ],
  ONYX: [
    { glow: true, cx: 432.7, cy: 320.8, rx: 220.9, ry: 109.5, rot: -14.4, color: "#99804A", blur: 70 },
    { glow: true, cx: 434, cy: 325.7, rx: 210.2, ry: 104.5, rot: -14.4, color: "#FFF1D3", blur: 50, blend: "plus-lighter" },
    topLeftHighlight,
    // Gold $ on silk; Figma crops the top 27% of the render.
    { src: `${ART}/onyx.png`, iw: 720, ih: 898, x: 298.3, y: -14.8, w: 355.9, h: 323.2, rot: 25.55, fit: { sx: 1, sy: 1.3735, tx: 0, ty: -0.3734 } },
    { src: `${ART}/coin-silver.png`, iw: 600, ih: 539, x: 316.1, y: 48.7, w: 56.2, h: 50.5, rot: 82.65 },
    { src: `${ART}/coin-silver.png`, iw: 600, ih: 539, x: 432.6, y: 128.1, w: 94.9, h: 85.3, rot: -8.21 },
  ],
  APEX: [
    topLeftHighlight,
    { glow: true, cx: 419, cy: 340.9, rx: 190.5, ry: 94.5, rot: -14.4, color: "#99804A", blur: 110 },
    { glow: true, cx: 420.2, cy: 345.1, rx: 181.3, ry: 90.1, rot: -14.4, color: "#FFF1D3", blur: 50, blend: "plus-lighter" },
    { src: `${ART}/apex.png`, iw: 900, ih: 871, x: 261, y: 98, w: 265, h: 256 },
    { src: `${ART}/coin.png`, iw: 400, ih: 400, x: 240, y: 17, w: 115, h: 115 },
    { src: `${ART}/coin.png`, iw: 400, ih: 400, x: 464, y: 71, w: 61, h: 61, mirror: true },
  ],
};

const pct = (v: number, base: number) => `${(v / base) * 100}%`;

function Glow({ layer }: { layer: GlowLayer }) {
  const style: CSSProperties = {
    left: pct(layer.cx - layer.rx, W),
    top: pct(layer.cy - layer.ry, H),
    width: pct(layer.rx * 2, W),
    height: pct(layer.ry * 2, H),
    background: layer.color,
    filter: `blur(${layer.blur}px)`,
    transform: layer.rot ? `rotate(${layer.rot}deg)` : undefined,
    mixBlendMode: layer.blend,
  };
  return <div className="absolute rounded-full" style={style} />;
}

function Img({ layer }: { layer: ImgLayer }) {
  const fit = layer.fit ?? { sx: 1, sy: 1, tx: 0, ty: 0 };
  const box: CSSProperties = {
    left: pct(layer.x, W),
    top: pct(layer.y, H),
    width: pct(layer.w, W),
    height: pct(layer.h, H),
    transformOrigin: layer.mirror ? "center" : "0 0",
    transform: layer.mirror ? "scaleX(-1)" : layer.rot ? `rotate(${layer.rot}deg)` : undefined,
  };
  const img: CSSProperties = {
    position: "absolute",
    left: `${fit.tx * 100}%`,
    top: `${fit.ty * 100}%`,
    width: `${fit.sx * 100}%`,
    height: `${fit.sy * 100}%`,
    maxWidth: "none",
  };
  return (
    <div className="absolute overflow-hidden" style={box}>
      <Image src={layer.src} alt="" width={layer.iw} height={layer.ih} sizes={`${Math.round(layer.w * fit.sx * 1.5)}px`} style={img} />
    </div>
  );
}

/**
 * Decorative illustration layer for a GiveawayCard; must sit inside a `relative overflow-hidden` parent.
 * The layers live in a right-anchored 547×274 box (the Figma card size) so they render identically at every
 * card width. When the card is wide enough (1-column ≥ sm, or 2-column ≥ 1340px; the grid goes 2-col at xl) the box is the card's full
 * height; in the 2-col 1280–1339 range it is scaled to 82% and tucked bottom-right, clear of the copy. On phones (< sm) this is
 * hidden and GiveawayCard shows the pre-composed Figma mobile render instead.
 */
export function GiveawayArt({ tier }: { tier: string }) {
  const layers = LAYERS[tier] ?? [];
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
      <div
        className={cn(
          "absolute bottom-0 aspect-[547/274]",
          // hidden on phones (GiveawayCard shows the Figma mobile render instead)   full (1-col ≥ sm)   compact (2-col 1280–1339)   full (2-col ≥1340)
          "hidden sm:block sm:top-0 sm:right-0 xl:top-auto xl:h-[82%] xl:right-[-14%] min-[1340px]:top-0 min-[1340px]:h-auto min-[1340px]:right-0",
        )}
      >
        {layers.map((layer, i) => (isGlow(layer) ? <Glow key={i} layer={layer} /> : <Img key={i} layer={layer} />))}
      </div>
    </div>
  );
}
