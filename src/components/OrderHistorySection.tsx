"use client";

import React from "react";
import Link from "next/link";
import { ArrowRight, PackageCheck } from "lucide-react";
import { formatPrice } from "@/lib/products";
import { useShop } from "./ShopProvider";
import { ProductImage } from "./ProductImage";

interface OrderHistorySectionProps {
  compactHeading?: boolean;
}

export function OrderHistorySection({
  compactHeading = false,
}: OrderHistorySectionProps) {
  const { orders, session } = useShop();

  if (!session) return null;

  return (
    <section
      id="member-order-history"
      className="py-14 sm:py-16 bg-stone-50 border-t border-stone-200"
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6 space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <p className="text-xs font-medium uppercase tracking-wider text-stone-500">
              Account Order History &middot;{" "}
              <span className="tabular-nums">{orders.length}</span>{" "}
              {orders.length === 1 ? "Order" : "Orders"}
            </p>
            {compactHeading ? (
              <h2 className="mt-1.5 font-display text-2xl sm:text-3xl font-bold text-stone-900 tracking-tight">
                Your Previous Orders
              </h2>
            ) : (
              <h1 className="mt-1.5 font-display text-3xl sm:text-4xl font-bold text-stone-900 tracking-tight">
                Your Order History
              </h1>
            )}
            <p className="mt-1.5 text-sm text-stone-600">
              Completed checkouts saved to{" "}
              <span className="font-medium text-stone-800">{session.email}</span>.
            </p>
          </div>

          <Link
            href="/shop"
            className="inline-flex items-center gap-2 text-sm font-semibold text-orange-700 hover:text-orange-800 transition-colors whitespace-nowrap shrink-0"
          >
            <span>Continue Shopping</span>
            <ArrowRight className="w-4 h-4" aria-hidden="true" />
          </Link>
        </div>

        {orders.length === 0 ? (
          <div className="p-10 rounded-2xl bg-white border border-stone-200 text-center space-y-4">
            <div className="w-12 h-12 rounded-full bg-stone-100 text-stone-500 flex items-center justify-center mx-auto">
              <PackageCheck className="w-6 h-6" aria-hidden="true" />
            </div>
            <div className="space-y-1">
              <p className="font-display text-lg font-semibold text-stone-900">
                No orders placed yet
              </p>
              <p className="text-sm text-stone-600 max-w-md mx-auto">
                When you check out items from your bag, every order receipt will
                be saved here for your account.
              </p>
            </div>
            <Link
              href="/shop"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-orange-600 text-white text-sm font-semibold hover:bg-orange-700 transition-colors"
            >
              <span>Browse Collection</span>
              <ArrowRight className="w-4 h-4" aria-hidden="true" />
            </Link>
          </div>
        ) : (
          <div className="space-y-5">
            {orders.map((order) => (
              <article
                key={order.id}
                className="rounded-2xl bg-white border border-stone-200 overflow-hidden"
              >
                <div className="px-6 py-4 bg-stone-50/70 border-b border-stone-200 flex flex-wrap items-center justify-between gap-4">
                  <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm">
                    <div>
                      <p className="text-xs uppercase tracking-wider text-stone-500">
                        Order
                      </p>
                      <p className="font-display font-semibold text-stone-900 tabular-nums">
                        {order.orderNumber}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs uppercase tracking-wider text-stone-500">
                        Date
                      </p>
                      <p className="font-medium text-stone-800">
                        {order.createdAt}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs uppercase tracking-wider text-stone-500">
                        Payment
                      </p>
                      <p className="font-medium text-stone-800">
                        {order.paymentMethod === "cod"
                          ? "Cash on Delivery"
                          : "Card Payment"}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs uppercase tracking-wider text-stone-500">
                        Status
                      </p>
                      <p className="font-semibold text-emerald-700">
                        {order.status}
                      </p>
                    </div>
                  </div>

                  <div className="text-right">
                    <p className="text-xs uppercase tracking-wider text-stone-500">
                      Total Paid
                    </p>
                    <p className="font-display text-base font-bold text-stone-900 tabular-nums">
                      {formatPrice(order.total)}
                    </p>
                  </div>
                </div>

                <div className="p-6 space-y-4">
                  <ul className="divide-y divide-stone-100">
                    {order.items.map((item) => (
                      <li
                        key={`${order.id}-${item.productId}-${item.option}`}
                        className="py-3 first:pt-0 last:pb-0 flex items-center justify-between gap-4"
                      >
                        <div className="flex items-center gap-4 min-w-0">
                          <Link
                            href={`/products/${item.slug}`}
                            className="w-14 h-14 rounded-lg overflow-hidden bg-stone-100 border border-stone-200 shrink-0"
                          >
                            <ProductImage
                              src={item.image}
                              alt={item.name}
                              className="w-full h-full object-cover"
                            />
                          </Link>
                          <div className="min-w-0">
                            <Link
                              href={`/products/${item.slug}`}
                              className="text-sm font-semibold text-stone-900 hover:text-orange-700 transition-colors truncate block"
                            >
                              {item.name}
                            </Link>
                            <p className="text-xs text-stone-500 mt-0.5">
                              {item.option} &middot; Qty{" "}
                              <span className="tabular-nums">
                                {item.quantity}
                              </span>
                            </p>
                          </div>
                        </div>
                        <p className="text-sm font-semibold text-stone-900 tabular-nums shrink-0">
                          {formatPrice(item.price * item.quantity)}
                        </p>
                      </li>
                    ))}
                  </ul>

                  <div className="pt-3 border-t border-stone-100 text-xs text-stone-600 flex flex-wrap gap-x-6 gap-y-1">
                    <span>Recipient: {order.customerName}</span>
                    <span>Delivery: {order.address}</span>
                    <span>Phone: {order.phone}</span>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
