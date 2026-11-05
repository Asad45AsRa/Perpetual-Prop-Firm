"use client";
/* eslint-disable @next/next/no-img-element -- decorative glow SVG */

import { useState } from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { DASH_ASSETS, leaderboard, type Trader } from "./data";
import { Panel, PanelTitle, StatusChip } from "./Panel";

const PAGE_SIZE = 6;

function Avatar({ src, size = 25 }: { src: string; size?: number }) {
  return (
    <span className="relative shrink-0 overflow-hidden rounded-full" style={{ width: size, height: size }}>
      <Image src={src} alt="" fill sizes={`${size}px`} className="object-cover" />
    </span>
  );
}

function Row({ t }: { t: Trader }) {
  return (
    <li className="grid h-[48px] grid-cols-[82px_1fr_auto] items-center border-b-[0.7px] border-white/[0.13] pl-px">
      <span className="text-[12px] leading-normal text-white/50">{String(t.rank).padStart(2, "0")}</span>
      <span className="flex min-w-0 items-center gap-[7px] text-[14px] leading-normal text-white">
        <Avatar src={t.avatar} />
        <span className="truncate">{t.name}</span>
      </span>
      <span className="text-right text-[14px] leading-normal text-[#47a847]">{t.earning}</span>
    </li>
  );
}

/** Podium label offsets (Figma, relative to the 486px card). */
const PODIUM_POS: Record<number, string> = {
  1: "left-[calc(50%-39px)] top-[73px]",
  // 2nd/3rd sit 160px either side of centre; on narrow phones they clamp to a 12px inset so they never clip.
  2: "left-[max(12px,calc(50%-160px))] top-[117px]",
  3: "right-[max(12px,calc(50%-160px))] top-[117px]",
};

export function Leaderboard() {
  const [page, setPage] = useState(0);
  // TODO(backend): paginate server-side; mock data has a single page.
  const pages = Math.max(1, Math.ceil(leaderboard.rows.length / PAGE_SIZE));
  const rows = leaderboard.rows.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);
  const { you } = leaderboard;

  return (
    <Panel className="flex flex-col pb-[16px] xl:min-h-[833px]">
      <div aria-hidden className="pointer-events-none absolute left-1/2 top-[-70px] h-[143px] w-[434px] -translate-x-1/2">
        <div className="absolute inset-[-121.45%_-40.02%]">
          <img src={`${DASH_ASSETS}/glow-leaderboard.svg`} alt="" className="block h-full w-full max-w-none" />
        </div>
      </div>

      {/* Header + podium (299px tall in Figma) */}
      <div className="relative h-[299px] shrink-0">
        <div className="flex items-start justify-between px-[16px] pt-[16.7px]">
          <div>
            <PanelTitle>Leaderboard</PanelTitle>
            <p className="mt-[2px] text-[12px] leading-[1.3] text-white/50">{leaderboard.period}</p>
          </div>
          <StatusChip bordered className="h-[24px] text-[12px] leading-normal">
            Live
          </StatusChip>
        </div>

        <Image
          src={`${DASH_ASSETS}/podium.png`}
          alt=""
          width={390}
          height={139}
          sizes="390px"
          // object-contain + bottom anchor: on cards narrower than 390px the whole podium scales down instead of cropping the side steps.
          className="absolute left-1/2 top-[144px] h-[139px] w-[390px] max-w-[calc(100%-16px)] -translate-x-1/2 object-contain object-bottom"
        />

        {leaderboard.podium.map((p) => (
          <div key={p.place} className={cn("absolute", PODIUM_POS[p.place])}>
            <p className="flex items-center gap-[7px] whitespace-nowrap text-[14px] leading-normal text-white">
              <Avatar src={p.avatar} />
              <span>
                <span className="sr-only">#{p.place} </span>
                {p.name}
              </span>
            </p>
            <p className="mt-[7px] text-[14px] leading-normal text-[#47a847]">{p.earning}</p>
          </div>
        ))}
      </div>

      {/* Table header bar spans the full card width */}
      <div className="grid h-[42px] shrink-0 grid-cols-[82px_1fr_auto] items-center bg-ink px-[17px] text-[12px] leading-[1.3] text-white/30">
        <span>Rank</span>
        <span>Trader</span>
        <span className="text-right">Total Earning</span>
      </div>

      <ol className="px-[16px]">
        {rows.map((t) => (
          <Row key={`${t.rank}-${t.name}`} t={t} />
        ))}
      </ol>

      <div className="mt-[21px] flex justify-end gap-[9px] px-[16px]">
        <PagerButton label="Previous page" disabled={page === 0} onClick={() => setPage((p) => p - 1)} flip />
        <PagerButton label="Next page" disabled={page >= pages - 1} onClick={() => setPage((p) => p + 1)} />
      </div>

      <div className="mt-auto px-[16px] pt-[32px]">
        <p className="pl-[5px] text-[12px] leading-[1.3] text-white/30">Your position</p>
        <div className="mx-[4.5px] mt-[11px] grid h-[48px] grid-cols-[75px_1fr_auto] items-center border-l-2 border-gold-accent bg-[linear-gradient(90deg,rgba(153,128,74,0.15),rgba(153,128,74,0))] pl-[14px] pr-[18px]">
          <span className="text-[12px] leading-normal text-white/50">{you.rank}</span>
          <span className="flex min-w-0 items-center gap-[7px] text-[14px] leading-normal text-white">
            <Avatar src={you.avatar} />
            <span className="truncate">{you.name}</span>
          </span>
          <span className="text-right text-[14px] leading-normal text-[#47a847]">{you.earning}</span>
        </div>
        <p className="mt-[10px] pl-[5px] text-[12px] leading-[1.3] text-white/30">Leaderboard of live partners</p>
      </div>
    </Panel>
  );
}

function PagerButton({ label, disabled, onClick, flip }: { label: string; disabled: boolean; onClick: () => void; flip?: boolean }) {
  return (
    <button
      type="button"
      aria-label={label}
      disabled={disabled}
      onClick={onClick}
      className="flex h-[34.1px] w-[34.1px] items-center justify-center border-[0.57px] border-white/[0.06] bg-white/[0.06] transition-opacity hover:bg-white/10 disabled:opacity-60"
    >
      <Image src={`${DASH_ASSETS}/icons/chevron-right.svg`} alt="" width={18} height={18} unoptimized className={cn("h-[18px] w-[18px]", flip && "rotate-180")} />
    </button>
  );
}
