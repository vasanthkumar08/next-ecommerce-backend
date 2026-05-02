"use client";

import { useEffect, useCallback, ReactNode } from "react";

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
  size?: "sm" | "md" | "lg" | "xl";
}

const sizeMap = {
  sm: "max-w-sm",
  md: "max-w-md",
  lg: "max-w-lg",
  xl: "max-w-2xl",
};

export default function Modal({
  open,
  onClose,
  title,
  children,
  size = "md",
}: ModalProps) {
  // ESC to close
  const handleKey = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    },
    [onClose]
  );

  useEffect(() => {
    if (open) {
      document.addEventListener("keydown", handleKey);
      document.body.style.overflow = "hidden";
    }
    return () => {
      document.removeEventListener("keydown", handleKey);
      document.body.style.overflow = "";
    };
  }, [open, handleKey]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Panel */}
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className={[
          "relative w-full rounded-2xl border border-slate-200 bg-white shadow-md animate-[modalIn_.2s_ease-out]",
          sizeMap[size],
        ].join(" ")}
        style={{ animationFillMode: "both" }}
      >
        {/* Header */}
        {title && (
          <div className="flex items-center justify-between border-b border-[#e0e0e0] px-6 py-4">
            <h2 className="text-base font-bold text-[#111111]">{title}</h2>
            <button
              onClick={onClose}
              className="rounded-lg p-1.5 text-[#666666] transition hover:bg-[#f5f5f5] hover:text-[#111111]"
              aria-label="Close"
            >
              <svg viewBox="0 0 24 24" className="h-5 w-5 fill-none stroke-current stroke-2">
                <path d="M6 18L18 6M6 6l12 12" strokeLinecap="round" />
              </svg>
            </button>
          </div>
        )}

        {/* Body */}
        <div className="p-6">{children}</div>
      </div>

      <style>{`
        @keyframes modalIn {
          from { opacity: 0; transform: scale(.95) translateY(8px); }
          to   { opacity: 1; transform: scale(1)  translateY(0);    }
        }
      `}</style>
    </div>
  );
}
