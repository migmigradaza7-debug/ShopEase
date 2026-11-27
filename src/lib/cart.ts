import type { Product } from "./products";

export interface CartItem {
  productId: string;
  slug: string;
  name: string;
  price: number;
  image: string;
  option: string;
  quantity: number;
}

export interface CartSummary {
  itemCount: number;
  subtotal: number;
  shippingFee: number;
  freeShippingRemaining: number;
  total: number;
}

export const FREE_SHIPPING_THRESHOLD = 100;
export const STANDARD_SHIPPING_FEE = 8;

export function addCartItem(
  items: CartItem[],
  product: Product,
  option: string,
  quantity = 1,
): CartItem[] {
  const safeQuantity = Math.max(1, Math.min(20, Math.floor(quantity)));
  const selectedOption = option || product.options[0] || "Standard";
  const existingIndex = items.findIndex(
    (item) => item.productId === product.id && item.option === selectedOption,
  );

  if (existingIndex === -1) {
    return [
      ...items,
      {
        productId: product.id,
        slug: product.slug,
        name: product.name,
        price: product.price,
        image: product.image,
        option: selectedOption,
        quantity: safeQuantity,
      },
    ];
  }

  return items.map((item, idx) =>
    idx === existingIndex
      ? { ...item, quantity: Math.min(20, item.quantity + safeQuantity) }
      : item,
  );
}

export function updateCartItemQuantity(
  items: CartItem[],
  productId: string,
  option: string,
  nextQuantity: number,
): CartItem[] {
  if (nextQuantity <= 0) {
    return removeCartItem(items, productId, option);
  }
  const clamped = Math.min(20, Math.floor(nextQuantity));
  return items.map((item) =>
    item.productId === productId && item.option === option
      ? { ...item, quantity: clamped }
      : item,
  );
}

export function removeCartItem(
  items: CartItem[],
  productId: string,
  option: string,
): CartItem[] {
  return items.filter(
    (item) => !(item.productId === productId && item.option === option),
  );
}

export function calculateCartSummary(items: CartItem[]): CartSummary {
  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = Number(
    items.reduce((sum, item) => sum + item.price * item.quantity, 0).toFixed(2),
  );
  const shippingFee =
    subtotal === 0 || subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : STANDARD_SHIPPING_FEE;
  const freeShippingRemaining =
    subtotal >= FREE_SHIPPING_THRESHOLD
      ? 0
      : Number((FREE_SHIPPING_THRESHOLD - subtotal).toFixed(2));
  const total = Number((subtotal + shippingFee).toFixed(2));

  return {
    itemCount,
    subtotal,
    shippingFee,
    freeShippingRemaining,
    total,
  };
}

export function generateOrderNumber(seed = Date.now()): string {
  const suffix = Math.abs(seed % 9000) + 1000;
  return `SE-${suffix}`;
}
