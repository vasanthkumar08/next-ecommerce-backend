"use client";

import { memo, useEffect } from "react";

interface SidebarProps {
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
}

function Sidebar({ open, onClose, children }: SidebarProps) {
  // Lock body scroll when mobile drawer is open
  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <>
      {/* ── DESKTOP: sticky sidebar ──────────────────── */}
      <aside className="hidden lg:block">
        <div className="sticky top-24 w-64 shrink-0">
          <div className="rounded-xl border border-[#e0e0e0] bg-white p-5 shadow-sm">
            {children}
          </div>
        </div>
      </aside>

      {/* ── MOBILE: slide-in drawer ───────────────────── */}
      {/* Backdrop */}
      <div
        className={`fixed inset-0 z-40 bg-black/40 transition-opacity duration-300 lg:hidden ${
          open ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Drawer panel */}
      <div
        className={`fixed inset-y-0 left-0 z-50 w-72 overflow-y-auto bg-white p-5 shadow-xl transition-transform duration-300 ease-in-out lg:hidden ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
        role="dialog"
        aria-modal="true"
        aria-label="Filters"
      >
        {/* Drawer header */}
        <div className="mb-5 flex items-center justify-between">
          <h2 className="text-base font-bold text-slate-800">Filters</h2>
          <button
            onClick={onClose}
            className="rounded-lg p-2 text-slate-500 transition hover:bg-[#f5f5f5]"
            aria-label="Close filters"
          >
            <svg viewBox="0 0 24 24" className="h-5 w-5 fill-none stroke-current stroke-2">
              <path d="M6 18L18 6M6 6l12 12" strokeLinecap="round" />
            </svg>
          </button>
        </div>

        {children}

        {/* Apply button at bottom of mobile drawer */}
        <button
          onClick={onClose}
          className="mt-8 w-full rounded-lg bg-[#ff6700] py-3 font-semibold text-white transition hover:bg-[#f05f00]"
        >
          Show Results
        </button>
      </div>
    </>
  );
}

export default memo(Sidebar);
