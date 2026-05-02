import Link from "next/link";
import {
  BadgeIndianRupee,
  AtSign,
  BriefcaseBusiness,
  CreditCard,
  MessageCircle,
  Share2,
  ShieldCheck,
  Truck,
} from "lucide-react";

const CURRENT_YEAR = 2026;

const columns = [
  {
    title: "Shop",
    links: [
      { label: "Products", href: "/shop/products" },
      { label: "Cart", href: "/shop/cart" },
      { label: "Orders", href: "/shop/orders" },
      { label: "Wishlist", href: "/shop/wishlist" },
    ],
  },
  {
    title: "Account",
    links: [
      { label: "Profile", href: "/profile" },
      { label: "Settings", href: "/settings" },
      { label: "Addresses", href: "/settings#addresses" },
      { label: "Security", href: "/settings#security" },
    ],
  },
  {
    title: "Support",
    links: [
      { label: "Help Center", href: "/settings" },
      { label: "Returns", href: "/settings" },
      { label: "Shipping", href: "/settings" },
      { label: "GST Invoice", href: "/settings" },
    ],
  },
] as const;

const trust = [
  { icon: Truck, label: "Fast delivery" },
  { icon: ShieldCheck, label: "Secure checkout" },
  { icon: BadgeIndianRupee, label: "UPI cashback" },
  { icon: CreditCard, label: "Cards & COD" },
] as const;

const socials = [
  { icon: MessageCircle, label: "Instagram", href: "https://instagram.com" },
  { icon: Share2, label: "Facebook", href: "https://facebook.com" },
  { icon: AtSign, label: "Twitter", href: "https://x.com" },
  { icon: BriefcaseBusiness, label: "LinkedIn", href: "https://linkedin.com" },
] as const;

export default function Footer() {
  return (
    <footer className="mt-16 hidden overflow-hidden bg-slate-950 text-slate-300 md:block">
      <div className="mx-auto grid w-full max-w-7xl gap-10 px-4 py-12 sm:px-6 lg:grid-cols-[1.1fr_1.5fr] lg:px-8">
        <div>
          <p className="text-2xl font-black tracking-tight text-white">
            vasanth<span className="text-[#ff6700]">trends</span>
          </p>
          <p className="mt-4 max-w-md text-sm leading-7 text-slate-400">
            Premium Indian shopping experience with fast delivery, secure
            payments, GST invoices, curated deals and responsive support.
          </p>

          <div className="mt-6 grid grid-cols-2 gap-3">
            {trust.map(({ icon: Icon, label }) => (
              <div
                key={label}
                className="rounded-2xl border border-white/10 bg-white/5 p-3 text-xs font-bold text-slate-200"
              >
                <Icon className="mb-2 h-4 w-4 text-[#ff6700]" />
                {label}
              </div>
            ))}
          </div>
        </div>

        <div className="grid gap-8 sm:grid-cols-3">
          {columns.map((column) => (
            <div key={column.title}>
              <h4 className="font-black text-white">{column.title}</h4>
              <ul className="mt-4 space-y-2.5 text-sm">
                {column.links.map(({ label, href }) => (
                  <li key={label}>
                    <Link
                      href={href}
                      className="transition hover:text-[#ff6700]"
                    >
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      <div className="border-t border-white/10">
        <div className="mx-auto flex w-full max-w-7xl flex-col gap-4 px-4 py-5 text-sm sm:px-6 md:flex-row md:items-center md:justify-between lg:px-8">
          <p className="text-slate-400">
            © {CURRENT_YEAR} vasanthtrends. Made with love in India.
          </p>
          <div className="flex gap-2">
            {socials.map(({ icon: Icon, label, href }) => (
              <Link
                key={label}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                className="flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-white/5 text-slate-300 transition hover:-translate-y-0.5 hover:border-[#ff6700] hover:text-[#ff6700]"
                aria-label={label}
              >
                <Icon className="h-4 w-4" />
              </Link>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
