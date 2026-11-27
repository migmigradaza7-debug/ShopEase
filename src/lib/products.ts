export type ProductCategory = "Footwear" | "Audio" | "Wearables" | "Carry";

export interface Product {
  id: string;
  slug: string;
  name: string;
  category: ProductCategory;
  price: number;
  shortDescription: string;
  description: string;
  image: string;
  availability: string;
  optionLabel: string;
  options: string[];
  specs: { label: string; value: string }[];
}

export const PRODUCTS: Product[] = [
  {
    id: "product-1",
    slug: "classic-sneakers",
    name: "Classic Sneakers",
    category: "Footwear",
    price: 59.99,
    shortDescription: "Lightweight everyday low-tops with cushioned soles.",
    description:
      "Lightweight and durable sneakers designed for all-day comfort. Crafted with breathable lining, reinforced stitching, and a responsive rubber outsole suited for daily city miles.",
    image: "/images/product_classic_sneakers.jpg",
    availability: "In Stock",
    optionLabel: "Size",
    options: ["US 8", "US 9", "US 10", "US 11"],
    specs: [
      { label: "Upper", value: "Full-grain leather & suede trim" },
      { label: "Outsole", value: "High-traction natural rubber" },
      { label: "Weight", value: "310g per shoe" },
    ],
  },
  {
    id: "product-2",
    slug: "wireless-headphones",
    name: "Wireless Headphones",
    category: "Audio",
    price: 89.99,
    shortDescription: "Rich acoustic clarity with up to 50-hour battery life.",
    description:
      "Experience deep sound with Bluetooth connectivity and long battery life. Engineered with memory-foam ear cushions, balanced 40mm drivers, and crisp dual-mic call clarity.",
    image: "/images/product_wireless_headphones.jpg",
    availability: "In Stock",
    optionLabel: "Finish",
    options: ["Warm Sand", "Matte Charcoal"],
    specs: [
      { label: "Connectivity", value: "Bluetooth 5.3 & USB-C audio" },
      { label: "Battery", value: "Up to 50 hours playback" },
      { label: "Charging", value: "10 min charge for 4 hrs play" },
    ],
  },
  {
    id: "product-3",
    slug: "smart-watch",
    name: "Smart Watch",
    category: "Wearables",
    price: 120.0,
    shortDescription: "Fitness, sleep, and notification tracking on your wrist.",
    description:
      "Track your health, fitness, and notifications with modern smartwatch features. Features a bright always-on OLED display, continuous heart-rate sensing, and 5ATM water resistance.",
    image: "/images/product_smart_watch.jpg",
    availability: "In Stock",
    optionLabel: "Band",
    options: ["Charcoal Weave", "Slate Silicone"],
    specs: [
      { label: "Case", value: "44mm brushed aluminum alloy" },
      { label: "Water Resistance", value: "5ATM (50 meters)" },
      { label: "Battery", value: "Up to 7 days typical use" },
    ],
  },
  {
    id: "product-4",
    slug: "leather-backpack",
    name: "Leather Backpack",
    category: "Carry",
    price: 75.0,
    shortDescription: "Structured 16-inch laptop pack in supple leather.",
    description:
      "Elegant and durable backpack crafted from premium leather. Organized with a padded laptop sleeve, quick-access front pocket, and contoured shoulder straps for comfortable commutes.",
    image: "/images/product_leather_backpack.jpg",
    availability: "In Stock",
    optionLabel: "Edition",
    options: ["Matte Black", "Espresso"],
    specs: [
      { label: "Capacity", value: "18L · Fits up to 16\" laptop" },
      { label: "Material", value: "Pebbled top-grain leather" },
      { label: "Hardware", value: "Brushed gunmetal zippers" },
    ],
  },
  {
    id: "product-5",
    slug: "running-trainers",
    name: "Running Trainers",
    category: "Footwear",
    price: 94.0,
    shortDescription: "Breathable knit runners with responsive dual-density cushioning.",
    description:
      "Engineered for daily tempo runs and long city walks. Features a single-piece engineered knit upper, flared heel support, and high-rebound foam midsole for effortless stride transitions.",
    image: "/images/product_running_trainers.jpg",
    availability: "New Arrival",
    optionLabel: "Size",
    options: ["US 8", "US 9", "US 10", "US 11"],
    specs: [
      { label: "Upper", value: "Breathable recycled knit mesh" },
      { label: "Midsole", value: "Dual-density EVA rebound foam" },
      { label: "Drop", value: "8mm heel-to-toe offset" },
    ],
  },
  {
    id: "product-6",
    slug: "wireless-earbuds",
    name: "Wireless Earbuds",
    category: "Audio",
    price: 68.0,
    shortDescription: "Compact acoustic earbuds with 28-hour pocket charging case.",
    description:
      "Pocket-sized everyday audio built for crisp vocals and balanced bass. Includes passive noise isolation, sweat-resistant seals, and a fast-charging USB-C pebble case.",
    image: "/images/product_wireless_earbuds.jpg",
    availability: "New Arrival",
    optionLabel: "Finish",
    options: ["Matte Ivory", "Obsidian"],
    specs: [
      { label: "Battery", value: "7 hrs buds + 21 hrs case" },
      { label: "Resistance", value: "IPX4 splash & sweat rated" },
      { label: "Connectivity", value: "Bluetooth 5.3 multipoint" },
    ],
  },
  {
    id: "product-7",
    slug: "minimalist-analog-watch",
    name: "Minimalist Analog Watch",
    category: "Wearables",
    price: 135.0,
    shortDescription: "Brushed steel case with sapphire crystal and tan leather strap.",
    description:
      "Timeless daily watch pairing a clean matte cream dial with a slim 40mm brushed stainless-steel case, scratch-resistant sapphire crystal, and quick-release Italian leather strap.",
    image: "/images/product_minimalist_analog_watch.jpg",
    availability: "New Arrival",
    optionLabel: "Strap",
    options: ["Saddle Tan", "Brushed Steel"],
    specs: [
      { label: "Movement", value: "Precision Japanese quartz" },
      { label: "Crystal", value: "Flat anti-reflective sapphire" },
      { label: "Case Width", value: "40mm · 5ATM water resistant" },
    ],
  },
  {
    id: "product-8",
    slug: "canvas-weekender-duffel",
    name: "Canvas Weekender Duffel",
    category: "Carry",
    price: 110.0,
    shortDescription: "Heavyweight waxed canvas travel bag with leather trim.",
    description:
      "Built for 3-day getaways and gym-to-office carry. Crafted from water-repellent 18oz waxed cotton canvas with reinforced bridle leather handles and a separate vented shoe compartment.",
    image: "/images/product_canvas_duffel.jpg",
    availability: "New Arrival",
    optionLabel: "Colorway",
    options: ["Olive & Saddle", "Charcoal Slate"],
    specs: [
      { label: "Capacity", value: "38L overhead cabin compliant" },
      { label: "Body", value: "18oz water-repellent waxed canvas" },
      { label: "Trim", value: "Full-grain bridle leather handles" },
    ],
  },
];

export const PRODUCT_CATEGORIES: ("All" | ProductCategory)[] = [
  "All",
  "Footwear",
  "Audio",
  "Wearables",
  "Carry",
];

export function getProductBySlug(slug: string): Product | undefined {
  return PRODUCTS.find((product) => product.slug === slug);
}

export function filterProducts(
  products: Product[],
  category: "All" | ProductCategory,
  searchQuery = "",
): Product[] {
  const normalizedQuery = searchQuery.trim().toLowerCase();
  return products.filter((product) => {
    const matchesCategory = category === "All" || product.category === category;
    if (!matchesCategory) return false;
    if (!normalizedQuery) return true;
    return (
      product.name.toLowerCase().includes(normalizedQuery) ||
      product.category.toLowerCase().includes(normalizedQuery) ||
      product.shortDescription.toLowerCase().includes(normalizedQuery)
    );
  });
}

export function formatPrice(amount: number): string {
  return `$${amount.toFixed(2)}`;
}
