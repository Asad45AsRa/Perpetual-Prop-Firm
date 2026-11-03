import { forwardRef, type InputHTMLAttributes, type SelectHTMLAttributes } from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { ASSET_DIR } from "./constants";

const control =
  "h-[40px] w-full border-[0.7px] bg-white/[0.06] px-[14px] text-[14px] leading-[1.3] text-white placeholder:text-white/30 outline-none transition-colors focus:border-gold-accent";

export function FieldLabel({ htmlFor, children }: { htmlFor?: string; children: React.ReactNode }) {
  return (
    <label htmlFor={htmlFor} className="mb-[10px] block text-[12px] leading-[1.3] text-white/30">
      {children}
    </label>
  );
}

export function FieldError({ id, message }: { id: string; message?: string }) {
  if (!message) return null;
  return (
    <p id={id} role="alert" className="mt-1.5 text-[12px] leading-[1.3] text-red-400">
      {message}
    </p>
  );
}

type TextFieldProps = InputHTMLAttributes<HTMLInputElement> & { label: string; error?: string };

export const TextField = forwardRef<HTMLInputElement, TextFieldProps>(
  ({ label, error, id, className, ...props }, ref) => {
    const errId = `${id}-error`;
    return (
      <div className={cn("min-w-0", className)}>
        <FieldLabel htmlFor={id}>{label}</FieldLabel>
        <input
          ref={ref}
          id={id}
          aria-invalid={!!error}
          aria-describedby={error ? errId : undefined}
          className={cn(control, error ? "border-red-500/60" : "border-white/[0.13]")}
          {...props}
        />
        <FieldError id={errId} message={error} />
      </div>
    );
  },
);
TextField.displayName = "TextField";

type SelectFieldProps = SelectHTMLAttributes<HTMLSelectElement> & {
  label: string;
  placeholder: string;
  options: readonly string[];
  error?: string;
  /** Placeholder option selected — renders in muted color. */
  isEmpty?: boolean;
};

export const SelectField = forwardRef<HTMLSelectElement, SelectFieldProps>(
  ({ label, placeholder, options, error, isEmpty, id, className, ...props }, ref) => {
    const errId = `${id}-error`;
    return (
      <div className={cn("min-w-0", className)}>
        <FieldLabel htmlFor={id}>{label}</FieldLabel>
        <div className="relative">
          <select
            ref={ref}
            id={id}
            // SSR needs this, or the browser preselects the first enabled option.
            defaultValue=""
            aria-invalid={!!error}
            aria-describedby={error ? errId : undefined}
            className={cn(
              control,
              "cursor-pointer appearance-none pr-[38px]",
              isEmpty && "text-white/30",
              error ? "border-red-500/60" : "border-white/[0.13]",
            )}
            {...props}
          >
            <option value="" disabled>
              {placeholder}
            </option>
            {options.map((o) => (
              <option key={o} value={o} className="bg-ink text-white">
                {o}
              </option>
            ))}
          </select>
          <Image
            src={`${ASSET_DIR}/chevron-down.svg`}
            alt=""
            width={23}
            height={23}
            unoptimized
            className="pointer-events-none absolute right-[8px] top-1/2 h-[23px] w-[23px] -translate-y-1/2 rotate-90"
          />
        </div>
        <FieldError id={errId} message={error} />
      </div>
    );
  },
);
SelectField.displayName = "SelectField";
