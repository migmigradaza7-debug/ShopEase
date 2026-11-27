"use client";

import React from "react";
import Link from "next/link";
import { motion, MotionConfig } from "motion/react";
import { ArrowRight } from "lucide-react";
import { ProductImage } from "./ProductImage";

const EASE_OUT_EXPO: [number, number, number, number] = [0.16, 1, 0.3, 1];

const COLLECTION_HIGHLIGHTS = [
  {
    category: "Footwear",
    title: "Footwear",
    subtitle: "Sneakers & knit trainers",
    image: "/images/product_classic_sneakers.jpg",
    href: "/shop?category=Footwear",
  },
  {
    category: "Audio",
    title: "Wireless Audio",
    subtitle: "Over-ear & pocket earbuds",
    image: "/images/product_wireless_headphones.jpg",
    href: "/shop?category=Audio",
  },
  {
    category: "Wearables",
    title: "Timepieces",
    subtitle: "Smart & minimalist analog",
    image: "/images/product_minimalist_analog_watch.jpg",
    href: "/shop?category=Wearables",
  },
  {
    category: "Carry",
    title: "Everyday Carry",
    subtitle: "Leather packs & duffel bags",
    image: "/images/product_canvas_duffel.jpg",
    href: "/shop?category=Carry",
  },
];

