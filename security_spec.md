# ShopEase Security Specification (Phase 0)

## 1. Data Invariants

1. **Default-Deny Baseline**: Every Firestore path outside explicit allow blocks is denied (`allow read, write: if false;`).
2. **Strict Ownership & PII Isolation (`/users/{userId}`)**:
   - `get`, `create`, `update`, and `delete` are permitted ONLY when `request.auth != null`, `request.auth.uid == userId`, and `request.auth.token.email_verified == true`.
   - `list` is permanently denied (`allow list: if false;`) on `/users`.
3. **Master Gate on Subcollections (`/users/{userId}/cartItems/{itemId}` & `/users/{userId}/orders/{orderId}`)**:
   - Every subcollection write (`create`/`update`) verifies `exists(/databases/$(database)/documents/users/$(userId))`.
   - `allow list` enforces `isOwner(userId) && resource.data.uid == request.auth.uid` with zero `get()`/`exists()` calls to avoid O(n) read amplification.
4. **Validation Blueprints (`isValidUserProfile`, `isValidCartItem`, `isValidOrder`)**:
   - Strict `hasAll` & `hasOnly` key allowlists prevent shadow field injection (`role`, `isAdmin`, etc.).
   - `uid` in every document must strictly equal `request.auth.uid`.
   - `CartItem.quantity` bounded `1..20`, `CartItem.price > 0`, bounded string sizes.
   - `Order.items` is a strictly bounded array (`1..50` elements, `items[0] is map`), `Order.status == 'Confirmed'`, `paymentMethod in ['cod', 'card']`.
5. **Temporal & Immutability Integrity**:
   - `createdAt == request.time` on `create`; `updatedAt == request.time` on `create`/`update`.
   - `orders` are strictly immutable (`allow update, delete: if false;`).

## 2. The "Dirty Dozen" + Subcollection Adversarial Payloads

| # | Attack Vector | Target Operation | Expected Rule Outcome |
|---|---|---|---|
| 1 | Unauthenticated profile read (`auth == null`) | `GET /users/uid_1` | `PERMISSION_DENIED` |
| 2 | Cross-user PII read (`auth.uid = uid_2`, target `/users/uid_1`) | `GET /users/uid_1` | `PERMISSION_DENIED` |
| 3 | Blanket collection listing (`LIST /users`) | `LIST /users` | `PERMISSION_DENIED` |
| 4 | Unverified email spoof (`email_verified == false`) | `CREATE /users/uid_1` | `PERMISSION_DENIED` |
| 5 | Identity spoofing (`data.uid = "uid_victim"` while `auth.uid = "uid_1"`) | `CREATE /users/uid_1` | `PERMISSION_DENIED` |
| 6 | Shadow RBAC injection (`{ ..., isAdmin: true, role: "admin" }`) | `CREATE /users/uid_1` | `PERMISSION_DENIED` |
| 7 | Path ID poisoning (`userId = "bad/../../id"` or >128 chars) | `CREATE /users/...` | `PERMISSION_DENIED` |
| 8 | Oversized `fullName` (> 120 chars) | `CREATE /users/uid_1` | `PERMISSION_DENIED` |
| 9 | Value poisoning (`email: 12345` non-string type) | `UPDATE /users/uid_1` | `PERMISSION_DENIED` |
| 10 | Immutable field tampering (`createdAt` or `uid` mutated on update) | `UPDATE /users/uid_1` | `PERMISSION_DENIED` |
| 11 | Client-forged timestamp (`createdAt != request.time`) | `CREATE /users/uid_1` | `PERMISSION_DENIED` |
| 12 | Missing required field (`fullName` omitted on create) | `CREATE /users/uid_1` | `PERMISSION_DENIED` |
| 13 | Cross-account cart item write (`auth.uid = uid_2`, target `/users/uid_1/cartItems/...`) | `CREATE /users/uid_1/cartItems/p1` | `PERMISSION_DENIED` |
| 14 | Cart quantity overflow (`quantity: 999`) or negative price (`price: -5`) | `CREATE /users/uid_1/cartItems/p1` | `PERMISSION_DENIED` |
| 15 | Cross-account order read or list (`auth.uid = uid_2`, target `/users/uid_1/orders`) | `LIST /users/uid_1/orders` | `PERMISSION_DENIED` |
| 16 | Order tampering or deletion after checkout (`UPDATE` or `DELETE /users/uid_1/orders/ord_1`) | `UPDATE /users/uid_1/orders/ord_1` | `PERMISSION_DENIED` |
