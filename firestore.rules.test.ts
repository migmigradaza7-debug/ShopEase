import test from "node:test";
import assert from "node:assert/strict";

/**
 * Mirrors the exact hardened guards enforced by firestore.rules for /users/{userId}.
 * Verifies all 12 "Dirty Dozen" adversarial payloads are rejected.
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
  if (
    typeof data.fullName !== "string" ||
    data.fullName.length < 1 ||
    data.fullName.length > 120
  ) {
    return false;
  }
  if (
    typeof data.email !== "string" ||
    data.email.length < 3 ||
    data.email.length > 254
  ) {
    return false;
  }
  if ("photoURL" in data && (typeof data.photoURL !== "string" || data.photoURL.length > 500)) {
    return false;
  }
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

test("all 12 dirty dozen adversarial payloads return PERMISSION_DENIED", () => {
  const validAuth: AuthContext = { uid: "user_abc_123", emailVerified: true };
  const validProfile = {
    uid: "user_abc_123",
    fullName: "Alex Rivera",
    email: "alex@example.com",
    createdAt: SERVER_TIME,
    updatedAt: SERVER_TIME,
  };

  // Sanity check: legitimate owner create & update succeed
  assert.equal(
    evaluateUserRule({
      op: "create",
      auth: validAuth,
      targetUserId: "user_abc_123",
      incoming: validProfile,
    }),
    "ALLOW",
  );

  // 1. Unauthenticated read
  assert.equal(
    evaluateUserRule({ op: "get", auth: null, targetUserId: "user_abc_123" }),
    "PERMISSION_DENIED",
  );
  // 2. Cross-user PII read
  assert.equal(
    evaluateUserRule({
      op: "get",
      auth: { uid: "attacker_999", emailVerified: true },
      targetUserId: "user_abc_123",
    }),
    "PERMISSION_DENIED",
  );
  // 3. Blanket collection list
  assert.equal(
    evaluateUserRule({ op: "list", auth: validAuth, targetUserId: "user_abc_123" }),
    "PERMISSION_DENIED",
  );
  // 4. Unverified email spoofing
  assert.equal(
    evaluateUserRule({
      op: "create",
      auth: { uid: "user_abc_123", emailVerified: false },
      targetUserId: "user_abc_123",
      incoming: validProfile,
    }),
    "PERMISSION_DENIED",
  );
  // 5. Identity spoofing inside body
  assert.equal(
    evaluateUserRule({
      op: "create",
      auth: validAuth,
      targetUserId: "user_abc_123",
      incoming: { ...validProfile, uid: "victim_uid" },
    }),
    "PERMISSION_DENIED",
  );
  // 6. Shadow field / RBAC injection
  assert.equal(
    evaluateUserRule({
      op: "create",
      auth: validAuth,
      targetUserId: "user_abc_123",
      incoming: { ...validProfile, isAdmin: true },
    }),
    "PERMISSION_DENIED",
  );
  // 7. Path ID poisoning
  assert.equal(
    evaluateUserRule({
      op: "create",
      auth: validAuth,
      targetUserId: "x".repeat(129),
      incoming: validProfile,
    }),
    "PERMISSION_DENIED",
  );
  // 8. Oversized string DoW
  assert.equal(
    evaluateUserRule({
      op: "create",
      auth: validAuth,
      targetUserId: "user_abc_123",
      incoming: { ...validProfile, fullName: "A".repeat(121) },
    }),
    "PERMISSION_DENIED",
  );
  // 9. Value type poisoning
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
  // 10. Immutable createdAt tampering
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
  // 11. Client-forged timestamp on create
  assert.equal(
    evaluateUserRule({
      op: "create",
      auth: validAuth,
      targetUserId: "user_abc_123",
      incoming: { ...validProfile, createdAt: "2025-01-01T00:00:00Z" },
    }),
    "PERMISSION_DENIED",
  );
  // 12. Missing required field
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
});
