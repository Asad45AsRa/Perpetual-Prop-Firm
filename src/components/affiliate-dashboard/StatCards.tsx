import Image from "next/image";
import { cn } from "@/lib/utils";
import { stats, type StatCardData } from "./data";

function StatCard({ label, value, icon, iconSize, delta, caption, sparkline, highlight }: StatCardData) {
  return (
    <article
      className={cn(
        "relative h-[150px] overflow-hidden border-[0.7px] border-white/[0.13] px-[14.3px] pt-[18.3px] backdrop-blur-[10px]",
        highlight
          ? "bg-[linear-gradient(119.94deg,#FFFFFF_0%,#99804A_100.9%)]"
          : "bg-[linear-gradient(180deg,rgba(255,255,255,0.1),rgba(153,128,74,0.1))]",
      )}
    >
      <p className={cn("text-[12px] leading-[1.3]", highlight ? "text-ink/70" : "text-white/50")}>{label}
      </p>
      <p
        className={cn(
          "mt-[10.4px] text-[35px] leading-[1.3] tracking-[-0.7px]",
          highlight ? "text-ink" : "text-white",
        )}
      >
        {value}
      </p>

      {delta && (
        <span className="absolute left-[14.3px] top-[102.3px] bg-[#47a847]/[0.12] px-[10px] py-[7px] text-[12px] leading-normal text-[#47a847]">
          {delta}
        </span>
      )}
      {caption && (
        <p className={cn("absolute left-[14.3px] top-[109.3px] text-[12px] leading-normal", highlight ? "text-ink/70" : "text-white/50")}>
          {caption}
        </p>
      )}

      <span
        className={cn(
          "absolute right-[17px] top-[18.3px] flex h-[34.1px] w-[34.1px] items-center justify-center border-[0.57px] border-white/[0.06]",
          highlight ? "bg-ink/20" : "bg-white/[0.06]",
        )}
      >
        <Image src={icon} alt="" width={iconSize} height={iconSize} unoptimized style={{ width: iconSize, height: iconSize }} />
      </span>

      {sparkline && (
        <Image
          src={sparkline}
          alt=""
          width={109}
          height={41}
          unoptimized
          className="absolute bottom-[19px] right-[17px] h-[41px] w-[min(109.5px,calc(100%-150px))]"
        />
      )}
    </article>
  );
}

export function StatCards() {
  return (
    <div className="grid grid-cols-1 gap-[16px] min-[520px]:grid-cols-2 xl:grid-cols-4">
      {stats.map((s) => (
        <StatCard key={s.label} {...s} />
      ))}
    </div>
  );
}
