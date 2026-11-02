import { forwardRef, type ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

type GoldButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "gold" | "white";
};

/** Full-width 41px action button: Figma "Main Gradient" (white → #99804A) or plain white. */
export const GoldButton = forwardRef<HTMLButtonElement, GoldButtonProps>(
  ({ variant = "gold", className, type = "button", ...props }, ref) => (
    <button
      ref={ref}
      type={type}
      className={cn(
        "inline-flex h-[41px] w-full items-center justify-center gap-[7.5px] px-[28px] text-[14px] font-normal text-ink transition-opacity",
        "hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold/60 focus-visible:ring-offset-2 focus-visible:ring-offset-ink",
        "disabled:cursor-not-allowed disabled:opacity-50",
        variant === "gold" && "bg-[linear-gradient(90deg,#FFFFFF_6.863%,#99804A_88.235%)]",
        variant === "white" && "bg-white",
        className,
      )}
      {...props}
    />
  ),
);
GoldButton.displayName = "GoldButton";
