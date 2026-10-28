import Link from "next/link";
import { cn } from "@/lib/utils";

type ButtonProps = {
  href: string;
  variant?: "primary" | "secondary";
  children: React.ReactNode;
  className?: string;
};

// Primary = white button, Secondary = dark outlined button (as in design)
export function Button({ href, variant = "primary", children, className }: ButtonProps) {
  return (
    <Link
      href={href}
      className={cn(
        "inline-flex h-9 items-center justify-center gap-2 px-5 text-xs font-medium transition-opacity hover:opacity-90",
        variant === "primary" && "bg-white text-black",
        variant === "secondary" && "border border-border bg-surface text-foreground",
        className,
      )}
    >
      {children}
    </Link>
  );
}
