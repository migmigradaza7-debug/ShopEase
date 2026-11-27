import test from "node:test";
import assert from "node:assert/strict";

/**
 * Mirrors the exact hardened guards enforced by firestore.rules for
 * /users/{userId}, /users/{userId}/cartItems/{itemId}, and /users/{userId}/orders/{orderId}.
 */
const ID_REGEX = /^[a-zA-Z0-9_-]+$/;
const SERVER_TIME = "SERVER_REQUEST_TIME";

interface AuthContext {
  uid: string;
  emailVerified: boolean;
}

function isValidId(id: string): boolean {
  return typeof id === "string" && id.length >= 1 && id.length <= 128 && ID_REGEX.test(id);
}

function isValidUserProfile(
  data: Record<string, unknown>,
  auth: AuthContext,
): boolean {
  const keys = Object.keys(data);
  const required = ["uid", "fullName", "email", "createdAt", "updatedAt"];
  const allowed = new Set([...required, "photoURL"]);

  if (!required.every((k) => k in data)) return false;
  if (!keys.every((k) => allowed.has(k))) return false;
  if (typeof data.uid !== "string" || !isValidId(data.uid) || data.uid !== auth.uid) {
    return false;
  }
  if (typeof data.fullName !== "string" || data.fullName.length < 1 || data.fullName.length > 120) {
    return false;
  }
  if (typeof data.email !== "string" || data.email.length < 3 || data.email.length > 254) {
    return false;
  }
  if ("photoURL" in data && (typeof data.photoURL !== "string" || data.photoURL.length > 500)) {
    return false;
  }
  return true;
}

function isValidCartItem(data: Record<string, unknown>, auth: AuthContext): boolean {
  const required = [
    "uid",
    "productId",
    "slug",
    "name",
    "price",
    "image",
    "option",
    "quantity",
    "updatedAt",
  ];
  const allowed = new Set(required);
  const keys = Object.keys(data);
  if (!required.every((k) => k in data)) return false;
  if (!keys.every((k) => allowed.has(k))) return false;
  if (typeof data.uid !== "string" || !isValidId(data.uid) || data.uid !== auth.uid) {
    return false;
  }
  if (typeof data.price !== "number" || data.price <= 0 || data.price > 100000) return false;
  if (
    typeof data.quantity !== "number" ||
    !Number.isInteger(data.quantity) ||
    data.quantity < 1 ||
    data.quantity > 20
  ) {
    return false;
  }
  return true;
}

function isValidOrder(data: Record<string, unknown>, auth: AuthContext): boolean {
  const required = [
    "uid",
    "orderNumber",
    "customerName",
    "address",
    "phone",
    "paymentMethod",
    "items",
    "subtotal",
    "shippingFee",
    "total",
    "status",
    "createdAtMs",
    "createdAt",
  ];
  const allowed = new Set(required);
  if (!required.every((k) => k in data)) return false;
  if (!Object.keys(data).every((k) => allowed.has(k))) return false;
  if (typeof data.uid !== "string" || !isValidId(data.uid) || data.uid !== auth.uid) {
    return false;
  }
  if (!Array.isArray(data.items) || data.items.length < 1 || data.items.length > 50) return false;
  if (data.status !== "Confirmed") return false;
  if (data.paymentMethod !== "cod" && data.paymentMethod !== "card") return false;
  return true;
}

function evaluateUserRule(params: {
  op: "get" | "list" | "create" | "update" | "delete";
  auth: AuthContext | null;
  targetUserId: string;
  incoming?: Record<string, unknown>;
  existing?: Record<string, unknown>;
}): "ALLOW" | "PERMISSION_DENIED" {
  const { op, auth, targetUserId, incoming, existing } = params;
  if (!auth || !auth.emailVerified) return "PERMISSION_DENIED";
  if (op === "list") return "PERMISSION_DENIED";
  if (!isValidId(targetUserId) || auth.uid !== targetUserId) return "PERMISSION_DENIED";
  if (op === "get" || op === "delete") return "ALLOW";

  if (!incoming || !isValidUserProfile(incoming, auth)) return "PERMISSION_DENIED";

  if (op === "create") {
    if (incoming.createdAt !== SERVER_TIME || incoming.updatedAt !== SERVER_TIME) {
      return "PERMISSION_DENIED";
    }
    return "ALLOW";
  }

  if (op === "update" && existing) {
    if (incoming.uid !== existing.uid || incoming.createdAt !== existing.createdAt) {
      return "PERMISSION_DENIED";
    }
    if (incoming.updatedAt !== SERVER_TIME) return "PERMISSION_DENIED";
    const allowedMutable = new Set(["fullName", "email", "photoURL", "updatedAt"]);
    const changed = Object.keys(incoming).filter((k) => incoming[k] !== existing[k]);
    if (!changed.every((k) => allowedMutable.has(k))) return "PERMISSION_DENIED";
    return "ALLOW";
  }

  return "PERMISSION_DENIED";
}

