import { AppProviders } from "@/components/providers/AppProviders";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
});

export const metadata = {
  title: "vasanthtrends — Shop Smarter",
  description: "Premium e-commerce experience",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.className} min-h-screen bg-white text-slate-700 antialiased`}>
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  );
}
