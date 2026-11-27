import React from "react";
import type { Metadata } from "next";
import { PRODUCT_CATEGORIES, ProductCategory } from "@/lib/products";
import { ProductCatalog } from "@/components/ProductCatalog";

export const metadata: Metadata = {
  title: "Shop Collection | ShopEase",
  description:
    "Browse ShopEase footwear, wireless audio, wearables, and leather carry goods.",
};

interface ShopPageProps {
  searchParams: Promise<{ category?: string }>;
}

export default async function ShopPage({ searchParams }: ShopPageProps) {
  const { category } = await searchParams;
  const matchedCategory = PRODUCT_CATEGORIES.find(
    (item) => item.toLowerCase() === category?.toLowerCase(),
  ) as "All" | ProductCategory | undefined;

  return (
    <ProductCatalog
      key={matchedCategory || "All"}
      initialCategory={matchedCategory || "All"}
    />
  );
}
