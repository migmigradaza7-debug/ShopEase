"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion, MotionConfig } from "motion/react";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  ShoppingBag,
  Truck,
  UserCheck,
} from "lucide-react";
import { formatPrice, PRODUCTS, TRENDING_PRODUCTS } from "@/lib/products";
import { useShop } from "./ShopProvider";
import { ProductImage } from "./ProductImage";
import { ProductCard } from "./ProductCard";

const EASE_OUT_EXPO: [number, number, number, number] = [0.16, 1, 0.3, 1];

const SPOTLIGHT_PRODUCTS = TRENDING_PRODUCTS;
const RECENT_RELEASES = PRODUCTS.slice(4);

const staggerContainer = {
  hidden: { opacity: 0.95 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.04,
    },
  },
};

const fadeUpItem = {
  hidden: { opacity: 0.92, y: 14 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.45, ease: EASE_OUT_EXPO },
  },
};

export function WelcomeLandingClient() {
  const { session, authReady, summary, addToCart, openCart, logoutAccount } =
    useShop();
  const [spotlightIndex, setSpotlightIndex] = useState(0);
  const [direction, setDirection] = useState(1);
  const [addedSlug, setAddedSlug] = useState<string | null>(null);

  const spotlightProduct = SPOTLIGHT_PRODUCTS[spotlightIndex] || PRODUCTS[0];

  useEffect(() => {
    if (!session) return;
    const timer = window.setInterval(() => {
      setDirection(1);
      setSpotlightIndex((prev) => (prev + 1) % SPOTLIGHT_PRODUCTS.length);
    }, 5500);
    return () => window.clearInterval(timer);
  }, [session]);

  const handleStepSpotlight = (delta: number) => {
    setDirection(delta);
    setSpotlightIndex(
      (prev) =>
        (prev + delta + SPOTLIGHT_PRODUCTS.length) % SPOTLIGHT_PRODUCTS.length,
    );
  };

  const handleSelectSpotlight = (nextIndex: number) => {
    setDirection(nextIndex >= spotlightIndex ? 1 : -1);
    setSpotlightIndex(nextIndex);
  };

  const handleQuickAddSpotlight = () => {
    addToCart(spotlightProduct, spotlightProduct.options[0], 1);
    setAddedSlug(spotlightProduct.slug);
    window.setTimeout(() => setAddedSlug(null), 1600);
  };

  if (!session && !authReady) {
    return (
      <section className="py-16 sm:py-24 bg-stone-50">
        <div className="max-w-md mx-auto px-4">
          <div className="p-8 rounded-2xl bg-white border border-stone-200 text-center space-y-3">
            <p className="text-xs font-medium uppercase tracking-wider text-stone-500">
              Member Access
            </p>
            <h1 className="font-display text-xl font-bold text-stone-900">
              Checking your session...
            </h1>
            <p className="text-sm text-stone-600">
              Syncing your ShopEase account details.
            </p>
          </div>
        </div>
      </section>
    );
  }

  if (!session) {
    return (
      <MotionConfig reducedMotion="user">
        <section className="py-16 sm:py-24 bg-stone-50">
          <motion.div
            initial={{ opacity: 0.92, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, ease: EASE_OUT_EXPO }}
            className="max-w-md mx-auto px-4"
          >
            <div className="p-8 rounded-2xl bg-white border border-stone-200 text-center space-y-5">
              <p className="text-xs font-medium uppercase tracking-wider text-stone-500">
                Member Access
              </p>
              <h1 className="font-display text-2xl font-bold text-stone-900">
                Sign in to view your welcome page
              </h1>
              <p className="text-sm text-stone-600 leading-relaxed">
                Log in with your ShopEase account to unlock your personalized
                new-arrivals showcase and synced shopping bag.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 pt-2">
                <Link
                  href="/login"
                  className="flex-1 py-2.5 px-4 rounded-lg bg-orange-600 text-white text-sm font-semibold hover:bg-orange-700 transition-colors"
                >
                  Login
                </Link>
                <Link
                  href="/signup"
                  className="flex-1 py-2.5 px-4 rounded-lg border border-stone-300 text-sm font-medium text-stone-800 hover:bg-stone-100 transition-colors"
                >
                  Create Account
                </Link>
              </div>
            </div>
          </motion.div>
        </section>
      </MotionConfig>
    );
  }

  const firstName = session.fullName.split(" ")[0] || session.fullName;

  return (
    <MotionConfig reducedMotion="user">
      <div className="bg-stone-50">
        {/* Animated Post-Login Hero */}
        <section className="py-12 sm:py-16 lg:py-20 border-b border-stone-200 overflow-hidden">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-stretch">
            <motion.div
              variants={staggerContainer}
              initial="hidden"
              animate="visible"
              className="lg:col-span-6 flex flex-col justify-center space-y-6"
            >
              <motion.p
                variants={fadeUpItem}
                className="text-xs font-medium uppercase tracking-wider text-orange-700"
              >
                Member Welcome &middot; {session.email}
              </motion.p>

              <motion.h1
                variants={fadeUpItem}
                className="font-display text-4xl sm:text-5xl font-bold text-stone-900 tracking-tight leading-[1.08] text-balance"
              >
                Welcome back, {firstName}.
              </motion.h1>

              <motion.p
                variants={fadeUpItem}
                className="text-base sm:text-lg text-stone-600 max-w-lg leading-relaxed"
              >
                Eight fresh and trending essentials have joined our collection.
                Explore suede Chelsea boots, portable 360-degree audio,
                polarized eyewear, and everyday carry crafted for daily wear.
              </motion.p>

              <motion.div
                variants={fadeUpItem}
                className="flex flex-wrap items-center gap-3 pt-2"
              >
                <a
                  href="#member-new-arrivals"
                  className="inline-flex items-center gap-2 px-6 py-3 min-h-[44px] rounded-lg bg-orange-600 text-white text-sm font-semibold hover:bg-orange-700 transition-colors whitespace-nowrap shrink-0"
                >
                  <span>Explore Trending</span>
                  <ArrowRight className="w-4 h-4" aria-hidden="true" />
                </a>

                <Link
                  href="/shop"
                  className="inline-flex items-center px-5 py-3 min-h-[44px] rounded-lg border border-stone-300 bg-white text-stone-800 text-sm font-medium hover:bg-stone-100 transition-colors whitespace-nowrap shrink-0"
                >
                  Full Catalog ({PRODUCTS.length})
                </Link>

                <button
                  type="button"
                  onClick={logoutAccount}
                  className="px-4 py-3 min-h-[44px] text-sm font-medium text-stone-600 hover:text-stone-900 underline underline-offset-4 cursor-pointer whitespace-nowrap shrink-0"
                >
                  Sign Out
                </button>
              </motion.div>
            </motion.div>

            {/* Interactive Animated Spotlight Card */}
            <motion.div
              initial={{ opacity: 0.92, y: 14, scale: 0.99 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.08, ease: EASE_OUT_EXPO }}
              className="lg:col-span-6"
            >
              <div className="h-full rounded-2xl bg-white border border-stone-200 p-5 sm:p-6 flex flex-col justify-between gap-5">
                <div className="flex items-center justify-between gap-4">
                  <p className="text-xs font-semibold uppercase tracking-wider text-stone-500">
                    Trending Spotlight &middot;{" "}
                    <span className="tabular-nums text-stone-900">
                      0{spotlightIndex + 1} / 0{SPOTLIGHT_PRODUCTS.length}
                    </span>
                  </p>
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => handleStepSpotlight(-1)}
                      aria-label="Previous spotlight product"
                      className="w-9 h-9 inline-flex items-center justify-center rounded-lg border border-stone-200 text-stone-700 hover:bg-stone-100 transition-colors cursor-pointer"
                    >
                      <ArrowLeft className="w-4 h-4" aria-hidden="true" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleStepSpotlight(1)}
                      aria-label="Next spotlight product"
                      className="w-9 h-9 inline-flex items-center justify-center rounded-lg border border-stone-200 text-stone-700 hover:bg-stone-100 transition-colors cursor-pointer"
                    >
                      <ArrowRight className="w-4 h-4" aria-hidden="true" />
                    </button>
                  </div>
                </div>

                <div className="relative overflow-hidden rounded-xl bg-stone-100 border border-stone-200 aspect-[4/3]">
                  <AnimatePresence initial={false}>
                    <motion.div
                      key={spotlightProduct.id}
                      initial={{ opacity: 0, x: direction * 28 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: direction * -28 }}
                      transition={{ duration: 0.35, ease: EASE_OUT_EXPO }}
                      className="absolute inset-0 w-full h-full"
                    >
                      <Link
                        href={`/products/${spotlightProduct.slug}`}
                        className="block w-full h-full"
                      >
                        <ProductImage
                          src={spotlightProduct.image}
                          alt={spotlightProduct.name}
                          className="w-full h-full object-cover"
                        />
                      </Link>
                    </motion.div>
                  </AnimatePresence>
                </div>

                <AnimatePresence mode="wait" initial={false}>
                  <motion.div
                    key={`${spotlightProduct.id}-meta`}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -6 }}
                    transition={{ duration: 0.22, ease: EASE_OUT_EXPO }}
                    className="flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                  >
                    <div>
                      <p className="text-xs uppercase tracking-wider text-stone-500 font-medium">
                        {spotlightProduct.category} &middot;{" "}
                        {spotlightProduct.availability}
                      </p>
                      <h2 className="mt-1 font-display text-xl font-bold text-stone-900">
                        <Link
                          href={`/products/${spotlightProduct.slug}`}
                          className="hover:text-orange-700 transition-colors"
                        >
                          {spotlightProduct.name}
                        </Link>
                      </h2>
                      <p className="text-sm font-semibold text-orange-700 tabular-nums mt-0.5">
                        {formatPrice(spotlightProduct.price)}
                      </p>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        type="button"
                        onClick={handleQuickAddSpotlight}
                        className="px-4 py-2.5 min-h-[40px] rounded-lg bg-stone-900 text-white text-xs font-semibold hover:bg-stone-800 transition-colors inline-flex items-center gap-1.5 whitespace-nowrap cursor-pointer"
                      >
                        {addedSlug === spotlightProduct.slug ? (
                          <>
                            <Check className="w-3.5 h-3.5" aria-hidden="true" />
                            <span>Added</span>
                          </>
                        ) : (
                          <span>Quick Add</span>
                        )}
                      </button>
                      <Link
                        href={`/products/${spotlightProduct.slug}`}
                        className="px-4 py-2.5 min-h-[40px] inline-flex items-center rounded-lg border border-stone-300 text-xs font-medium text-stone-800 hover:bg-stone-100 transition-colors whitespace-nowrap"
                      >
                        View Details
                      </Link>
                    </div>
                  </motion.div>
                </AnimatePresence>

                {/* Spotlight item selector tabs */}
                <div
                  role="tablist"
                  aria-label="Spotlight trending products"
                  className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t border-stone-100"
                >
                  {SPOTLIGHT_PRODUCTS.map((item, idx) => {
                    const active = idx === spotlightIndex;
                    const shortLabel =
                      item.slug === "suede-chelsea-boots"
                        ? "Chelsea Boots"
                        : item.slug === "portable-bluetooth-speaker"
                          ? "Speaker"
                          : item.slug === "polarized-acetate-sunglasses"
                            ? "Sunglasses"
                            : "Sling Bag";
                    return (
                      <button
                        key={item.id}
                        type="button"
                        role="tab"
                        aria-selected={active}
                        aria-label={item.name}
                        onClick={() => handleSelectSpotlight(idx)}
                        className={`py-2 px-2.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors cursor-pointer ${
                          active
                            ? "bg-stone-900 text-white"
                            : "bg-stone-100 text-stone-600 hover:text-stone-900"
                        }`}
                      >
                        {shortLabel}
                      </button>
                    );
                  })}
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Member Snapshot Strip */}
        <section className="py-12 bg-white border-b border-stone-200">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 grid grid-cols-1 md:grid-cols-3 gap-6">
            <motion.div
              whileHover={{ y: -2 }}
              transition={{ duration: 0.18, ease: EASE_OUT_EXPO }}
              className="p-6 rounded-xl bg-stone-50 border border-stone-200 flex items-start gap-4"
            >
              <UserCheck
                className="w-5 h-5 text-orange-700 shrink-0 mt-0.5"
                aria-hidden="true"
              />
              <div>
                <p className="text-xs font-medium uppercase tracking-wider text-stone-500">
                  {session.provider === "firebase"
                    ? "Firebase Google Auth"
                    : "Signed In Account"}
                </p>
                <p className="mt-1 font-display text-base font-semibold text-stone-900">
                  {session.fullName}
                </p>
                <p className="mt-1 text-sm text-stone-600">{session.email}</p>
              </div>
            </motion.div>

            <motion.div
              whileHover={{ y: -2 }}
              transition={{ duration: 0.18, ease: EASE_OUT_EXPO }}
              className="p-6 rounded-xl bg-stone-50 border border-stone-200 flex items-start gap-4"
            >
              <ShoppingBag
                className="w-5 h-5 text-orange-700 shrink-0 mt-0.5"
                aria-hidden="true"
              />
              <div className="flex-1">
                <p className="text-xs font-medium uppercase tracking-wider text-stone-500">
                  Shopping Bag
                </p>
                <p className="mt-1 font-display text-base font-semibold text-stone-900 tabular-nums">
                  {summary.itemCount}{" "}
                  {summary.itemCount === 1 ? "item" : "items"} &middot;{" "}
                  {formatPrice(summary.subtotal)}
                </p>
                <button
                  type="button"
                  onClick={openCart}
                  className="mt-1.5 text-sm font-medium text-orange-700 hover:underline cursor-pointer"
                >
                  Review bag &amp; checkout
                </button>
              </div>
            </motion.div>

            <motion.div
              whileHover={{ y: -2 }}
              transition={{ duration: 0.18, ease: EASE_OUT_EXPO }}
              className="p-6 rounded-xl bg-stone-50 border border-stone-200 flex items-start gap-4"
            >
              <Truck
                className="w-5 h-5 text-orange-700 shrink-0 mt-0.5"
                aria-hidden="true"
              />
              <div>
                <p className="text-xs font-medium uppercase tracking-wider text-stone-500">
                  Delivery Threshold
                </p>
                <p className="mt-1 font-display text-base font-semibold text-stone-900">
                  {summary.freeShippingRemaining === 0 && summary.itemCount > 0
                    ? "Free shipping unlocked"
                    : "Free shipping over $100.00"}
                </p>
                <p className="mt-1 text-sm text-stone-600">
                  {summary.itemCount > 0 && summary.freeShippingRemaining > 0
                    ? `Add ${formatPrice(summary.freeShippingRemaining)} more to qualify.`
                    : "Cash on delivery and card checkout supported."}
                </p>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Trending & New Arrivals Grid */}
        <section id="member-new-arrivals" className="py-16 sm:py-20 bg-white">
          <div className="max-w-6xl mx-auto px-4 sm:px-6">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10">
              <div>
                <p className="text-xs font-medium uppercase tracking-wider text-stone-500">
                  Trending &amp; Just Added
                </p>
                <h2 className="mt-1.5 font-display text-2xl sm:text-3xl font-bold text-stone-900 tracking-tight">
                  Trending &amp; Latest Releases
                </h2>
              </div>

              <div className="flex items-center gap-5 shrink-0">
                <Link
                  href="/shop?category=Trending"
                  className="inline-flex items-center gap-1.5 text-sm font-semibold text-stone-800 hover:text-orange-700 transition-colors whitespace-nowrap"
                >
                  <span>Trending Only</span>
                  <ArrowRight className="w-4 h-4" aria-hidden="true" />
                </Link>
                <Link
                  href="/shop"
                  className="inline-flex items-center gap-2 text-sm font-semibold text-orange-700 hover:text-orange-800 transition-colors whitespace-nowrap"
                >
                  <span>View all {PRODUCTS.length} products</span>
                  <ArrowRight className="w-4 h-4" aria-hidden="true" />
                </Link>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {RECENT_RELEASES.map((product) => (
                <div key={product.id}>
                  <ProductCard product={product} />
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>
    </MotionConfig>
  );
}
