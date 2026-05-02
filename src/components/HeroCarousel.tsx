"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  ArrowRight,
  BadgeIndianRupee,
  ChevronLeft,
  ChevronRight,
  Pause,
  ShieldCheck,
  Truck,
  Zap,
} from "lucide-react";

interface HeroSlide {
  title: string;
  eyebrow: string;
  description: string;
  cta: string;
  href: string;
  offer: string;
  image: string;
}

const slides: HeroSlide[] = [
  {
    eyebrow: "Mega grocery offer",
    title: "Premium dry fruits & nuts for festive gifting.",
    description:
      "Studio-fresh almonds, cashews, dates and healthy mixes with fast delivery.",
    cta: "Shop dry fruits",
    href: "/shop/products?cat=grocery",
    offer: "Up to 55% off",
    image:
      "https://images.unsplash.com/photo-1599599810769-bcde5a160d32?auto=format&fit=crop&w=1400&q=85",
  },
  {
    eyebrow: "Tech upgrade",
    title: "Smartphones, audio and wearables at sharp prices.",
    description:
      "Curated electronics deals with warranty, GST invoice and bank cashback.",
    cta: "Explore electronics",
    href: "/shop/products?cat=electronics",
    offer: "Up to 45% off",
    image:
      "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=1400&q=85",
  },
  {
    eyebrow: "Fashion for you",
    title: "Fresh Indian fashion drops for everyday style.",
    description:
      "Modern casual wear, workwear and occasion-ready looks in one place.",
    cta: "Shop fashion",
    href: "/shop/products?cat=men%27s%20clothing",
    offer: "Min. 30% off",
    image:
      "https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=1400&q=85",
  },
  {
    eyebrow: "Kitchen essentials",
    title: "Glass containers, cookware and storage upgrades.",
    description:
      "Premium kitchenware from emerging brands with trusted seller quality.",
    cta: "Shop kitchen",
    href: "/shop/products?cat=kitchen",
    offer: "Up to 60% off",
    image:
      "https://images.unsplash.com/photo-1556911220-bff31c812dba?auto=format&fit=crop&w=1400&q=85",
  },
  {
    eyebrow: "Home & living",
    title: "Cozy furniture and decor for modern homes.",
    description:
      "Soft lighting, clean furniture, useful decor and fast home delivery.",
    cta: "Upgrade home",
    href: "/shop/products?cat=home",
    offer: "Up to 40% off",
    image:
      "https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?auto=format&fit=crop&w=1400&q=85",
  },
];

const AUTO_SLIDE_MS = 4500;

