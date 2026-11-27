"use client";

import React, { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Check, Minus, Plus, ShieldCheck, Truck } from "lucide-react";
import { formatPrice, Product } from "@/lib/products";
import { ProductImage } from "./ProductImage";
import { useShop } from "./ShopProvider";

interface ProductDetailClientProps {
  product: Product;
}

export function ProductDetailClient({ product }: ProductDetailClientProps) {
  const { addToCart } = useShop();
  const [selectedOption, setSelectedOption] = useState(
    product.options[0] || "Standard",
  );
  const [quantity, setQuantity] = useState(1);
  const [justAdded, setJustAdded] = useState(false);

  const handleAdd = () => {
    addToCart(product, selectedOption, quantity);
    setJustAdded(true);
    setTimeout(() => setJustAdded(false), 1800);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10 sm:py-16">
      <div className="mb-8 flex items-center gap-2 text-xs text-stone-500">
        <Link
          href="/"
          className="hover:text-stone-900 transition-colors"
        >
          Home
        </Link>
        <span aria-hidden="true">/</span>
        <Link
          href={`/shop?category=${encodeURIComponent(product.category)}`}
          className="hover:text-stone-900 transition-colors"
        >
          {product.category}
        </Link>
        <span aria-hidden="true">/</span>
        <span className="text-stone-900 font-medium">{product.name}</span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-start">
        {/* Left: Sticky Gallery */}
        <div className="lg:col-span-7 lg:sticky lg:top-24">
          <div className="aspect-[4/3] rounded-2xl overflow-hidden bg-stone-100 border border-stone-200">
            <ProductImage
              src={product.image}
              alt={product.name}
              className="w-full h-full object-cover"
            />
          </div>
        </div>

        {/* Right: Contiguous Purchase Module */}
        <div className="lg:col-span-5 space-y-6">
          <div>
            <p className="text-xs uppercase tracking-wider text-stone-500 font-medium">
              {product.category} <span aria-hidden="true">&middot;</span>{" "}
              {product.availability}
            </p>
            <h1 className="mt-2 font-display text-3xl sm:text-4xl font-bold text-stone-900 tracking-tight">
              {product.name}
            </h1>
            <p className="mt-3 text-2xl font-semibold text-orange-700 tabular-nums">
              {formatPrice(product.price)}
            </p>
          </div>

          <p className="text-base text-stone-600 leading-relaxed">
            {product.description}
          </p>

          {/* Variant Selector */}
          <div>
            <span className="block text-xs font-semibold uppercase tracking-wider text-stone-700 mb-2.5">
              {product.optionLabel}:{" "}
              <span className="text-stone-900 normal-case font-medium">
                {selectedOption}
              </span>
            </span>
            <div className="flex flex-wrap gap-2">
              {product.options.map((option) => {
                const active = selectedOption === option;
                return (
                  <button
                    key={option}
                    type="button"
                    onClick={() => setSelectedOption(option)}
                    aria-pressed={active}
                    className={`px-4 py-2 min-h-[40px] rounded-lg border text-sm font-medium transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                      active
                        ? "border-stone-900 bg-stone-900 text-white"
                        : "border-stone-300 bg-white text-stone-800 hover:bg-stone-100"
                    }`}
                  >
                    {option}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Quantity + Primary Buy CTA */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-2">
            <div className="inline-flex items-center justify-between border border-stone-300 bg-white rounded-lg px-1 h-12 sm:w-36 shrink-0">
              <button
                type="button"
                aria-label="Decrease quantity"
                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                className="w-10 h-10 inline-flex items-center justify-center text-stone-600 hover:text-stone-900 rounded-md hover:bg-stone-100 cursor-pointer"
              >
                <Minus className="w-4 h-4" aria-hidden="true" />
              </button>
              <span
                aria-label="Selected quantity"
                className="text-sm font-semibold text-stone-900 tabular-nums"
              >
                {quantity}
              </span>
              <button
                type="button"
                aria-label="Increase quantity"
                onClick={() => setQuantity((q) => Math.min(20, q + 1))}
                className="w-10 h-10 inline-flex items-center justify-center text-stone-600 hover:text-stone-900 rounded-md hover:bg-stone-100 cursor-pointer"
              >
                <Plus className="w-4 h-4" aria-hidden="true" />
              </button>
            </div>

            <button
              type="button"
              onClick={handleAdd}
              className="flex-1 h-12 px-6 rounded-lg bg-orange-600 text-white text-sm font-semibold hover:bg-orange-700 transition-colors inline-flex items-center justify-center gap-2 whitespace-nowrap cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-600 focus-visible:ring-offset-2"
            >
              {justAdded ? (
                <>
                  <Check className="w-4 h-4" aria-hidden="true" />
                  <span>Added to Bag</span>
                </>
              ) : (
                <span>
                  Add to Cart &middot;{" "}
                  <span className="tabular-nums">
                    {formatPrice(product.price * quantity)}
                  </span>
                </span>
              )}
            </button>
          </div>

          <div className="pt-1">
            <Link
              href="/shop"
              className="inline-flex items-center gap-2 text-sm font-medium text-stone-700 hover:text-stone-900 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" aria-hidden="true" />
              <span>Back to Shop</span>
            </Link>
          </div>

          {/* Specifications */}
          <div className="pt-6 border-t border-stone-200 space-y-3">
            <h2 className="text-xs font-semibold uppercase tracking-wider text-stone-500">
              Specifications
            </h2>
            <dl className="divide-y divide-stone-200 text-sm">
              {product.specs.map((spec) => (
                <div
                  key={spec.label}
                  className="py-2.5 flex items-center justify-between gap-4"
                >
                  <dt className="text-stone-500">{spec.label}</dt>
                  <dd className="font-medium text-stone-900 text-right">
                    {spec.value}
                  </dd>
                </div>
              ))}
            </dl>
          </div>

          <div className="pt-4 border-t border-stone-200 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-stone-600">
            <div className="flex items-center gap-2">
              <Truck className="w-4 h-4 text-stone-500 shrink-0" aria-hidden="true" />
              <span>Free shipping over $100</span>
            </div>
            <div className="flex items-center gap-2">
              <ShieldCheck
                className="w-4 h-4 text-stone-500 shrink-0"
                aria-hidden="true"
              />
              <span>30-day quality guarantee</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
