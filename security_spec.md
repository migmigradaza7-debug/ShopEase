# ShopEase Security Specification (Phase 0)

## 1. Data Invariants

1. **Default-Deny Baseline**: Every Firestore path outside explicit allow blocks is denied (`allow read, write: if false;`).
2. **Strict Ownership & PII Isolation (`/users/{userId}`)**:
   - `get`, `create`, `update`, and `delete` are permitted ONLY when `request.auth != null`, `request.auth.uid == userId`, and `request.auth.token.email_verified == true`.
   - `list` is permanently denied (`allow list: if false;`) to prevent user directory enumeration and PII scraping.
3. **Path Variable Hardening**: `{userId}` must satisfy `isValidId(userId)` (`id is string && id.size() >= 1 && id.size() <= 128 && id.matches('^[a-zA-Z0-9_\\-]+$')`).
4. **Validation Blueprint (`isValidUserProfile`)**:
   - Required fields: `uid`, `fullName`, `email`, `createdAt`, `updatedAt`.
   - Allowed fields: `uid`, `fullName`, `email`, `photoURL`, `createdAt`, `updatedAt` (no shadow fields such as `role` or `isAdmin`).
   - `uid` must strictly equal `request.auth.uid`.
   - String lengths bounded (`fullName` 1..120, `email` 3..254, `photoURL` <= 500).
5. **Temporal & Immutability Integrity**:
   - `createdAt == request.time` and `updatedAt == request.time` on `create`.
   - `uid == existing().uid` and `createdAt == existing().createdAt` (immutable), `updatedAt == request.time`, and `affectedKeys().hasOnly(['fullName', 'email', 'photoURL', 'updatedAt'])` on `update`.

## 2. The "Dirty Dozen" Adversarial Payloads

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
