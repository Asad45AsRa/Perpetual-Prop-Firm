"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { currentUser } from "../data";
import { StatusChip } from "../Panel";

/**
 * Public / Private switch for the leaderboard. Private hides the affiliate's username and
 * avatar from other partners on the public leaderboard; their own dashboard is unaffected.
 */
export function ProfileVisibility() {
  const [isPublic, setIsPublic] = useState(currentUser.leaderboardPublic);
  const [notice, setNotice] = useState("");

  const toggle = () => {
    const next = !isPublic;
    // TODO(backend): PATCH { leaderboardPublic: next } on the affiliate profile.
    setIsPublic(next);
    setNotice(next ? "Your profile is now visible on the leaderboard." : "Your profile is now hidden from the leaderboard.");
  };

  return (
    <div className="border-t-[0.7px] border-white/[0.13] px-[16px] pb-[20px] pt-[18px]">
      <h3 className="text-[14px] font-normal leading-normal text-white">Profile Visibility</h3>

      <div className="mt-[16px] flex items-center justify-between gap-x-4 sm:gap-x-6">
        <div className="min-w-0 flex-1 sm:max-w-[420px]">
          <div className="flex flex-wrap items-center gap-x-[8px] gap-y-[4px]">
            <p className="text-[13px] leading-[1.3] text-white">Show my profile on the leaderboard</p>
            <StatusChip tone={isPublic ? "green" : "muted"} className="py-[2px] text-[11px] leading-normal">
              {isPublic ? "Public" : "Private"}
            </StatusChip>
          </div>
          <p className="mt-[4px] text-[12px] leading-[1.4] text-white/50">
            {isPublic
              ? "Other partners can see your username, avatar and rank on the public leaderboard."
              : "Your username and avatar are hidden from other partners. Your rank still counts, but shows as anonymous."}
          </p>
        </div>

        <button
          type="button"
          role="switch"
          aria-checked={isPublic}
          aria-label="Show my profile on the leaderboard"
          onClick={toggle}
          className={cn(
            "relative h-[24px] w-[44px] shrink-0 rounded-full border-[0.7px] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-accent focus-visible:ring-offset-2 focus-visible:ring-offset-ink",
            isPublic ? "border-gold-accent bg-gold-accent" : "border-white/[0.13] bg-white/[0.06]",
          )}
        >
          <span
            aria-hidden
            className={cn(
              "absolute top-[2.3px] h-[18px] w-[18px] rounded-full transition-[left,background-color] duration-200 ease-out motion-reduce:transition-none",
              isPublic ? "left-[22px] bg-white" : "left-[2px] bg-white/50",
            )}
          />
        </button>
      </div>

      <p role="status" className="mt-[8px] min-h-[16px] text-[12px] text-white/50">
        {notice}
      </p>
    </div>
  );
}
