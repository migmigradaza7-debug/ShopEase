"use client";

import React from "react";
import Link from "next/link";
import { useShop } from "@/components/ShopProvider";
import { OrderHistorySection } from "@/components/OrderHistorySection";

export default function OrdersPage() {
  const { session, authReady } = useShop();

  if (!session && !authReady) {
    return (
      <section className="py-16 sm:py-24 bg-stone-50">
        <div className="max-w-md mx-auto px-4">
          <div className="p-8 rounded-2xl bg-white border border-stone-200 text-center space-y-3">
            <p className="text-xs font-medium uppercase tracking-wider text-stone-500">
              Account Orders
            </p>
            <h1 className="font-display text-xl font-bold text-stone-900">
              Checking your session...
            </h1>
            <p className="text-sm text-stone-600">
              Loading your ShopEase order history.
            </p>
          </div>
        </div>
      </section>
    );
  }

  if (!session) {
    return (
      <section className="py-16 sm:py-24 bg-stone-50">
        <div className="max-w-md mx-auto px-4">
          <div className="p-8 rounded-2xl bg-white border border-stone-200 text-center space-y-5">
            <p className="text-xs font-medium uppercase tracking-wider text-stone-500">
              Account Access
            </p>
            <h1 className="font-display text-2xl font-bold text-stone-900">
              Sign in to view your orders
            </h1>
            <p className="text-sm text-stone-600 leading-relaxed">
              Log in to your ShopEase account to view your saved shopping bag
              and completed order history across sessions.
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
        </div>
      </section>
    );
  }

  return <OrderHistorySection />;
}
