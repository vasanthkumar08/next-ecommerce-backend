import { useState, useCallback, useRef } from "react";

export type ToastVariant = "success" | "error" | "info";

export interface Toast {
  id: string;
  message: string;
  variant: ToastVariant;
}

export function useToast(duration = 3500) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const counter = useRef(0);

  const show = useCallback(
    (message: string, variant: ToastVariant = "info") => {
      const id = `toast-${++counter.current}`;
      setToasts((prev) => [...prev, { id, message, variant }]);
      setTimeout(
        () => setToasts((prev) => prev.filter((t) => t.id !== id)),
        duration
      );
    },
    [duration]
  );

  const dismiss = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const success = useCallback(
    (msg: string) => show(msg, "success"),
    [show]
  );
  const error = useCallback(
    (msg: string) => show(msg, "error"),
    [show]
  );
  const info = useCallback(
    (msg: string) => show(msg, "info"),
    [show]
  );

  return { toasts, show, dismiss, success, error, info };
}