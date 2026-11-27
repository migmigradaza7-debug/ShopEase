import React from "react";
import type { Metadata } from "next";
import { PRODUCT_FILTERS, ProductFilter } from "@/lib/products";
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
  const matchedFilter = PRODUCT_FILTERS.find(
    (item) => item.toLowerCase() === category?.toLowerCase(),
  ) as ProductFilter | undefined;

  return (
    <ProductCatalog
      key={matchedFilter || "All"}
      initialCategory={matchedFilter || "All"}
    />
  );
}