export function HomeLandingClient() {
  return (
    <MotionConfig reducedMotion="user">
      {/* Section 1: Pure Editorial Hero */}
      <section className="py-14 sm:py-20 lg:py-24 bg-stone-50 overflow-hidden">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-stretch">
          <motion.div
            initial={{ opacity: 0.92, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, ease: EASE_OUT_EXPO }}
            className="lg:col-span-6 flex flex-col justify-center space-y-6"
          >
            <p className="text-xs font-medium uppercase tracking-wider text-stone-500">
              2025 Everyday Collection
            </p>

            <h1 className="font-display text-4xl sm:text-5xl lg:text-[3.25rem] font-bold text-stone-900 tracking-tight leading-[1.08] text-balance">
              Discover the New Arrivals
            </h1>

            <p className="text-base sm:text-lg text-stone-600 max-w-lg leading-relaxed">
              Thoughtfully curated footwear, wireless audio, wearables, and
              everyday carry designed for lasting comfort and modern living.
            </p>

            <div className="flex flex-wrap items-center gap-4 pt-2">
              <Link
                href="/shop"
                className="inline-flex items-center gap-2 px-6 py-3 min-h-[44px] rounded-lg bg-orange-600 text-white text-sm font-semibold hover:bg-orange-700 transition-colors whitespace-nowrap shrink-0"
              >
                <span>Shop Collection</span>
                <ArrowRight className="w-4 h-4" aria-hidden="true" />
              </Link>
              <Link
                href="/about"
                className="inline-flex items-center px-5 py-3 min-h-[44px] rounded-lg border border-stone-300 bg-white text-stone-800 text-sm font-medium hover:bg-stone-100 transition-colors whitespace-nowrap shrink-0"
              >
                Our Story
              </Link>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0.92, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.06, ease: EASE_OUT_EXPO }}
            className="lg:col-span-6"
          >
            <div className="w-full h-full aspect-[4/3] sm:aspect-[16/9] lg:aspect-auto lg:min-h-[400px] rounded-2xl overflow-hidden bg-stone-200 border border-stone-200">
              <ProductImage
                src="/images/hero_lifestyle_collection.jpg"
                alt="ShopEase curated collection of sneakers, wireless headphones, smartwatch, and leather backpack"
                className="w-full h-full object-cover"
              />
            </div>
          </motion.div>
        </div>
      </section>

      {/* Section 2: Collection Highlights linking into dedicated /shop */}
      <section className="py-16 sm:py-20 bg-white border-t border-stone-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10">
            <div>
              <p className="text-xs font-medium uppercase tracking-wider text-stone-500">
                Explore by Department
              </p>
              <h2 className="mt-1.5 font-display text-2xl sm:text-3xl font-bold text-stone-900 tracking-tight">
                Four Pillars of Daily Carry
              </h2>
            </div>

            <Link
              href="/shop"
              className="inline-flex items-center gap-2 text-sm font-semibold text-orange-700 hover:text-orange-800 transition-colors whitespace-nowrap shrink-0"
            >
              <span>Browse All Products</span>
              <ArrowRight className="w-4 h-4" aria-hidden="true" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {COLLECTION_HIGHLIGHTS.map((item) => (
              <motion.div
                key={item.category}
                whileHover={{ y: -3 }}
                transition={{ duration: 0.18, ease: EASE_OUT_EXPO }}
              >
                <Link
                  href={item.href}
                  className="group block rounded-xl bg-stone-50 border border-stone-200 overflow-hidden transition-shadow duration-200 hover:shadow-md"
                >
                  <div className="aspect-[4/3] bg-stone-100 overflow-hidden">
                    <ProductImage
                      src={item.image}
                      alt={item.title}
                      className="w-full h-full object-cover transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.03]"
                    />
                  </div>
                  <div className="p-5 flex items-center justify-between gap-3">
                    <div>
                      <h3 className="font-display text-base font-semibold text-stone-900 group-hover:text-orange-700 transition-colors">
                        {item.title}
                      </h3>
                      <p className="mt-0.5 text-xs text-stone-600">
                        {item.subtitle}
                      </p>
                    </div>
                    <ArrowRight
                      className="w-4 h-4 text-stone-400 group-hover:text-orange-700 group-hover:translate-x-0.5 transition-all shrink-0"
                      aria-hidden="true"
                    />
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Section 3: Brand Craftsmanship & Dedicated Destinations */}
      <section className="py-16 sm:py-20 bg-stone-50 border-t border-stone-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 space-y-10">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div className="max-w-2xl">
              <p className="text-xs font-medium uppercase tracking-wider text-stone-500">
                Built on Simplicity
              </p>
              <h2 className="mt-2 font-display text-2xl sm:text-3xl font-bold text-stone-900 tracking-tight text-balance">
                Stylish, durable, and accessible goods for modern living.
              </h2>
            </div>

            <div className="flex flex-wrap items-center gap-3 shrink-0">
              <Link
                href="/about"
                className="px-4 py-2.5 min-h-[40px] inline-flex items-center rounded-lg border border-stone-300 bg-white text-sm font-medium text-stone-800 hover:bg-stone-100 transition-colors whitespace-nowrap"
              >
                About ShopEase
              </Link>
              <Link
                href="/contact"
                className="px-4 py-2.5 min-h-[40px] inline-flex items-center rounded-lg bg-stone-900 text-white text-sm font-medium hover:bg-stone-800 transition-colors whitespace-nowrap"
              >
                Get in Touch
              </Link>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 rounded-xl bg-white border border-stone-200">
              <p className="text-xs font-semibold text-stone-400">01.</p>
              <h3 className="mt-2 font-display text-base font-semibold text-stone-900">
                Carefully Curated
              </h3>
              <p className="mt-2 text-sm text-stone-600 leading-relaxed">
                Every product in our catalog is selected for dependable daily
                materials, tactile finishes, and lasting performance.
              </p>
            </div>

            <div className="p-6 rounded-xl bg-white border border-stone-200">
              <p className="text-xs font-semibold text-stone-400">02.</p>
              <h3 className="mt-2 font-display text-base font-semibold text-stone-900">
                Transparent Value
              </h3>
              <p className="mt-2 text-sm text-stone-600 leading-relaxed">
                Direct-to-customer pricing with straightforward shipping rates
                and free delivery on orders above $100.
              </p>
            </div>

            <div className="p-6 rounded-xl bg-white border border-stone-200">
              <p className="text-xs font-semibold text-stone-400">03.</p>
              <h3 className="mt-2 font-display text-base font-semibold text-stone-900">
                Dedicated Support
              </h3>
              <p className="mt-2 text-sm text-stone-600 leading-relaxed">
                Questions about sizing, specs, or an existing order? Reach our
                customer service team directly anytime.
              </p>
            </div>
          </div>
        </div>
      </section>
    </MotionConfig>
  );
}
