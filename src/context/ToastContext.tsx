"use client";

import { createContext, useContext, ReactNode } from "react";
import { useToast } from "@/hooks/useToast";
import { ToastContainer } from "@/components/ui/Toast";

interface ToastCtx {
  success: (msg: string) => void;
  error:   (msg: string) => void;
  info:    (msg: string) => void;
}

const ToastContext = createContext<ToastCtx>({
  success: () => {},
  error:   () => {},
  info:    () => {},
});

export function ToastProvider({ children }: { children: ReactNode }) {
  const { toasts, dismiss, success, error, info } = useToast();

  return (
    <ToastContext.Provider value={{ success, error, info }}>
      {children}
      <ToastContainer toasts={toasts} onDismiss={dismiss} />
    </ToastContext.Provider>
  );
}

export const useToastContext = () => useContext(ToastContext);
