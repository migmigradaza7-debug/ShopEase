"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { CheckCircle2, Minus, Plus, ShoppingBag, Trash2, X } from "lucide-react";
import { OrderReceipt, useShop } from "./ShopProvider";
import { FREE_SHIPPING_THRESHOLD } from "@/lib/cart";
import { formatPrice } from "@/lib/products";
import { ProductImage } from "./ProductImage";

export function CartDrawer() {
  const {
    cart,
    summary,
    isCartOpen,
    closeCart,
    updateQuantity,
    removeFromCart,
    placeOrder,
    session,
  } = useShop();

  const [showCheckout, setShowCheckout] = useState(false);
  const [customerName, setCustomerName] = useState("");
  const [address, setAddress] = useState("");
  const [phone, setPhone] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<"cod" | "card">("cod");
  const [checkoutError, setCheckoutError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [receipt, setReceipt] = useState<OrderReceipt | null>(null);

  useEffect(() => {
    if (!isCartOpen) return;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        closeCart();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isCartOpen, closeCart]);

  if (!isCartOpen) return null;

  const handleOpenCheckout = () => {
    setReceipt(null);
    setCheckoutError("");
    if (session?.fullName && !customerName) {
      setCustomerName(session.fullName);
    }
    setShowCheckout(true);
  };

  const handleSubmitOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!session) {
      setCheckoutError("Please sign in to save this order to your account.");
      return;
    }
    if (!customerName.trim() || !address.trim() || !phone.trim()) {
      setCheckoutError("Please fill in your name, delivery address, and phone number.");
      return;
    }
    if (phone.trim().length < 7) {
      setCheckoutError("Please enter a valid contact phone number.");
      return;
    }
    setCheckoutError("");
    setIsSubmitting(true);
    try {
      const confirmed = await placeOrder({
        customerName,
        address,
        phone,
        paymentMethod,
      });
      setReceipt(confirmed);
      setShowCheckout(false);
      setAddress("");
      setPhone("");
    } catch (err) {
      setCheckoutError(
        err instanceof Error
          ? err.message
          : "Unable to place order right now. Please try again.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setShowCheckout(false);
    setCheckoutError("");
    setReceipt(null);
    closeCart();
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      {/* Backdrop */}
      <button
        type="button"
        aria-label="Close shopping bag backdrop"
        onClick={handleClose}
        className="fixed inset-0 bg-stone-950/45 backdrop-blur-[1px] cursor-pointer"
      />

      {/* Slide-over Panel */}
      <aside
        role="dialog"
        aria-modal="true"
        aria-label="Shopping Bag"
        className="relative z-10 w-full max-w-md bg-white h-full flex flex-col border-l border-stone-200 shadow-xl"
      >
        <div className="px-6 py-4 border-b border-stone-200 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <ShoppingBag className="w-5 h-5 text-stone-800" aria-hidden="true" />
            <h2 className="font-display text-lg font-semibold text-stone-900">
              Your Bag{" "}
              <span className="text-sm font-normal text-stone-500 tabular-nums">
                ({summary.itemCount})
              </span>
            </h2>
          </div>
          <button
            type="button"
            onClick={handleClose}
            aria-label="Close shopping bag"
            className="w-10 h-10 inline-flex items-center justify-center rounded-lg text-stone-600 hover:text-stone-900 hover:bg-stone-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" aria-hidden="true" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-6 py-5">
          {receipt ? (
            <div className="space-y-5 py-4">
              <div className="flex items-start gap-3 p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-950">
                <CheckCircle2
                  className="w-5 h-5 text-emerald-700 shrink-0 mt-0.5"
                  aria-hidden="true"
                />
                <div>
                  <p className="font-display font-semibold text-sm">
                    Order {receipt.orderNumber} Confirmed — Preparing Shipment
                  </p>
                  <p className="text-xs text-emerald-800 mt-1">
                    Placed on {receipt.createdAt} for {receipt.customerName}.
                  </p>
                </div>
              </div>

              <div className="border border-stone-200 rounded-xl p-4 space-y-3 text-sm">
                <p className="font-semibold text-stone-900">Order Summary</p>
                <ul className="divide-y divide-stone-100">
                  {receipt.items.map((item) => (
                    <li
                      key={`${item.productId}-${item.option}`}
                      className="py-2 flex items-center justify-between gap-3"
                    >
                      <span className="text-stone-700">
                        {item.name} ({item.option}) &times; {item.quantity}
                      </span>
                      <span className="font-medium text-stone-900 tabular-nums">
                        {formatPrice(item.price * item.quantity)}
                      </span>
                    </li>
                  ))}
                </ul>
                <div className="pt-2 border-t border-stone-200 flex items-center justify-between font-semibold text-stone-900">
                  <span>Total Paid</span>
                  <span className="tabular-nums">{formatPrice(receipt.total)}</span>
                </div>
                <div className="pt-2 text-xs text-stone-600 space-y-1">
                  <p>Delivery: {receipt.address}</p>
                  <p>Phone: {receipt.phone}</p>
                  <p>
                    Payment:{" "}
                    {receipt.paymentMethod === "cod"
                      ? "Cash on Delivery"
                      : "Card Payment"}
                  </p>
                </div>
              </div>

              <div className="flex flex-col gap-2.5">
                <Link
                  href="/orders"
                  onClick={handleClose}
                  className="w-full py-2.5 px-4 rounded-lg bg-orange-600 text-white text-sm font-semibold text-center hover:bg-orange-700 transition-colors"
                >
                  View Order History
                </Link>
                <button
                  type="button"
                  onClick={handleClose}
                  className="w-full py-2.5 px-4 rounded-lg bg-stone-900 text-white text-sm font-medium hover:bg-stone-800 transition-colors cursor-pointer"
                >
                  Continue Shopping
                </button>
              </div>
            </div>
          ) : cart.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center py-12 space-y-4">
              <div className="w-14 h-14 rounded-full bg-stone-100 flex items-center justify-center text-stone-500">
                <ShoppingBag className="w-6 h-6" aria-hidden="true" />
              </div>
              <div>
                <p className="font-display font-semibold text-stone-900">
                  Your shopping bag is empty
                </p>
                <p className="text-sm text-stone-500 mt-1 max-w-xs">
                  Explore our featured collection of everyday essentials to add
                  items to your bag.
                </p>
              </div>
              <Link
                href="/shop"
                onClick={handleClose}
                className="px-5 py-2.5 rounded-lg bg-orange-600 text-white text-sm font-medium hover:bg-orange-700 transition-colors"
              >
                Browse Shop Collection
              </Link>
            </div>
          ) : showCheckout && !session ? (
            <div className="py-8 space-y-5 text-center">
              <div className="space-y-2">
                <h3 className="font-display text-lg font-semibold text-stone-900">
                  Sign in to complete checkout
                </h3>
                <p className="text-sm text-stone-600 leading-relaxed">
                  Please log in to link this order and your saved items to your
                  ShopEase account history.
                </p>
              </div>
              <div className="flex flex-col gap-2.5">
                <Link
                  href="/login"
                  onClick={handleClose}
                  className="w-full py-2.5 px-4 rounded-lg bg-orange-600 text-white text-sm font-semibold hover:bg-orange-700 transition-colors"
                >
                  Login to Account
                </Link>
                <Link
                  href="/signup"
                  onClick={handleClose}
                  className="w-full py-2.5 px-4 rounded-lg border border-stone-300 text-sm font-medium text-stone-800 hover:bg-stone-100 transition-colors"
                >
                  Create Account
                </Link>
                <button
                  type="button"
                  onClick={() => setShowCheckout(false)}
                  className="text-xs font-medium text-stone-500 hover:text-stone-900 underline pt-1 cursor-pointer"
                >
                  Back to Bag
                </button>
              </div>
            </div>
          ) : showCheckout ? (
            <form onSubmit={handleSubmitOrder} className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-display text-base font-semibold text-stone-900">
                  Delivery Details
                </h3>
                <button
                  type="button"
                  onClick={() => setShowCheckout(false)}
                  className="text-xs font-medium text-stone-600 hover:text-stone-900 underline cursor-pointer"
                >
                  Edit Bag
                </button>
              </div>

              {checkoutError && (
                <p
                  role="alert"
                  className="p-3 rounded-lg bg-red-50 border border-red-200 text-xs text-red-800"
                >
                  {checkoutError}
                </p>
              )}

              <div>
                <label
                  htmlFor="checkout-name"
                  className="block text-xs font-semibold text-stone-700 mb-1.5"
                >
                  Full Name
                </label>
                <input
                  id="checkout-name"
                  type="text"
                  required
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder="Enter recipient name"
                  className="w-full px-3.5 py-2.5 rounded-lg border border-stone-300 text-sm text-stone-900 focus:outline-none focus:ring-2 focus:ring-orange-600"
                />
              </div>

              <div>
                <label
                  htmlFor="checkout-phone"
                  className="block text-xs font-semibold text-stone-700 mb-1.5"
                >
                  Phone Number
                </label>
                <input
                  id="checkout-phone"
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="09687368011"
                  className="w-full px-3.5 py-2.5 rounded-lg border border-stone-300 text-sm text-stone-900 focus:outline-none focus:ring-2 focus:ring-orange-600"
                />
              </div>

              <div>
                <label
                  htmlFor="checkout-address"
                  className="block text-xs font-semibold text-stone-700 mb-1.5"
                >
                  Shipping Address
                </label>
                <textarea
                  id="checkout-address"
                  required
                  rows={3}
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="Street, Barangay, City, Postal Code"
                  className="w-full px-3.5 py-2.5 rounded-lg border border-stone-300 text-sm text-stone-900 focus:outline-none focus:ring-2 focus:ring-orange-600"
                />
              </div>

              <div>
                <span className="block text-xs font-semibold text-stone-700 mb-1.5">
                  Payment Method
                </span>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setPaymentMethod("cod")}
                    className={`py-2.5 px-3 rounded-lg border text-xs font-medium transition-colors cursor-pointer ${
                      paymentMethod === "cod"
                        ? "border-stone-900 bg-stone-900 text-white"
                        : "border-stone-300 bg-white text-stone-700 hover:bg-stone-50"
                    }`}
                  >
                    Cash on Delivery
                  </button>
                  <button
                    type="button"
                    onClick={() => setPaymentMethod("card")}
                    className={`py-2.5 px-3 rounded-lg border text-xs font-medium transition-colors cursor-pointer ${
                      paymentMethod === "card"
                        ? "border-stone-900 bg-stone-900 text-white"
                        : "border-stone-300 bg-white text-stone-700 hover:bg-stone-50"
                    }`}
                  >
                    Card Payment
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3 px-4 rounded-lg bg-orange-600 text-white text-sm font-semibold hover:bg-orange-700 disabled:opacity-60 transition-colors cursor-pointer"
              >
                {isSubmitting ? (
                  "Saving Order..."
                ) : (
                  <>
                    Confirm Order &middot;{" "}
                    <span className="tabular-nums">
                      {formatPrice(summary.total)}
                    </span>
                  </>
                )}
              </button>
            </form>
          ) : (
            <div className="space-y-5">
              {/* Free shipping indicator */}
              <div className="p-3.5 rounded-xl bg-stone-100 border border-stone-200 text-xs text-stone-700">
                {summary.freeShippingRemaining > 0 ? (
                  <p>
                    Add{" "}
                    <span className="font-semibold text-stone-900 tabular-nums">
                      {formatPrice(summary.freeShippingRemaining)}
                    </span>{" "}
                    more for free shipping (orders over{" "}
                    <span className="tabular-nums">
                      {formatPrice(FREE_SHIPPING_THRESHOLD)}
                    </span>
                    ).
                  </p>
                ) : (
                  <p className="font-medium text-stone-900">
                    Your order qualifies for complimentary standard shipping.
                  </p>
                )}
              </div>

              <ul className="divide-y divide-stone-200">
                {cart.map((item) => (
                  <li
                    key={`${item.productId}-${item.option}`}
                    className="py-4 flex gap-4"
                  >
                    <Link
                      href={`/products/${item.slug}`}
                      onClick={handleClose}
                      className="w-20 h-20 rounded-lg overflow-hidden bg-stone-100 border border-stone-200 shrink-0"
                    >
                      <ProductImage
                        src={item.image}
                        alt={item.name}
                        className="w-full h-full object-cover"
                      />
                    </Link>
                    <div className="flex-1 min-w-0 flex flex-col justify-between">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <Link
                            href={`/products/${item.slug}`}
                            onClick={handleClose}
                            className="text-sm font-semibold text-stone-900 hover:underline"
                          >
                            {item.name}
                          </Link>
                          <p className="text-xs text-stone-500 mt-0.5">
                            {item.option}
                          </p>
                        </div>
                        <p className="text-sm font-semibold text-stone-900 tabular-nums">
                          {formatPrice(item.price * item.quantity)}
                        </p>
                      </div>

                      <div className="flex items-center justify-between mt-3">
                        <div className="inline-flex items-center border border-stone-300 rounded-lg">
                          <button
                            type="button"
                            aria-label={`Decrease quantity of ${item.name}`}
                            onClick={() =>
                              updateQuantity(
                                item.productId,
                                item.option,
                                item.quantity - 1,
                              )
                            }
                            className="w-9 h-9 inline-flex items-center justify-center text-stone-600 hover:text-stone-900 hover:bg-stone-100 rounded-l-lg cursor-pointer"
                          >
                            <Minus className="w-3.5 h-3.5" aria-hidden="true" />
                          </button>
                          <span className="w-8 text-center text-xs font-semibold text-stone-900 tabular-nums">
                            {item.quantity}
                          </span>
                          <button
                            type="button"
                            aria-label={`Increase quantity of ${item.name}`}
                            onClick={() =>
                              updateQuantity(
                                item.productId,
                                item.option,
                                item.quantity + 1,
                              )
                            }
                            className="w-9 h-9 inline-flex items-center justify-center text-stone-600 hover:text-stone-900 hover:bg-stone-100 rounded-r-lg cursor-pointer"
                          >
                            <Plus className="w-3.5 h-3.5" aria-hidden="true" />
                          </button>
                        </div>

                        <button
                          type="button"
                          aria-label={`Remove ${item.name} from bag`}
                          onClick={() => removeFromCart(item.productId, item.option)}
                          className="p-2 text-stone-400 hover:text-red-600 transition-colors cursor-pointer"
                        >
                          <Trash2 className="w-4 h-4" aria-hidden="true" />
                        </button>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Footer totals */}
        {cart.length > 0 && !showCheckout && !receipt && (
          <div className="px-6 py-5 border-t border-stone-200 bg-stone-50 space-y-4">
            <div className="space-y-1.5 text-sm">
              <div className="flex justify-between text-stone-600">
                <span>Subtotal</span>
                <span className="tabular-nums">{formatPrice(summary.subtotal)}</span>
              </div>
              <div className="flex justify-between text-stone-600">
                <span>Shipping</span>
                <span className="tabular-nums">
                  {summary.shippingFee === 0
                    ? "Free"
                    : formatPrice(summary.shippingFee)}
                </span>
              </div>
              <div className="flex justify-between font-semibold text-stone-900 pt-2 border-t border-stone-200">
                <span>Estimated Total</span>
                <span className="tabular-nums">{formatPrice(summary.total)}</span>
              </div>
            </div>

            <button
              type="button"
              onClick={handleOpenCheckout}
              className="w-full py-3 px-4 rounded-lg bg-orange-600 text-white text-sm font-semibold hover:bg-orange-700 transition-colors cursor-pointer"
            >
              Proceed to Checkout
            </button>
          </div>
        )}
      </aside>
    </div>
  );
}
