import React from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { ProductImage } from "@/components/ProductImage";

export const metadata: Metadata = {
  title: "About Us | ShopEase",
  description:
    "ShopEase was founded to make quality, durable, and stylish everyday goods accessible to everyone.",
};

export default function AboutPage() {
  return (
    <section className="py-14 sm:py-20 bg-stone-50">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 space-y-12">
        <div className="max-w-2xl space-y-5">
          <p className="text-xs font-medium uppercase tracking-wider text-stone-500">
            Our Story
          </p>
          <h1 className="font-display text-3xl sm:text-4xl font-bold text-stone-900 tracking-tight text-balance">
            About ShopEase
          </h1>
          <p className="text-base sm:text-lg text-stone-700 leading-relaxed">
            ShopEase was founded with one goal — to make quality products
            accessible to everyone. We believe in offering stylish, durable, and
            affordable goods for modern living. Our team carefully curates each
            item to ensure customer satisfaction and long-term value.
          </p>
          <p className="text-base text-stone-600 leading-relaxed">
            From footwear and accessories to electronics, our catalog is
            constantly expanding to meet evolving lifestyles. ShopEase is more
            than a store — it is a community built on trust, convenience, and
            simplicity.
          </p>
          <div className="pt-2 flex flex-wrap gap-3">
            <Link
              href="/shop"
              className="px-5 py-2.5 min-h-[40px] inline-flex items-center rounded-lg bg-orange-600 text-white text-sm font-semibold hover:bg-orange-700 transition-colors"
            >
              Explore Shop Collection
            </Link>
            <Link
              href="/contact"
              className="px-5 py-2.5 min-h-[40px] inline-flex items-center rounded-lg border border-stone-300 bg-white text-stone-800 text-sm font-medium hover:bg-stone-100 transition-colors"
            >
              Contact Support
            </Link>
          </div>
        </div>

        <div className="aspect-[16/9] rounded-2xl overflow-hidden bg-stone-200 border border-stone-200">
          <ProductImage
            src="/images/hero_lifestyle_collection.jpg"
            alt="Curated ShopEase everyday products"
            className="w-full h-full object-cover"
          />
        </div>
      </div>
    </section>
  );
}
