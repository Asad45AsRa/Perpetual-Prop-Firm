"use client";

import { useEffect, useState } from "react";
import { Check, Copy, Pencil } from "lucide-react";
import { GoldButton } from "@/components/affiliate-join/GoldButton";
import { currentUser, REFERRAL_BASE } from "../data";
import { Panel } from "../Panel";
import { EditReferralLinkModal } from "./EditReferralLinkModal";

/** "Your referral link" strip: edit (opens the edit popup), dashed link box with copy icon, Copy Link. */
export function ReferralLinkBar() {
  const [copied, setCopied] = useState(false);
  const [editing, setEditing] = useState(false);
  // TODO(backend): persist; for now the edited code lasts until the page reloads.
  const [code, setCode] = useState(currentUser.referralCode);
  const link = `${REFERRAL_BASE}${code}`;
  const displayLink = link.replace(/^https?:\/\//, "");

  useEffect(() => {
    if (!copied) return;
    const t = setTimeout(() => setCopied(false), 1800);
    return () => clearTimeout(t);
  }, [copied]);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(link);
      setCopied(true);
    } catch {
      // Clipboard blocked (insecure context / permissions): the link stays visible to copy by hand.
    }
  };

  return (
    <Panel className="flex flex-col gap-[12px] px-[16px] py-[11px] md:flex-row md:items-center md:justify-between">
      <div className="min-w-0">
        <h2 className="text-[14px] font-normal leading-normal text-white">Your referral link</h2>
        <p className="mt-[2px] text-[12px] leading-[1.3] text-white/50">Share your link. Earn commissions.</p>
      </div>

      <div className="flex min-w-0 flex-wrap items-center gap-[9px] sm:flex-nowrap">
        <button
          type="button"
          aria-label="Edit referral link"
          aria-haspopup="dialog"
          onClick={() => setEditing(true)}
          className="flex h-[41px] w-[41px] shrink-0 items-center justify-center border-[0.57px] border-white/[0.06] bg-white/[0.06] text-white/70 transition-colors hover:bg-white/10 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-accent"
        >
          <Pencil aria-hidden className="h-[15px] w-[15px]" />
        </button>

        <div className="flex h-[41px] min-w-0 flex-1 items-center gap-[10px] border border-dashed border-gold-accent/60 bg-gold-accent/[0.06] px-[12px] sm:w-[245px] sm:flex-none">
          <span className="min-w-0 flex-1 truncate text-[12px] leading-normal text-gold-accent">{displayLink}</span>
          <button
            type="button"
            onClick={copy}
            aria-label="Copy referral link"
            className="shrink-0 text-gold-accent transition-opacity hover:opacity-80 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-gold-accent"
          >
            {copied ? <Check aria-hidden className="h-[14px] w-[14px] text-[#47a847]" /> : <Copy aria-hidden className="h-[14px] w-[14px]" />}
          </button>
        </div>

        <GoldButton onClick={copy} className="w-full shrink-0 sm:w-[113px] sm:px-0">
          {copied ? "Copied" : "Copy Link"}
        </GoldButton>
        <span role="status" className="sr-only">
          {copied ? "Referral link copied" : ""}
        </span>
      </div>

      <EditReferralLinkModal open={editing} onClose={() => setEditing(false)} currentCode={code} onSave={setCode} />
    </Panel>
  );
}