function evaluateSubcollectionRule(params: {
  collection: "cartItems" | "orders";
  op: "get" | "list" | "create" | "update" | "delete";
  auth: AuthContext | null;
  targetUserId: string;
  targetDocId?: string;
  hasParentUser?: boolean;
  incoming?: Record<string, unknown>;
  existing?: Record<string, unknown>;
}): "ALLOW" | "PERMISSION_DENIED" {
  const {
    collection,
    op,
    auth,
    targetUserId,
    targetDocId = "doc_1",
    hasParentUser = true,
    incoming,
    existing,
  } = params;
  if (!auth || !auth.emailVerified) return "PERMISSION_DENIED";
  if (!isValidId(targetUserId) || auth.uid !== targetUserId) return "PERMISSION_DENIED";
  if (op === "list") {
    return existing?.uid === auth.uid ? "ALLOW" : "PERMISSION_DENIED";
  }
  if (!isValidId(targetDocId)) return "PERMISSION_DENIED";

  if (collection === "orders") {
    if (op === "update" || op === "delete") return "PERMISSION_DENIED";
    if (op === "get") return "ALLOW";
    if (!hasParentUser || !incoming || !isValidOrder(incoming, auth)) return "PERMISSION_DENIED";
    return incoming.createdAt === SERVER_TIME ? "ALLOW" : "PERMISSION_DENIED";
  }

  if (op === "get" || op === "delete") return "ALLOW";
  if (!hasParentUser || !incoming || !isValidCartItem(incoming, auth)) return "PERMISSION_DENIED";
  if (incoming.updatedAt !== SERVER_TIME) return "PERMISSION_DENIED";
  return "ALLOW";
}

