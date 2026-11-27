import test from "node:test";
import assert from "node:assert/strict";
import { PRODUCTS, filterProducts, formatPrice, getProductBySlug } from "./products";
import {
  addCartItem,
  calculateCartSummary,
  removeCartItem,
  updateCartItemQuantity,
} from "./cart";
import {
  validateContactInput,
  validateLoginInput,
  validateSignupInput,
  verifyCredentials,
} from "./auth";

test("catalog preserves all products including new arrivals and trending items", () => {
  assert.equal(PRODUCTS.length, 12);
  assert.equal(getProductBySlug("classic-sneakers")?.price, 59.99);
  assert.equal(getProductBySlug("running-trainers")?.price, 94.0);
  assert.equal(getProductBySlug("canvas-weekender-duffel")?.category, "Carry");
  assert.equal(getProductBySlug("suede-chelsea-boots")?.price, 142.0);
  assert.equal(getProductBySlug("crossbody-sling-bag")?.category, "Carry");
  assert.equal(filterProducts(PRODUCTS, "Trending").length, 4);
  assert.equal(filterProducts(PRODUCTS, "Audio").length, 3);
  assert.equal(filterProducts(PRODUCTS, "Footwear").length, 3);
  assert.equal(filterProducts(PRODUCTS, "Wearables").length, 3);
  assert.equal(filterProducts(PRODUCTS, "Carry").length, 3);
  assert.equal(filterProducts(PRODUCTS, "All", "leather").length, 3);
  assert.equal(filterProducts(PRODUCTS, "All", "suede").length, 1);
  assert.equal(filterProducts(PRODUCTS, "All", "trending").length, 4);
  assert.equal(formatPrice(120), "$120.00");
});

test("cart adds items, merges matching options, calculates free shipping, and removes at zero", () => {
  const sneakers = PRODUCTS[0];
  const watch = PRODUCTS[2];

  let cart = addCartItem([], sneakers, "US 9", 1);
  assert.equal(cart.length, 1);
  assert.equal(cart[0].quantity, 1);

  let summary = calculateCartSummary(cart);
  assert.equal(summary.subtotal, 59.99);
  assert.equal(summary.shippingFee, 8);
  assert.equal(summary.total, 67.99);

  // Adding same product + same option increments quantity
  cart = addCartItem(cart, sneakers, "US 9", 1);
  assert.equal(cart.length, 1);
  assert.equal(cart[0].quantity, 2);

  // Exceeds $100 free shipping threshold
  summary = calculateCartSummary(cart);
  assert.equal(summary.subtotal, 119.98);
  assert.equal(summary.shippingFee, 0);
  assert.equal(summary.freeShippingRemaining, 0);
  assert.equal(summary.total, 119.98);

  // Different product adds separate line item
  cart = addCartItem(cart, watch, "Charcoal Weave", 1);
  assert.equal(cart.length, 2);

  // Quantity 0 removes item
  cart = updateCartItemQuantity(cart, sneakers.id, "US 9", 0);
  assert.equal(cart.length, 1);
  assert.equal(cart[0].productId, watch.id);

  cart = removeCartItem(cart, watch.id, "Charcoal Weave");
  assert.equal(cart.length, 0);
});

test("signup validates password matching and login verifies credentials", () => {
  const mismatch = validateSignupInput({
    fullName: "Jane Doe",
    email: "jane@example.com",
    password: "secret123",
    confirmPassword: "different",
  });
  assert.equal(mismatch.valid, false);
  assert.equal(mismatch.error, "Passwords do not match.");

  const validSignup = validateSignupInput({
    fullName: "Jane Doe",
    email: "jane@example.com",
    password: "secret123",
    confirmPassword: "secret123",
  });
  assert.equal(validSignup.valid, true);

  const loginFormat = validateLoginInput({
    email: "bad-email",
    password: "secret123",
  });
  assert.equal(loginFormat.valid, false);

  const users = [
    { fullName: "Jane Doe", email: "jane@example.com", password: "secret123" },
  ];
  assert.equal(verifyCredentials(users, "JANE@example.com", "secret123")?.fullName, "Jane Doe");
  assert.equal(verifyCredentials(users, "jane@example.com", "wrong"), null);
});

test("contact form validates name, email, and minimum message length", () => {
  assert.equal(
    validateContactInput({ name: "Alex", email: "alex@example.com", message: "Hi" }).valid,
    false,
  );
  assert.equal(
    validateContactInput({
      name: "Alex",
      email: "alex@example.com",
      message: "Checking on order shipping timelines.",
    }).valid,
    true,
  );
});
