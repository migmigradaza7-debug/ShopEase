export type ProductCategory = "Footwear" | "Audio" | "Wearables" | "Carry";
export type ProductFilter = "All" | "Trending" | ProductCategory;

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
  trending?: boolean;
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
  {
    id: "product-9",
    slug: "suede-chelsea-boots",
    name: "Suede Chelsea Boots",
    category: "Footwear",
    price: 142.0,
    shortDescription: "Water-resistant taupe suede boots with cushioned crepe soles.",
    description:
      "Refined pull-on Chelsea silhouette crafted in soft water-repellent Italian suede with elastic side gussets and shock-absorbing natural crepe rubber outsoles for crisp all-season wear.",
    image: "/images/product_chelsea_boots.jpg",
    availability: "Trending",
    trending: true,
    optionLabel: "Size",
    options: ["US 8", "US 9", "US 10", "US 11"],
    specs: [
      { label: "Upper", value: "Water-repellent split suede" },
      { label: "Outsole", value: "Textured natural rubber crepe" },
      { label: "Lining", value: "Breathable calfskin footbed" },
    ],
  },
  {
    id: "product-10",
    slug: "portable-bluetooth-speaker",
    name: "Portable Bluetooth Speaker",
    category: "Audio",
    price: 78.0,
    shortDescription: "360-degree acoustic sound in an anodized aluminum cylinder.",
    description:
      "Room-filling 360-degree audio tuned for clear mids and deep bass without distortion. Wrapped in woven acoustic fabric with tactile rotary volume control and 18-hour battery life.",
    image: "/images/product_bluetooth_speaker.jpg",
    availability: "Trending",
    trending: true,
    optionLabel: "Finish",
    options: ["Stone Gray", "Sage Green"],
    specs: [
      { label: "Output", value: "20W 360-degree full-range driver" },
      { label: "Battery", value: "Up to 18 hours · USB-C fast charge" },
      { label: "Protection", value: "IP67 dust & water resistant" },
    ],
  },
  {
    id: "product-11",
    slug: "polarized-acetate-sunglasses",
    name: "Polarized Acetate Sunglasses",
    category: "Wearables",
    price: 84.0,
    shortDescription: "Hand-finished cellulose acetate frames with UV400 lenses.",
    description:
      "Balanced everyday eyewear sculpted from plant-based tortoiseshell acetate with riveted five-barrel hinges and anti-glare polarized nylon lenses offering 100% UVA/UVB protection.",
    image: "/images/product_acetate_sunglasses_pair.jpg",
    availability: "Trending",
    trending: true,
    optionLabel: "Frame",
    options: ["Tortoiseshell", "Matte Black"],
    specs: [
      { label: "Frame", value: "Hand-polished Italian acetate" },
      { label: "Lenses", value: "Polarized CR-39 · 100% UV400" },
      { label: "Includes", value: "Collapsible leather travel case" },
    ],
  },
  {
    id: "product-12",
    slug: "crossbody-sling-bag",
    name: "Crossbody Sling Bag",
    category: "Carry",
    price: 64.0,
    shortDescription: "Weatherproof ballistic nylon sling for compact daily carry.",
    description:
      "Streamlined hands-free organizer designed for city errands and travel days. Built from abrasion-resistant ballistic nylon with leather pull tabs, magnetic strap buckle, and padded tablet sleeve.",
    image: "/images/product_crossbody_sling.jpg",
    availability: "Trending",
    trending: true,
    optionLabel: "Colorway",
    options: ["Charcoal Nylon", "Sandstone"],
    specs: [
      { label: "Capacity", value: "4.5L · Fits 11\" tablet & essentials" },
      { label: "Shell", value: "1680D weatherproof ballistic nylon" },
      { label: "Strap", value: "Quick-release magnetic stabilizer" },
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

export const PRODUCT_FILTERS: ProductFilter[] = [
  "All",
  "Trending",
  "Footwear",
  "Audio",
  "Wearables",
  "Carry",
];

export const TRENDING_PRODUCTS: Product[] = PRODUCTS.filter(
  (product) => product.trending || product.availability === "Trending",
);

export function getProductBySlug(slug: string): Product | undefined {
  return PRODUCTS.find((product) => product.slug === slug);
}

export function filterProducts(
  products: Product[],
  filter: ProductFilter,
  searchQuery = "",
): Product[] {
  const normalizedQuery = searchQuery.trim().toLowerCase();
  return products.filter((product) => {
    const matchesFilter =
      filter === "All"
        ? true
        : filter === "Trending"
          ? Boolean(product.trending || product.availability === "Trending")
          : product.category === filter;
    if (!matchesFilter) return false;
    if (!normalizedQuery) return true;
    return (
      product.name.toLowerCase().includes(normalizedQuery) ||
      product.category.toLowerCase().includes(normalizedQuery) ||
      product.availability.toLowerCase().includes(normalizedQuery) ||
      product.shortDescription.toLowerCase().includes(normalizedQuery)
    );
  });
}

export function formatPrice(amount: number): string {
  return `$${amount.toFixed(2)}`;
}
