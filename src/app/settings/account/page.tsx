import Link from "next/link";
import { Save, User } from "lucide-react";

export default function AccountSettingsPage() {
  return (
    <main className="min-h-screen overflow-hidden bg-white">
      <div className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <section className="rounded-[2rem] border border-white/70 bg-white/90 p-5 shadow-[0_18px_60px_rgba(15,23,42,0.08)] md:p-6">
          <User className="h-7 w-7 text-[#ff6700]" />
          <h1 className="mt-4 text-2xl font-black text-slate-950">
            Account Info
          </h1>
          <p className="mt-2 text-sm font-semibold text-slate-500">
            Update your name, mobile and account contact details.
          </p>
          <div className="mt-6 grid gap-4 md:grid-cols-2">
            <input
              defaultValue="K. Vasanth"
              className="h-12 rounded-2xl border border-slate-200 px-4 text-sm outline-none focus:border-[#ff6700] focus:ring-2 focus:ring-orange-500/15"
            />
            <input
              defaultValue="+91 98765 43210"
              className="h-12 rounded-2xl border border-slate-200 px-4 text-sm outline-none focus:border-[#ff6700] focus:ring-2 focus:ring-orange-500/15"
            />
            <input
              defaultValue="vasanth@example.com"
              readOnly
              className="h-12 rounded-2xl border border-slate-200 bg-white px-4 text-sm text-slate-500 outline-none md:col-span-2"
            />
            <button className="inline-flex h-12 items-center justify-center gap-2 rounded-2xl bg-[#ff6700] px-5 text-sm font-black text-white shadow-lg shadow-orange-500/20 transition hover:-translate-y-0.5 hover:bg-[#f05f00] active:scale-95">
              <Save className="h-4 w-4" />
              Save Changes
            </button>
            <Link
              href="/settings"
              className="inline-flex h-12 items-center justify-center rounded-2xl border border-slate-200 px-5 text-sm font-black text-slate-700 transition hover:border-[#ff6700] hover:text-[#ff6700]"
            >
              Back to Settings
            </Link>
          </div>
        </section>
      </div>
    </main>
  );
}
