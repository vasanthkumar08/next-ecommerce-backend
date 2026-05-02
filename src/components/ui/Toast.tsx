"use client";

import { Toast as ToastType, ToastVariant } from "@/hooks/useToast";

interface ToastProps {
  toast: ToastType;
  onDismiss: (id: string) => void;
}

const config: Record<
  ToastVariant,
  { bg: string; border: string; icon: string; glow: string }
> = {
  success: {
    bg:     "bg-white",
    border: "border-[#16a34a]/40",
    icon:   "✅",
    glow:   "shadow-[0_0_20px_rgba(22,163,74,0.18)]",
  },
  error: {
    bg:     "bg-white",
    border: "border-[#dc2626]/40",
    icon:   "❌",
    glow:   "shadow-[0_0_20px_rgba(220,38,38,0.18)]",
  },
  info: {
    bg:     "bg-white",
    border: "border-[#ff6700]/40",
    icon:   "ℹ️",
    glow:   "shadow-sm",
  },
};

function ToastItem({ toast, onDismiss }: ToastProps) {
  const { bg, border, icon, glow } = config[toast.variant];

  return (
    <div
      role="alert"
      className={[
        "flex items-start gap-3 rounded-xl border px-4 py-3",
        "animate-[toastIn_.25s_ease-out]",
        "min-w-[280px] max-w-sm",
        bg, border, glow,
      ].join(" ")}
    >
      <span className="mt-0.5 text-base leading-none">{icon}</span>
      <p className="flex-1 text-sm font-medium text-[#111111]">
        {toast.message}
      </p>
      <button
        onClick={() => onDismiss(toast.id)}
        className="ml-1 mt-0.5 rounded p-0.5 text-[#999] transition hover:text-[#333]"
        aria-label="Dismiss"
      >
        <svg viewBox="0 0 12 12" className="h-3 w-3 fill-none stroke-current stroke-[1.8px]">
          <path d="M1 1l10 10M11 1L1 11" strokeLinecap="round" />
        </svg>
      </button>

      <style>{`
        @keyframes toastIn {
          from { opacity: 0; transform: translateX(24px); }
          to   { opacity: 1; transform: translateX(0);    }
        }
      `}</style>
    </div>
  );
}

interface ToastContainerProps {
  toasts: ToastType[];
  onDismiss: (id: string) => void;
}

export function ToastContainer({ toasts, onDismiss }: ToastContainerProps) {
  if (!toasts.length) return null;

  return (
    <div
      aria-live="polite"
      className="fixed right-4 top-4 z-[9999] flex flex-col gap-2"
    >
      {toasts.map((t) => (
        <ToastItem key={t.id} toast={t} onDismiss={onDismiss} />
      ))}
    </div>
  );
}
