"use client";

import { useState } from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { AFFILIATE_BASE, currentUser, type CertificateLevel } from "../data";
import { Panel, StatusChip } from "../Panel";

type Props = {
  cert: CertificateLevel;
  referrals: number;
};

/** Draws a simple certificate PNG client-side until the designed artwork / backend render exists. */
function renderCertificatePng(cert: CertificateLevel, name: string): string {
  const w = 1600;
  const h = 1000;
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d");
  if (!ctx) return "";

  ctx.fillStyle = "#0F0F0F";
  ctx.fillRect(0, 0, w, h);
  const glow = ctx.createRadialGradient(w * 0.85, h * 0.9, 0, w * 0.85, h * 0.9, w * 0.6);
  glow.addColorStop(0, "rgba(153,128,74,0.45)");
  glow.addColorStop(1, "rgba(153,128,74,0)");
  ctx.fillStyle = glow;
  ctx.fillRect(0, 0, w, h);
  ctx.strokeStyle = "rgba(255,255,255,0.13)";
  ctx.lineWidth = 2;
  ctx.strokeRect(40, 40, w - 80, h - 80);

  ctx.textAlign = "center";
  ctx.fillStyle = "#99804A";
  ctx.font = "500 28px system-ui, sans-serif";
  ctx.fillText("PERPEYE AFFILIATE PROGRAM", w / 2, 220);
  ctx.fillStyle = "#FFFFFF";
  ctx.font = "400 72px system-ui, sans-serif";
  ctx.fillText("Certificate of Achievement", w / 2, 340);
  ctx.fillStyle = "rgba(255,255,255,0.5)";
  ctx.font = "400 28px system-ui, sans-serif";
  ctx.fillText("Proudly presented to", w / 2, 450);
  ctx.fillStyle = "#FFFFFF";
  ctx.font = "400 64px system-ui, sans-serif";
  ctx.fillText(name, w / 2, 545);
  ctx.fillStyle = "#99804A";
  ctx.font = "400 36px system-ui, sans-serif";
  ctx.fillText(`Level ${cert.level} · ${cert.tier}`, w / 2, 660);
  ctx.fillStyle = "rgba(255,255,255,0.5)";
  ctx.font = "400 26px system-ui, sans-serif";
  ctx.fillText(`${cert.range} · ${new Date().toLocaleDateString("en-US", { month: "long", year: "numeric" })}`, w / 2, 720);

  return canvas.toDataURL("image/png");
}

function LockIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 28 28" aria-hidden className={className}>
      <path
        fill="#99804A"
        d="M14 1.75C15.8565 1.75 17.637 2.4875 18.9497 3.80025C20.2625 5.11301 21 6.89348 21 8.75V12.25L21.357 12.2675C22.2191 12.3559 23.0177 12.7609 23.5983 13.4043C24.1789 14.0476 24.5002 14.8834 24.5 15.75V22.75C24.5 23.6783 24.1313 24.5685 23.4749 25.2249C22.8185 25.8813 21.9283 26.25 21 26.25H7C6.07174 26.25 5.1815 25.8813 4.52513 25.2249C3.86875 24.5685 3.5 23.6783 3.5 22.75V15.75C3.5 14.8217 3.86875 13.9315 4.52513 13.2751C5.1815 12.6187 6.07174 12.25 7 12.25V8.75C7 6.89348 7.7375 5.11301 9.05025 3.80025C10.363 2.4875 12.1435 1.75 14 1.75ZM14 15.75C13.5359 15.75 13.0908 15.9344 12.7626 16.2626C12.4344 16.5908 12.25 17.0359 12.25 17.5V21C12.25 21.4641 12.4344 21.9092 12.7626 22.2374C13.0908 22.5656 13.5359 22.75 14 22.75C14.4641 22.75 14.9092 22.5656 15.2374 22.2374C15.5656 21.9092 15.75 21.4641 15.75 21V17.5C15.75 17.0359 15.5656 16.5908 15.2374 16.2626C14.9092 15.9344 14.4641 15.75 14 15.75ZM14 5.25C13.0717 5.25 12.1815 5.61875 11.5251 6.27513C10.8687 6.9315 10.5 7.82174 10.5 8.75V12.25H17.5V8.75C17.5 7.82174 17.1313 6.9315 16.4749 6.27513C15.8185 5.61875 14.9283 5.25 14 5.25Z"
      />
    </svg>
  );
}

