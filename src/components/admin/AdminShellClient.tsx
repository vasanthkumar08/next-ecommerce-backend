"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronDown, Menu, Search, Shield, UserCircle } from "lucide-react";
import { useState } from "react";
import { hasRole } from "@/lib/rbac";
import { workspaceNavigation } from "@/lib/admin/navigation";
import type { Role } from "@/types/rbac";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { SignOutButton } from "@/components/admin/SignOutButton";

interface AdminShellClientProps {
  children: React.ReactNode;
  user: {
    name?: string | null;
    email?: string | null;
    role: Role;
  };
}

function SidebarContent({
  role,
  onNavigate,
}: {
  role: Role;
  onNavigate?: () => void;
}) {
  const pathname = usePathname();
  const items = workspaceNavigation.filter((item) =>
    hasRole(role, item.allowedRoles)
  );

  return (
    <div className="flex h-full flex-col bg-white text-slate-950">
      <div className="flex h-20 items-center gap-3 border-b border-slate-200 px-6">
        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#2563EB] text-white shadow-sm">
          <Shield className="h-5 w-5" />
        </div>
        <div>
          <p className="text-base font-bold tracking-tight">Commerce Admin</p>
          <p className="text-xs font-medium text-slate-500">Admin workspace</p>
        </div>
      </div>

      <nav className="flex-1 space-y-1 p-4">
        {items.map((item) => {
          const active = pathname === item.href;

          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onNavigate}
              className={[
                "group flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-semibold transition duration-200 active:scale-[0.99]",
                active
                  ? "bg-[#2563EB] text-white shadow-sm"
                  : "text-slate-600 hover:bg-[#F8FAFC] hover:text-[#2563EB]",
              ].join(" ")}
            >
              <item.icon className="h-4 w-4" />
              {item.title}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}

export function AdminShellClient({ children, user }: AdminShellClientProps) {
  const [open, setOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-950">
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-72 border-r border-slate-200 bg-white lg:block">
        <SidebarContent role={user.role} />
      </aside>

      <div className="lg:pl-72">
        <header className="sticky top-0 z-20 flex min-h-16 items-center justify-between gap-4 border-b border-slate-200 bg-white/95 px-4 backdrop-blur md:px-6">
          <div className="flex min-w-0 flex-1 items-center gap-3">
            <Dialog open={open} onOpenChange={setOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" size="icon" className="lg:hidden">
                  <Menu className="h-5 w-5" />
                </Button>
              </DialogTrigger>
              <DialogContent className="left-0 top-0 h-screen w-80 max-w-[85vw] translate-x-0 translate-y-0 rounded-none border-slate-200 bg-white p-0">
                <DialogTitle className="sr-only">Navigation</DialogTitle>
                <SidebarContent role={user.role} onNavigate={() => setOpen(false)} />
              </DialogContent>
            </Dialog>

            <div className="min-w-0">
              <p className="truncate text-sm font-bold text-slate-950">
                Admin dashboard
              </p>
              <p className="truncate text-xs text-slate-500">{user.email}</p>
            </div>

            <div className="relative ml-2 hidden w-full max-w-md md:block">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                type="search"
                placeholder="Search dashboard"
                className="h-10 w-full rounded-lg border border-slate-200 bg-white pl-10 pr-3 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-[#2563EB] focus:ring-2 focus:ring-[#2563EB]/20"
              />
            </div>
          </div>

          <div className="relative">
            <button
              type="button"
              onClick={() => setProfileOpen((value) => !value)}
              className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-2 py-2 text-left shadow-sm transition hover:border-[#2563EB] active:scale-[0.98] sm:px-3"
            >
              <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#38BDF8] text-white">
                <UserCircle className="h-5 w-5" />
              </span>
              <span className="hidden min-w-0 sm:block">
                <span className="block max-w-36 truncate text-sm font-semibold text-slate-950">
                  {user.name}
                </span>
                <span className="block text-xs capitalize text-slate-500">
                  {user.role}
                </span>
              </span>
              <ChevronDown className="h-4 w-4 text-slate-400" />
            </button>

            {profileOpen ? (
              <div className="absolute right-0 mt-2 w-72 rounded-2xl border border-slate-200 bg-white p-4 shadow-xl shadow-slate-200/70">
                <div className="flex items-center gap-3 border-b border-slate-200 pb-4">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#2563EB]">
                    <UserCircle className="h-6 w-6 text-white" />
                  </div>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-slate-950">
                      {user.name}
                    </p>
                    <p className="truncate text-xs text-slate-500">
                      {user.email}
                    </p>
                  </div>
                </div>
                <div className="py-3">
                  <Badge className="capitalize" variant="blue">
                    {user.role}
                  </Badge>
                </div>
                <SignOutButton />
              </div>
            ) : null}
          </div>
        </header>
        <main className="min-w-0 p-4 md:p-6">{children}</main>
      </div>
    </div>
  );
}
