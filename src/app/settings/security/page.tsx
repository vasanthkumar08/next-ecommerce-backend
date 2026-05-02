import Link from "next/link";
import { KeyRound, MonitorSmartphone, ShieldCheck } from "lucide-react";

const securityItems = [
  {
    icon: MonitorSmartphone,
    title: "Active sessions",
    body: "This device • Chrome on Windows • Active now",
  },
  {
    icon: KeyRound,
    title: "Password reset",
    body: "Send a secure password reset link to your email.",
  },
  {
    icon: ShieldCheck,
    title: "Secure checkout",
    body: "Razorpay and COD payment checks are enabled.",
  },
] as const;

export default function SecuritySettingsPage() {
  return (
    <main className="min-h-screen overflow-hidden bg-white">
      <div className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <section className="rounded-[2rem] border border-white/70 bg-white/90 p-5 shadow-[0_18px_60px_rgba(15,23,42,0.08)] md:p-6">
          <ShieldCheck className="h-7 w-7 text-[#ff6700]" />
          <h1 className="mt-4 text-2xl font-black text-slate-950">
            Privacy & Security
          </h1>
          <div className="mt-6 grid gap-4 md:grid-cols-3">
            {securityItems.map(({ icon: Icon, title, body }) => (
              <div
                key={title}
                className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"
              >
                <Icon className="h-5 w-5 text-[#ff6700]" />
                <p className="mt-3 font-black text-slate-950">{title}</p>
                <p className="mt-1 text-sm leading-6 text-slate-600">
                  {body}
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
