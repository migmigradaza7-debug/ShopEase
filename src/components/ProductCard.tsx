"use client";

import React from "react";
import Link from "next/link";
import { formatPrice, Product } from "@/lib/products";
import { ProductImage } from "./ProductImage";
import { useShop } from "./ShopProvider";

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const { addToCart } = useShop();

  return (
    <article className="group bg-white rounded-xl border border-stone-200 overflow-hidden flex flex-col transition-transform duration-200 ease-[cubic-bezier(0.16,1,0.3,1)] hover:-translate-y-0.5 hover:shadow-md">
      <Link
        href={`/products/${product.slug}`}
        className="block aspect-[4/3] bg-stone-100 overflow-hidden focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-600"
      >
        <ProductImage
          src={product.image}
          alt={product.name}
          className="w-full h-full object-cover transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.03]"
        />
      </Link>

      <div className="p-5 flex-1 flex flex-col justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-wider text-stone-500 font-medium">
            {product.category} <span aria-hidden="true">&middot;</span>{" "}
            {product.availability}
          </p>
          <h3 className="mt-1.5 font-display text-base font-semibold text-stone-900">
            <Link
              href={`/products/${product.slug}`}
              className="hover:text-orange-700 transition-colors"
            >
              {product.name}
            </Link>
          </h3>
          <p className="mt-1 text-sm text-stone-600 line-clamp-2">
            {product.shortDescription}
          </p>
        </div>

        <div className="pt-3 border-t border-stone-100 flex items-center justify-between gap-3">
          <p className="text-[15px] font-semibold text-stone-900 tabular-nums">
            {formatPrice(product.price)}
          </p>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => addToCart(product, product.options[0], 1)}
              aria-label={`Add ${product.name} to bag`}
              className="px-3.5 py-2 min-h-[40px] rounded-lg border border-stone-300 text-xs font-medium text-stone-800 hover:bg-stone-100 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              Add to Bag
            </button>
            <Link
              href={`/products/${product.slug}`}
              className="px-3.5 py-2 min-h-[40px] inline-flex items-center rounded-lg bg-orange-600 text-white text-xs font-medium hover:bg-orange-700 transition-colors whitespace-nowrap shrink-0"
            >
              View
            </Link>
          </div>
        </div>
      </div>
    </article>
  );
}
