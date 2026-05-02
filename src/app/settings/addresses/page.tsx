import Link from "next/link";
import { MapPin, Plus } from "lucide-react";

const addresses = ["Home", "Work"] as const;

export default function AddressSettingsPage() {
  return (
    <main className="min-h-screen overflow-hidden bg-white">
      <div className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <section className="rounded-[2rem] border border-white/70 bg-white/90 p-5 shadow-[0_18px_60px_rgba(15,23,42,0.08)] md:p-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <MapPin className="h-7 w-7 text-[#ff6700]" />
              <h1 className="mt-4 text-2xl font-black text-slate-950">
                Saved Addresses
              </h1>
              <p className="mt-2 text-sm font-semibold text-slate-500">
                Manage delivery and billing addresses.
              </p>
            </div>
            <button className="inline-flex items-center gap-2 rounded-2xl bg-[#ff6700] px-4 py-3 text-sm font-black text-white">
              <Plus className="h-4 w-4" />
              Add
            </button>
          </div>
          <div className="mt-6 grid gap-4 md:grid-cols-2">
            {addresses.map((label) => (
              <div
                key={label}
                className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"
              >
                <p className="font-black text-slate-950">{label}</p>
                <p className="mt-2 text-sm leading-6 text-slate-600">
                  12, Anna Nagar Main Road, Chennai, Tamil Nadu - 600040
                </p>
              </div>
            ))}
          </div>
          <Link
            href="/settings"
            className="mt-6 inline-flex rounded-2xl border border-slate-200 px-5 py-3 text-sm font-black text-slate-700 transition hover:border-[#ff6700] hover:text-[#ff6700]"
          >
            Back to Settings
          </Link>
        </section>
      </div>
    </main>
  );
}
