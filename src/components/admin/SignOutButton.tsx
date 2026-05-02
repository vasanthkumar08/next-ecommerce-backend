"use client";

import { LogOut } from "lucide-react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { clearAuthSession } from "@/features/auth/authStorage";

export function SignOutButton() {
  const router = useRouter();

  return (
    <Button
      variant="ghost"
      className="w-full justify-start text-slate-600 hover:bg-[#F8FAFC] hover:text-[#2563EB]"
      onClick={() => {
        clearAuthSession();
        router.push("/login");
        router.refresh();
      }}
    >
      <LogOut className="h-4 w-4" />
      Logout
    </Button>
  );
}