/** Figma "Certificates" card: preview, level + tier, status chip; Download/Share when unlocked, progress when locked. */
export function CertificateCard({ cert, referrals }: Props) {
  const unlocked = referrals >= cert.unlockAt;
  const [notice, setNotice] = useState("");
  const headingId = `certificate-${cert.tier.toLowerCase()}`;

  const download = () => {
    // TODO(backend): serve the designed certificate render; for now use the artwork if present, else draw one.
    const href = cert.preview ?? renderCertificatePng(cert, currentUser.name);
    if (!href) return;
    const a = document.createElement("a");
    a.href = href;
    a.download = `perpeye-certificate-level-${cert.level}-${cert.tier.toLowerCase()}.png`;
    a.click();
  };

  const share = async () => {
    // TODO(backend): public certificate URL.
    const url = `${window.location.origin}${AFFILIATE_BASE}/certificates/${cert.tier.toLowerCase()}`;
    const data = { title: `Perpeye ${cert.tier} certificate`, text: `I reached Level ${cert.level} · ${cert.tier} in the Perpeye affiliate program.`, url };
    try {
      if (navigator.share) {
        await navigator.share(data);
        return;
      }
      await navigator.clipboard.writeText(url);
      setNotice("Link copied to clipboard.");
    } catch {
      setNotice("Couldn’t share — copy the link from your browser instead.");
    }
  };

  return (
    <Panel className="flex flex-col p-[16px]">
      <h2 id={headingId} className="sr-only">
        Level {cert.level} {cert.tier} certificate
      </h2>

      {/* Preview */}
      <div className="relative aspect-[7/4] overflow-hidden border-[0.7px] border-white/[0.06] bg-[#0A0A0A]">
        {unlocked ? (
          cert.preview ? (
            <Image src={cert.preview} alt={`Level ${cert.level} ${cert.tier} certificate preview`} fill sizes="(min-width: 1280px) 330px, 90vw" className="object-cover" />
          ) : (
            <div aria-hidden className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,rgba(255,255,255,0.08),transparent_60%)]" />
          )
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center px-[16px] text-center">
            <LockIcon className="h-[36px] w-[36px]" />
            <p className="mt-[16px] text-[14px] leading-[1.3] text-gold-accent">Level {cert.level} certificate is locked</p>
            <p className="mt-[6px] text-[12px] leading-[1.3] text-white/50">Reach {cert.unlockAt} referrals to unlock it</p>
          </div>
        )}
      </div>

      <div className="mt-[16px] flex items-start justify-between gap-[12px]">
        <div>
          <p className="text-[12px] leading-[1.3] text-white/50">
            Level {cert.level} · <span className="text-white">{cert.tier}</span>
          </p>
          <p className="mt-[4px] text-[12px] leading-[1.3] text-white/50">{cert.range}</p>
        </div>
        <StatusChip tone={unlocked ? "green" : "muted"} className="h-[22px] shrink-0 text-[11px] leading-none">
          {unlocked ? "Unlocked" : "Locked"}
        </StatusChip>
      </div>

      {unlocked ? (
        <div className="mt-[16px]">
          <div className="flex flex-wrap gap-[8px]">
            <button
              type="button"
              onClick={download}
              className="inline-flex h-[36px] items-center bg-[linear-gradient(90deg,#FFFFFF_6.863%,#99804A_88.235%)] px-[18px] text-[12px] text-ink transition-opacity hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold/60 focus-visible:ring-offset-2 focus-visible:ring-offset-ink"
            >
              Download PNG
            </button>
            <button
              type="button"
              onClick={share}
              className="inline-flex h-[36px] items-center border-[0.7px] border-white/[0.13] bg-white/[0.03] px-[18px] text-[12px] text-white transition-colors hover:bg-white/[0.06] focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-gold-accent"
            >
              Share
            </button>
          </div>
          <p role="status" className={cn("text-[11px] leading-[1.4] text-white/50", notice ? "mt-[8px]" : "sr-only")}>
            {notice}
          </p>
        </div>
      ) : (
        <div className="mt-[24px]">
          <div
            role="progressbar"
            aria-label={`Progress to the Level ${cert.level} certificate`}
            aria-valuemin={0}
            aria-valuemax={cert.unlockAt}
            aria-valuenow={Math.min(referrals, cert.unlockAt)}
            className="h-[4px] w-full rounded-full bg-white/[0.06]"
          >
            <div className="h-full rounded-full bg-[linear-gradient(90deg,#99804A,#FFFFFF)]" style={{ width: `${Math.min(referrals / cert.unlockAt, 1) * 100}%` }} />
          </div>
          <p className="mt-[8px] text-[11px] leading-[1.3] text-white/30">
            {referrals} of {cert.unlockAt} referrals
          </p>
        </div>
      )}
    </Panel>
  );
}