test("all dirty dozen + cart/order adversarial payloads return PERMISSION_DENIED", () => {
  const validAuth: AuthContext = { uid: "user_abc_123", emailVerified: true };
  const validProfile = {
    uid: "user_abc_123",
    fullName: "Alex Rivera",
    email: "alex@example.com",
    createdAt: SERVER_TIME,
    updatedAt: SERVER_TIME,
  };
  const validCartItem = {
    uid: "user_abc_123",
    productId: "product-1",
    slug: "classic-sneakers",
    name: "Classic Sneakers",
    price: 59.99,
    image: "/images/product_classic_sneakers.jpg",
    option: "US 9",
    quantity: 2,
    updatedAt: SERVER_TIME,
  };
  const validOrder = {
    uid: "user_abc_123",
    orderNumber: "SE-1234",
    customerName: "Alex Rivera",
    address: "Davao City, Philippines",
    phone: "09687368011",
    paymentMethod: "cod",
    items: [validCartItem],
    subtotal: 119.98,
    shippingFee: 0,
    total: 119.98,
    status: "Confirmed",
    createdAtMs: 1730000000000,
    createdAt: SERVER_TIME,
  };

  assert.equal(
    evaluateUserRule({
      op: "create",
      auth: validAuth,
      targetUserId: "user_abc_123",
      incoming: validProfile,
    }),
    "ALLOW",
  );
  assert.equal(
    evaluateSubcollectionRule({
      collection: "cartItems",
      op: "create",
      auth: validAuth,
      targetUserId: "user_abc_123",
      incoming: validCartItem,
    }),
    "ALLOW",
  );
  assert.equal(
    evaluateSubcollectionRule({
      collection: "orders",
      op: "create",
      auth: validAuth,
      targetUserId: "user_abc_123",
      incoming: validOrder,
    }),
    "ALLOW",
  );

  // 1-12 UserProfile vectors
  assert.equal(
    evaluateUserRule({ op: "get", auth: null, targetUserId: "user_abc_123" }),
    "PERMISSION_DENIED",
  );
  assert.equal(
    evaluateUserRule({
      op: "get",
      auth: { uid: "attacker_999", emailVerified: true },
      targetUserId: "user_abc_123",
    }),
    "PERMISSION_DENIED",
  );
  assert.equal(
    evaluateUserRule({ op: "list", auth: validAuth, targetUserId: "user_abc_123" }),
    "PERMISSION_DENIED",
  );
  assert.equal(
    evaluateUserRule({
      op: "create",
      auth: { uid: "user_abc_123", emailVerified: false },
      targetUserId: "user_abc_123",
      incoming: validProfile,
    }),
    "PERMISSION_DENIED",
  );
  assert.equal(
    evaluateUserRule({
      op: "create",
      auth: validAuth,
      targetUserId: "user_abc_123",
      incoming: { ...validProfile, uid: "victim_uid" },
    }),
    "PERMISSION_DENIED",
  );
  assert.equal(
    evaluateUserRule({
      op: "create",
      auth: validAuth,
      targetUserId: "user_abc_123",
      incoming: { ...validProfile, isAdmin: true },
    }),
    "PERMISSION_DENIED",
  );
  assert.equal(
    evaluateUserRule({
      op: "create",
      auth: validAuth,
      targetUserId: "x".repeat(129),
      incoming: validProfile,
    }),
    "PERMISSION_DENIED",
  );
  assert.equal(
    evaluateUserRule({
      op: "create",
      auth: validAuth,
      targetUserId: "user_abc_123",
      incoming: { ...validProfile, fullName: "A".repeat(121) },
    }),
    "PERMISSION_DENIED",
  );
  assert.equal(
    evaluateUserRule({
      op: "update",
      auth: validAuth,
      targetUserId: "user_abc_123",
      existing: validProfile,
      incoming: { ...validProfile, email: 12345 as unknown as string },
    }),
    "PERMISSION_DENIED",
  );
  assert.equal(
    evaluateUserRule({
      op: "update",
      auth: validAuth,
      targetUserId: "user_abc_123",
      existing: validProfile,
      incoming: { ...validProfile, createdAt: "2020-01-01T00:00:00Z" },
    }),
    "PERMISSION_DENIED",
  );
  assert.equal(
    evaluateUserRule({
      op: "create",
      auth: validAuth,
      targetUserId: "user_abc_123",
      incoming: { ...validProfile, createdAt: "2025-01-01T00:00:00Z" },
    }),
    "PERMISSION_DENIED",
  );
  const { fullName: _omitted, ...missingName } = validProfile;
  void _omitted;
  assert.equal(
    evaluateUserRule({
      op: "create",
      auth: validAuth,
      targetUserId: "user_abc_123",
      incoming: missingName,
    }),
    "PERMISSION_DENIED",
  );

  // 13-16 CartItems & Orders cross-account isolation & integrity vectors
  assert.equal(
    evaluateSubcollectionRule({
      collection: "cartItems",
      op: "create",
      auth: { uid: "attacker_999", emailVerified: true },
      targetUserId: "user_abc_123",
      incoming: validCartItem,
    }),
    "PERMISSION_DENIED",
  );
  assert.equal(
    evaluateSubcollectionRule({
      collection: "cartItems",
      op: "create",
      auth: validAuth,
      targetUserId: "user_abc_123",
      incoming: { ...validCartItem, quantity: 999 },
    }),
    "PERMISSION_DENIED",
  );
  assert.equal(
    evaluateSubcollectionRule({
      collection: "orders",
      op: "list",
      auth: { uid: "attacker_999", emailVerified: true },
      targetUserId: "user_abc_123",
      existing: validOrder,
    }),
    "PERMISSION_DENIED",
  );
  assert.equal(
    evaluateSubcollectionRule({
      collection: "orders",
      op: "update",
      auth: validAuth,
      targetUserId: "user_abc_123",
      existing: validOrder,
      incoming: validOrder,
    }),
    "PERMISSION_DENIED",
  );
});