export default function HeroCarousel() {
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);

  const goTo = useCallback((index: number) => {
    setActive((index + slides.length) % slides.length);
  }, []);

  const next = useCallback(() => {
    setActive((current) => (current + 1) % slides.length);
  }, []);

  const previous = useCallback(() => {
    setActive((current) => (current - 1 + slides.length) % slides.length);
  }, []);

  useEffect(() => {
    if (paused) return;
    const timer = window.setInterval(next, AUTO_SLIDE_MS);
    return () => window.clearInterval(timer);
  }, [next, paused]);

  const trustItems = useMemo(
    () => [
      { icon: Truck, label: "1-day delivery" },
      { icon: BadgeIndianRupee, label: "UPI cashback" },
      { icon: ShieldCheck, label: "Secure checkout" },
    ],
    []
  );

  return (
    <section
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      className="relative w-full max-w-full overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-md"
      aria-label="Featured shopping offers"
    >
      <motion.div
        className="flex w-full"
        animate={{ x: `-${active * 100}%` }}
        transition={{ type: "tween", ease: [0.22, 1, 0.36, 1], duration: 0.65 }}
      >
        {slides.map((slide, index) => (
          <article
            key={slide.title}
            className="relative min-h-[420px] w-full min-w-full overflow-hidden sm:min-h-[500px] lg:min-h-[540px]"
          >
            <Image
              src={slide.image}
              alt={slide.title}
              fill
              priority={index === 0}
              sizes="(max-width: 768px) 100vw, 1280px"
              className="object-cover"
            />
            <div className="absolute inset-0 bg-slate-950/55" />

            <div className="relative z-10 flex min-h-[420px] items-center px-4 py-10 sm:min-h-[500px] sm:px-8 lg:min-h-[540px] lg:px-10">
              <div className="w-full max-w-2xl text-white">
                <p className="inline-flex max-w-full items-center gap-2 rounded-full bg-[#ff6700] px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.16em] text-white shadow-lg shadow-orange-500/25 sm:px-4 sm:text-xs">
                  <Zap className="h-3.5 w-3.5 shrink-0 fill-white" />
                  <span className="truncate">{slide.eyebrow}</span>
                </p>
                <h1 className="mt-4 max-w-[14ch] text-3xl font-black leading-[1.02] tracking-tight sm:mt-5 sm:text-5xl lg:text-6xl">
                  {slide.title}
                </h1>
                <p className="mt-4 max-w-xl text-sm leading-6 text-slate-200 sm:mt-5 sm:text-lg sm:leading-7">
                  {slide.description}
                </p>

                <div className="mt-6 flex flex-wrap gap-3 sm:mt-7">
                  <Link
                    href={slide.href}
                    className="inline-flex min-h-11 items-center gap-2 rounded-2xl bg-[#ff6700] px-5 py-3 text-sm font-black text-white shadow-xl shadow-orange-500/25 transition hover:-translate-y-0.5 hover:bg-[#f05f00] active:scale-95 sm:px-6"
                  >
                    {slide.cta}
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                  <Link
                    href="/shop/products"
                    className="inline-flex min-h-11 items-center gap-2 rounded-2xl border border-white px-5 py-3 text-sm font-black text-white transition hover:-translate-y-0.5 hover:bg-white hover:text-slate-800 active:scale-95 sm:px-6"
                  >
                    Explore all
                  </Link>
                </div>

                <div className="mt-6 grid gap-2 text-xs font-bold text-slate-200 sm:mt-8 sm:grid-cols-3 sm:text-sm">
                  {trustItems.map(({ icon: Icon, label }) => (
                    <span key={label} className="inline-flex items-center gap-2">
                      <Icon className="h-4 w-4 shrink-0 text-[#ff6700]" />
                      {label}
                    </span>
                  ))}
                </div>
              </div>

              <div className="absolute bottom-5 right-5 hidden rounded-3xl border border-slate-200 bg-white p-4 shadow-md md:block">
                <p className="text-xs font-black uppercase tracking-wide text-[#cc0c39]">
                  Today only
                </p>
                <p className="mt-1 text-2xl font-black text-slate-950">
                  {slide.offer}
                </p>
                <p className="mt-1 text-sm font-semibold text-slate-600">
                  Bank offers + GST invoice
                </p>
              </div>
            </div>
          </article>
        ))}
      </motion.div>

      <button
        onClick={previous}
        className="absolute left-2 top-1/2 z-20 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-white bg-slate-950/40 text-white transition hover:scale-105 hover:bg-[#ff6700] active:scale-95 sm:left-4 sm:h-11 sm:w-11"
        aria-label="Previous offer"
      >
        <ChevronLeft className="h-5 w-5" />
      </button>
      <button
        onClick={next}
        className="absolute right-2 top-1/2 z-20 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-white bg-slate-950/40 text-white transition hover:scale-105 hover:bg-[#ff6700] active:scale-95 sm:right-4 sm:h-11 sm:w-11"
        aria-label="Next offer"
      >
        <ChevronRight className="h-5 w-5" />
      </button>

      <div className="absolute bottom-4 left-1/2 z-20 flex -translate-x-1/2 items-center gap-2 rounded-full border border-white bg-slate-950/55 px-3 py-2">
        {slides.map((slide, index) => (
          <button
            key={slide.title}
            onClick={() => goTo(index)}
            className={`h-2.5 rounded-full transition-all ${
              active === index ? "w-8 bg-[#ff6700]" : "w-2.5 bg-white/60"
            }`}
            aria-label={`Go to ${slide.eyebrow}`}
          />
        ))}
        {paused && <Pause className="ml-1 h-3.5 w-3.5 text-white/80" />}
      </div>
    </section>
  );
}
