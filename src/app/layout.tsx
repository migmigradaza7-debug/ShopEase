import type { Metadata } from "next";
import { DM_Sans, Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import { ShopProvider } from "@/components/ShopProvider";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { CartDrawer } from "@/components/CartDrawer";

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["600", "700"],
  variable: "--font-plus-jakarta",
  display: "swap",
});

const dmSans = DM_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-dm-sans",
  display: "swap",
});

export const metadata: Metadata = {
  title: "ShopEase | Modern Everyday Essentials",
  description:
    "Curated everyday essentials storefront featuring footwear, wireless audio, wearables, and leather carry goods.",
  openGraph: {
    title: "ShopEase | Modern Everyday Essentials",
    description:
      "Curated everyday essentials storefront featuring footwear, wireless audio, wearables, and leather carry goods.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      data-scroll-behavior="smooth"
      className={`${plusJakarta.variable} ${dmSans.variable}`}
    >
      <body className="min-h-screen flex flex-col bg-stone-50 text-stone-900">
        <ShopProvider>
          <Header />
          <main className="flex-1">{children}</main>
          <Footer />
          <CartDrawer />
        </ShopProvider>
      </body>
    </html>
  );
}
