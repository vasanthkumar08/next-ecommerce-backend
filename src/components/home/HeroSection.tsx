import Image from "next/image";
import Link from "next/link";
import { ArrowRight, BadgeIndianRupee, ShieldCheck, Truck, Zap } from "lucide-react";

const HERO_IMAGE =
  "https://images.unsplash.com/photo-1599599810769-bcde5a160d32?auto=format&fit=crop&w=1200&q=85";

const dealPills = [
  "Dry fruits & nuts",
  "Min. 40% off",
  "Bank cashback",
  "GST invoice",
] as const;

export default function HeroSection() {
  return (
    <section className="relative overflow-hidden rounded-[2rem] border border-white/70 bg-[#101827] shadow-[0_32px_100px_rgba(15,23,42,0.25)]">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(255,153,0,0.28),transparent_30rem),radial-gradient(circle_at_80%_10%,rgba(37,99,235,0.32),transparent_34rem)]" />
      <div className="relative grid min-h-[480px] items-center gap-8 p-5 md:grid-cols-[1.05fr_0.95fr] md:p-8 lg:p-10">
        <div className="max-w-2xl text-white">
          <div className="mb-5 flex flex-wrap gap-2">
            {dealPills.map((pill) => (
              <span
                key={pill}
                className="rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-black uppercase tracking-wide text-orange-50 backdrop-blur-xl"
              >
                {pill}
              </span>
            ))}
          </div>

          <p className="inline-flex items-center gap-2 rounded-full bg-[#ff9900] px-4 py-1.5 text-xs font-black uppercase tracking-[0.18em] text-slate-950 shadow-lg shadow-orange-500/25">
            <Zap className="h-3.5 w-3.5 fill-slate-950" />
            Mega grocery offer
          </p>
          <h1 className="mt-5 text-4xl font-black tracking-tight md:text-6xl">
            Premium dry fruits, nuts & pantry essentials.
          </h1>
          <p className="mt-5 max-w-xl text-base leading-7 text-slate-200 md:text-lg">
            High-trust Indian shopping experience with fast delivery, verified
            sellers, cashback offers, and clean checkout built for conversion.
          </p>

          <div className="mt-7 flex flex-wrap gap-3">
            <Link
              href="/shop/products?cat=grocery"
              className="inline-flex items-center gap-2 rounded-2xl bg-[#ff9900] px-6 py-3 font-black text-slate-950 shadow-xl shadow-orange-500/25 transition hover:-translate-y-0.5 hover:bg-[#f59e0b] active:scale-95"
            >
              Shop deals
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/shop/products"
              className="inline-flex items-center gap-2 rounded-2xl border border-white/25 bg-white/10 px-6 py-3 font-black text-white backdrop-blur-xl transition hover:-translate-y-0.5 hover:bg-white/20 active:scale-95"
            >
              Explore categories
            </Link>
          </div>

          <div className="mt-8 grid gap-3 text-sm font-bold text-slate-200 sm:grid-cols-3">
            <span className="inline-flex items-center gap-2">
              <Truck className="h-4 w-4 text-[#ff9900]" />
              1-day delivery
            </span>
            <span className="inline-flex items-center gap-2">
              <BadgeIndianRupee className="h-4 w-4 text-[#ff9900]" />
              UPI cashback
            </span>
            <span className="inline-flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-[#ff9900]" />
              Secure payments
            </span>
          </div>
        </div>

        <div className="relative">
          <div className="absolute -right-4 -top-4 z-10 rounded-3xl bg-[#cc0c39] px-5 py-4 text-white shadow-2xl shadow-red-500/30">
            <p className="text-xs font-bold uppercase tracking-wide">
              Limited offer
            </p>
            <p className="text-2xl font-black">Up to 55% off</p>
          </div>
          <div className="relative h-[360px] overflow-hidden rounded-[1.75rem] border border-white/20 bg-white/10 shadow-2xl backdrop-blur-xl md:h-[420px]">
            <Image
              src={HERO_IMAGE}
              alt="Premium dry fruits and nuts deal"
              fill
              priority
              sizes="(max-width: 768px) 92vw, 520px"
              className="object-cover"
            />
            <div className="absolute inset-x-4 bottom-4 rounded-3xl border border-white/30 bg-white/85 p-4 shadow-xl backdrop-blur-xl">
              <p className="text-xs font-black uppercase tracking-wide text-[#cc0c39]">
                Festive pantry bundle
              </p>
              <p className="mt-1 text-lg font-black text-slate-950">
                Almonds, cashews, dates & gourmet mixes
              </p>
              <p className="mt-1 text-sm font-semibold text-slate-600">
                Starting at ₹299 • Free delivery over ₹499
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
