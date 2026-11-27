"use client";

import { getApps, initializeApp } from "firebase/app";
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
  type User,
} from "firebase/auth";
import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocFromServer,
  getFirestore,
  onSnapshot,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  where,
  writeBatch,
  type Unsubscribe,
} from "firebase/firestore";
import firebaseConfig from "../../firebase-applet-config.json";
import { cartItemDocId, type CartItem, type OrderRecord } from "./cart";

const app = getApps().length > 0 ? getApps()[0] : initializeApp(firebaseConfig);

export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: "select_account" });

export enum OperationType {
  CREATE = "create",
  UPDATE = "update",
  DELETE = "delete",
  LIST = "list",
  GET = "get",
  WRITE = "write",
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

export function handleFirestoreError(
  error: unknown,
  operationType: OperationType,
  path: string | null,
): never {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo:
        auth.currentUser?.providerData?.map((provider) => ({
          providerId: provider.providerId,
          email: provider.email,
        })) || [],
    },
    operationType,
    path,
  };
  console.error("Firestore Error: ", JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

let connectionTested = false;

export async function testConnection(): Promise<void> {
  if (connectionTested) return;
  connectionTested = true;
  try {
    await getDocFromServer(doc(db, "test", "connection"));
  } catch (error) {
    if (
      error instanceof Error &&
      error.message.includes("the client is offline")
    ) {
      console.error("Please check your Firebase configuration.");
    }
  }
}

function sanitizeText(value: string, maxLength: number): string {
  return value.trim().slice(0, maxLength);
}

export async function syncUserProfile(user: User): Promise<void> {
  if (!user.uid || !user.email || !user.emailVerified) return;

  const userPath = `users/${user.uid}`;
  const userRef = doc(db, "users", user.uid);
  const fullName = sanitizeText(
    user.displayName || user.email.split("@")[0] || "ShopEase Member",
    120,
  );
  const email = sanitizeText(user.email.toLowerCase(), 254);
  const photoURL = user.photoURL ? sanitizeText(user.photoURL, 500) : "";

  let existingSnap;
  try {
    existingSnap = await getDoc(userRef);
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, userPath);
  }

  if (!existingSnap.exists()) {
    try {
      await setDoc(userRef, {
        uid: user.uid,
        fullName,
        email,
        ...(photoURL ? { photoURL } : {}),
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, userPath);
    }
  } else {
    try {
      await updateDoc(userRef, {
        fullName,
        email,
        ...(photoURL ? { photoURL } : {}),
        updatedAt: serverTimestamp(),
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, userPath);
    }
  }
}

export function subscribeUserCart(
  uid: string,
  onItems: (items: CartItem[]) => void,
): Unsubscribe {
  const path = `users/${uid}/cartItems`;
  const q = query(collection(db, "users", uid, "cartItems"), where("uid", "==", uid));
  return onSnapshot(
    q,
    (snapshot) => {
      const items: CartItem[] = snapshot.docs.map((docSnap) => {
        const data = docSnap.data();
        return {
          productId: String(data.productId || ""),
          slug: String(data.slug || ""),
          name: String(data.name || ""),
          price: Number(data.price || 0),
          image: String(data.image || ""),
          option: String(data.option || ""),
          quantity: Number(data.quantity || 1),
        };
      });
      onItems(items);
    },
    (error) => {
      handleFirestoreError(error, OperationType.LIST, path);
    },
  );
}

export async function upsertUserCartItem(
  uid: string,
  item: CartItem,
): Promise<void> {
  const currentUser = auth.currentUser;
  if (currentUser && currentUser.uid === uid) {
    await syncUserProfile(currentUser);
  }

  const docId = cartItemDocId(item.productId, item.option);
  const path = `users/${uid}/cartItems/${docId}`;
  const itemRef = doc(db, "users", uid, "cartItems", docId);

  try {
    await setDoc(itemRef, {
      uid,
      productId: sanitizeText(item.productId, 64),
      slug: sanitizeText(item.slug, 120),
      name: sanitizeText(item.name, 140),
      price: Number(item.price),
      image: sanitizeText(item.image, 300),
      option: sanitizeText(item.option, 80),
      quantity: Math.max(1, Math.min(20, Math.floor(item.quantity))),
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export async function deleteUserCartItem(
  uid: string,
  productId: string,
  option: string,
): Promise<void> {
  const docId = cartItemDocId(productId, option);
  const path = `users/${uid}/cartItems/${docId}`;
  try {
    await deleteDoc(doc(db, "users", uid, "cartItems", docId));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

export async function clearUserCartFirestore(
  uid: string,
  items: CartItem[],
): Promise<void> {
  if (items.length === 0) return;
  const path = `users/${uid}/cartItems`;
  const batch = writeBatch(db);
  for (const item of items) {
    const docId = cartItemDocId(item.productId, item.option);
    batch.delete(doc(db, "users", uid, "cartItems", docId));
  }
  try {
    await batch.commit();
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

export function subscribeUserOrders(
  uid: string,
  onOrders: (orders: OrderRecord[]) => void,
): Unsubscribe {
  const path = `users/${uid}/orders`;
  const q = query(collection(db, "users", uid, "orders"), where("uid", "==", uid));
  return onSnapshot(
    q,
    (snapshot) => {
      const orders: OrderRecord[] = snapshot.docs
        .map((docSnap) => {
          const data = docSnap.data();
          const createdAtMs = Number(data.createdAtMs || Date.now());
          return {
            id: docSnap.id,
            orderNumber: String(data.orderNumber || ""),
            customerName: String(data.customerName || ""),
            address: String(data.address || ""),
            phone: String(data.phone || ""),
            paymentMethod: data.paymentMethod === "card" ? ("card" as const) : ("cod" as const),
            items: Array.isArray(data.items) ? (data.items as CartItem[]) : [],
            subtotal: Number(data.subtotal || 0),
            shippingFee: Number(data.shippingFee || 0),
            total: Number(data.total || 0),
            status: "Confirmed" as const,
            createdAtMs,
            createdAt: new Date(createdAtMs).toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
              year: "numeric",
            }),
          };
        })
        .sort((a, b) => b.createdAtMs - a.createdAtMs);
      onOrders(orders);
    },
    (error) => {
      handleFirestoreError(error, OperationType.LIST, path);
    },
  );
}

export async function createUserOrderAndClearCart(
  uid: string,
  order: OrderRecord,
  cartItems: CartItem[],
): Promise<void> {
  const currentUser = auth.currentUser;
  if (currentUser && currentUser.uid === uid) {
    await syncUserProfile(currentUser);
  }

  const orderPath = `users/${uid}/orders/${order.id}`;
  const batch = writeBatch(db);
  const orderRef = doc(db, "users", uid, "orders", order.id);

  batch.set(orderRef, {
    uid,
    orderNumber: sanitizeText(order.orderNumber, 32),
    customerName: sanitizeText(order.customerName, 120),
    address: sanitizeText(order.address, 400),
    phone: sanitizeText(order.phone, 40),
    paymentMethod: order.paymentMethod,
    items: order.items.slice(0, 50).map((item) => ({
      productId: sanitizeText(item.productId, 64),
      slug: sanitizeText(item.slug, 120),
      name: sanitizeText(item.name, 140),
      price: Number(item.price),
      image: sanitizeText(item.image, 300),
      option: sanitizeText(item.option, 80),
      quantity: Math.max(1, Math.min(20, Math.floor(item.quantity))),
    })),
    subtotal: Number(order.subtotal),
    shippingFee: Number(order.shippingFee),
    total: Number(order.total),
    status: "Confirmed",
    createdAtMs: Math.max(1, Math.floor(order.createdAtMs)),
    createdAt: serverTimestamp(),
  });

  for (const item of cartItems) {
    const itemDocId = cartItemDocId(item.productId, item.option);
    batch.delete(doc(db, "users", uid, "cartItems", itemDocId));
  }

  try {
    await batch.commit();
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, orderPath);
  }
}

export function formatFirebaseAuthError(error: unknown): string {
  const code =
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    typeof (error as { code?: unknown }).code === "string"
      ? (error as { code: string }).code
      : "";

  switch (code) {
    case "auth/popup-closed-by-user":
    case "auth/cancelled-popup-request":
      return "Google sign-in was cancelled. Please try again.";
    case "auth/popup-blocked":
      return "Your browser blocked the sign-in popup. Please allow popups and try again.";
    case "auth/network-request-failed":
      return "Network error while contacting Firebase Authentication. Please try again.";
    case "auth/unauthorized-domain": {
      const host =
        typeof window !== "undefined" ? window.location.hostname : "this domain";
      return `Domain "${host}" is not yet in Firebase Authorized Domains (project ${firebaseConfig.projectId}). Add it in Firebase Console → Authentication → Settings → Authorized domains, or sign in with your email account below.`;
    }
    default:
      return error instanceof Error
        ? error.message
        : "Unable to sign in with Firebase Authentication.";
  }
}

export async function signInWithGooglePopup(): Promise<User> {
  const credential = await signInWithPopup(auth, googleProvider);
  try {
    await syncUserProfile(credential.user);
  } catch (err) {
    console.error("Profile sync failed after Google sign-in:", err);
  }
  return credential.user;
}

export async function signOutFirebase(): Promise<void> {
  await signOut(auth);
}
