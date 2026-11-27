"use client";

import React, { useState } from "react";
import { Search, X } from "lucide-react";
import { motion, MotionConfig } from "motion/react";
import {
  filterProducts,
  PRODUCT_CATEGORIES,
  ProductCategory,
  PRODUCTS,
} from "@/lib/products";
import { ProductCard } from "./ProductCard";

const EASE_OUT_EXPO: [number, number, number, number] = [0.16, 1, 0.3, 1];

interface ProductCatalogProps {
  initialCategory?: "All" | ProductCategory;
}

export function ProductCatalog({ initialCategory = "All" }: ProductCatalogProps) {
  const [selectedCategory, setSelectedCategory] = useState<"All" | ProductCategory>(
    initialCategory,
  );
  const [searchQuery, setSearchQuery] = useState("");

  const visibleProducts = filterProducts(PRODUCTS, selectedCategory, searchQuery);

  return (
    <MotionConfig reducedMotion="user">
      <section className="py-12 sm:py-16 bg-stone-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 space-y-8">
          <div className="space-y-6 pb-8 border-b border-stone-200">
            <div>
              <p className="text-xs font-medium uppercase tracking-wider text-stone-500">
                ShopEase Collection &middot;{" "}
                <span className="tabular-nums">{PRODUCTS.length} Items</span>
              </p>
              <h1 className="mt-2 font-display text-3xl sm:text-4xl font-bold text-stone-900 tracking-tight">
                Shop All Essentials
              </h1>
              <p className="mt-2 text-sm sm:text-base text-stone-600 max-w-xl">
                Browse curated footwear, wireless audio, wearables, and carry
                goods crafted for daily life.
              </p>
            </div>

            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              {/* Interactive category filter segmented control */}
              <div
                role="group"
                aria-label="Filter products by category"
                className="inline-flex flex-wrap items-center gap-1 p-1 bg-stone-200/70 rounded-lg border border-stone-200 shrink-0"
              >
                {PRODUCT_CATEGORIES.map((category) => {
                  const active = selectedCategory === category;
                  return (
                    <button
                      key={category}
                      type="button"
                      onClick={() => setSelectedCategory(category)}
                      aria-pressed={active}
                      className={`px-3.5 py-2 min-h-[36px] text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                        active
                          ? "bg-white text-stone-900 shadow-sm"
                          : "text-stone-600 hover:text-stone-900"
                      }`}
                    >
                      {category}
                    </button>
                  );
                })}
              </div>

              {/* Search Box */}
              <div className="relative w-full md:w-72">
                <Search
                  className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none"
                  aria-hidden="true"
                />
                <input
                  type="search"
                  aria-label="Search products"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search products..."
                  className="w-full pl-10 pr-9 py-2.5 min-h-[40px] rounded-lg border border-stone-300 bg-white text-sm text-stone-900 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-orange-600"
                />
                {searchQuery && (
                  <button
                    type="button"
                    aria-label="Clear search"
                    onClick={() => setSearchQuery("")}
                    className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-stone-400 hover:text-stone-700 cursor-pointer"
                  >
                    <X className="w-4 h-4" aria-hidden="true" />
                  </button>
                )}
              </div>
            </div>
          </div>

          {visibleProducts.length === 0 ? (
            <div className="py-16 text-center bg-white rounded-2xl border border-stone-200 space-y-4">
              <p className="font-display text-lg font-semibold text-stone-900">
                No matching products found
              </p>
              <p className="text-sm text-stone-600">
                Try clearing your search or switching back to all categories.
              </p>
              <button
                type="button"
                onClick={() => {
                  setSelectedCategory("All");
                  setSearchQuery("");
                }}
                className="px-5 py-2.5 rounded-lg bg-stone-900 text-white text-sm font-medium hover:bg-stone-800 transition-colors cursor-pointer"
              >
                Reset Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {visibleProducts.map((product) => (
                <motion.div
                  key={product.id}
                  initial={{ opacity: 0.94, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.25, ease: EASE_OUT_EXPO }}
                >
                  <ProductCard product={product} />
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </section>
    </MotionConfig>
  );
}
