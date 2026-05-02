"use client";

import { Button } from "@/components/ui/Button";

export default function AdminError({
  error,
  reset,
}: {
  error: Error;
  reset: () => void;
}) {
  return (
    <div className="rounded-lg border border-[#fecaca] bg-[#fef2f2] p-6 text-[#991b1b]">
      <h2 className="font-semibold">Admin page failed to load</h2>
      <p className="mt-2 text-sm">{error.message}</p>
      <Button className="mt-4" variant="destructive" onClick={reset}>
        Try again
      </Button>
    </div>
  );
}
