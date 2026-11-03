"use client";

import { useEffect, useId, useRef, type ReactNode } from "react";
import { cn } from "@/lib/utils";

type ModalProps = {
  open: boolean;
  onClose: () => void;
  title: string;
  description?: ReactNode;
  children?: ReactNode;
  className?: string;
  /** Form-style dialog: title block in its own band with a divider line, body below. */
  divided?: boolean;
};

/**
 * Centered dialog on a dimmed backdrop. Built on native <dialog>.showModal(), which gives
 * focus trapping, Esc-to-close and top-layer stacking for free. Clicking the backdrop closes it.
 */
export function Modal({ open, onClose, title, description, children, className, divided }: ModalProps) {
  const ref = useRef<HTMLDialogElement>(null);
  const titleId = useId();
  const descId = useId();

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  return (
    <dialog
      ref={ref}
      aria-labelledby={titleId}
      aria-describedby={description ? descId : undefined}
      // Esc fires "cancel"; keep React state in charge of closing.
      onCancel={(e) => {
        e.preventDefault();
        onClose();
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      className={cn(
        "m-auto w-[calc(100%-32px)] max-w-[400px] border-[0.7px] border-white/[0.13] bg-[#161616] p-0 text-white",
        "backdrop:bg-black/70 backdrop:backdrop-blur-[2px]",
        className,
      )}
    >
      {divided ? (
        <>
          <div className="border-b-[0.7px] border-white/[0.13] bg-white/[0.03] px-[16px] py-[14px]">
            <h2 id={titleId} className="text-[16px] font-normal leading-[1.3] tracking-[-0.32px]">
              {title}
            </h2>
            {description && (
              <p id={descId} className="mt-[4px] text-[11px] leading-[1.4] text-white/50">
                {description}
              </p>
            )}
          </div>
          <div className="p-[16px]">{children}</div>
        </>
      ) : (
        <div className="p-[24px]">
          <h2 id={titleId} className="text-[20px] font-normal leading-[1.3] tracking-[-0.4px]">
            {title}
          </h2>
          {description && (
            <p id={descId} className="mt-[8px] text-[13px] leading-[1.4] text-white/50">
              {description}
            </p>
          )}
          {children}
        </div>
      )}
    </dialog>
  );
}

/** Secondary + danger button pair used at the bottom of confirm dialogs. */
export function ConfirmActions({
  onCancel,
  onConfirm,
  confirmLabel,
  pending,
}: {
  onCancel: () => void;
  onConfirm: () => void;
  confirmLabel: string;
  pending?: boolean;
}) {
  return (
    <div className="mt-[22px] flex gap-[10px]">
      <button
        type="button"
        onClick={onCancel}
        className="h-[41px] flex-1 border-[0.7px] border-white/[0.13] bg-white/[0.06] text-[14px] text-white transition-colors hover:bg-white/[0.1] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40"
      >
        Cancel
      </button>
      <button
        type="button"
        onClick={onConfirm}
        disabled={pending}
        className="h-[41px] flex-1 bg-[#C71919] text-[14px] text-white transition-opacity hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-400 disabled:opacity-60"
      >
        {confirmLabel}
      </button>
    </div>
  );
}
