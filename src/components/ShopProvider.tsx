"use client";

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  useSyncExternalStore,
} from "react";
import { onAuthStateChanged } from "firebase/auth";
import {
  addCartItem,
  calculateCartSummary,
  CartItem,
  CartSummary,
  generateOrderNumber,
  getScopedStorageKeys,
  OrderRecord,
  removeCartItem,
  updateCartItemQuantity,
} from "@/lib/cart";
import type { Product } from "@/lib/products";
import { UserAccount, verifyCredentials } from "@/lib/auth";
import {
  auth,
  clearUserCartFirestore,
  createUserOrderAndClearCart,
  deleteUserCartItem,
  formatFirebaseAuthError,
  signInWithGooglePopup,
  signOutFirebase,
  subscribeUserCart,
  subscribeUserOrders,
  testConnection,
  upsertUserCartItem,
} from "@/lib/firebase";

export interface SessionUser {
  uid?: string;
  fullName: string;
  email: string;
  photoURL?: string;
  provider?: "firebase" | "local";
}

export type OrderReceipt = OrderRecord;

interface StoreSnapshot {
  cart: CartItem[];
  orders: OrderRecord[];
  users: UserAccount[];
  session: SessionUser | null;
}

const USERS_KEY = "shopease_users";
const SESSION_KEY = "shopease_session";
const STORE_EVENT = "shopease-store-updated";

const EMPTY_SNAPSHOT: StoreSnapshot = {
  cart: [],
  orders: [],
  users: [],
  session: null,
};

let cachedRawSignature = "";
let cachedSnapshot: StoreSnapshot = EMPTY_SNAPSHOT;

function readUsersFromStorage(): UserAccount[] {
  try {
    const rawUsers = localStorage.getItem(USERS_KEY);
    const parsed: UserAccount[] = rawUsers ? JSON.parse(rawUsers) : [];
    const legacyEmail = localStorage.getItem("userEmail");
    const legacyPassword = localStorage.getItem("userPassword");
    if (
      legacyEmail &&
      legacyPassword &&
      !parsed.some((u) => u.email.toLowerCase() === legacyEmail.toLowerCase())
    ) {
      parsed.push({
        fullName: legacyEmail.split("@")[0] || "ShopEase Member",
        email: legacyEmail,
        password: legacyPassword,
      });
    }
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function getStoreSnapshot(): StoreSnapshot {
  if (typeof window === "undefined") return EMPTY_SNAPSHOT;

  const rawSession = localStorage.getItem(SESSION_KEY) || "null";
  let session: SessionUser | null = null;
  try {
    const parsedSession = JSON.parse(rawSession);
    if (parsedSession && typeof parsedSession.email === "string") {
      session = parsedSession;
    }
  } catch {
    session = null;
  }

  const { cartKey, ordersKey } = getScopedStorageKeys(session?.email || null);
  const rawCart = localStorage.getItem(cartKey) || "[]";
  const rawOrders = ordersKey ? localStorage.getItem(ordersKey) || "[]" : "[]";
  const rawUsers = localStorage.getItem(USERS_KEY) || "[]";
  const rawLegacyEmail = localStorage.getItem("userEmail") || "";
  const rawLegacyPassword = localStorage.getItem("userPassword") || "";

  const signature = `${rawSession}|${cartKey}=${rawCart}|${ordersKey || "none"}=${rawOrders}|${rawUsers}|${rawLegacyEmail}|${rawLegacyPassword}`;
  if (signature === cachedRawSignature) {
    return cachedSnapshot;
  }

  let cart: CartItem[] = [];
  let orders: OrderRecord[] = [];
  try {
    const parsedCart = JSON.parse(rawCart);
    if (Array.isArray(parsedCart)) cart = parsedCart;
  } catch {
    cart = [];
  }
  try {
    const parsedOrders = JSON.parse(rawOrders);
    if (Array.isArray(parsedOrders)) orders = parsedOrders;
  } catch {
    orders = [];
  }

  cachedRawSignature = signature;
  cachedSnapshot = {
    cart,
    orders,
    users: readUsersFromStorage(),
    session,
  };
  return cachedSnapshot;
}

function getServerSnapshot(): StoreSnapshot {
  return EMPTY_SNAPSHOT;
}

function subscribeStore(onStoreChange: () => void): () => void {
  if (typeof window === "undefined") return () => {};
  const handler = () => onStoreChange();
  window.addEventListener("storage", handler);
  window.addEventListener(STORE_EVENT, handler);
  return () => {
    window.removeEventListener("storage", handler);
    window.removeEventListener(STORE_EVENT, handler);
  };
}

function emitStoreChange(): void {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event(STORE_EVENT));
  }
}

interface ShopContextValue {
  cart: CartItem[];
  orders: OrderRecord[];
  summary: CartSummary;
  isCartOpen: boolean;
  openCart: () => void;
  closeCart: () => void;
  addToCart: (product: Product, option: string, quantity?: number) => void;
  updateQuantity: (productId: string, option: string, quantity: number) => void;
  removeFromCart: (productId: string, option: string) => void;
  clearCart: () => void;
  placeOrder: (details: {
    customerName: string;
    address: string;
    phone: string;
    paymentMethod: "cod" | "card";
  }) => Promise<OrderRecord>;
  session: SessionUser | null;
  authReady: boolean;
  registerAccount: (account: UserAccount) => { ok: boolean; error?: string };
  loginAccount: (email: string, password: string) => { ok: boolean; error?: string };
  loginWithGoogle: () => Promise<{ ok: boolean; error?: string }>;
  logoutAccount: () => void;
}

const ShopContext = createContext<ShopContextValue | null>(null);

export function ShopProvider({ children }: { children: React.ReactNode }) {
  const snapshot = useSyncExternalStore(
    subscribeStore,
    getStoreSnapshot,
    getServerSnapshot,
  );
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [firebaseSession, setFirebaseSession] = useState<SessionUser | null>(null);
  const [firebaseCart, setFirebaseCart] = useState<CartItem[]>([]);
  const [firebaseOrders, setFirebaseOrders] = useState<OrderRecord[]>([]);
  const [authReady, setAuthReady] = useState(false);

  useEffect(() => {
    void testConnection();
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user && user.email) {
        setFirebaseSession({
          uid: user.uid,
          fullName:
            user.displayName ||
            user.email.split("@")[0] ||
            "ShopEase Member",
          email: user.email,
          photoURL: user.photoURL || undefined,
          provider: "firebase",
        });
      } else {
        setFirebaseSession(null);
        setFirebaseCart([]);
        setFirebaseOrders([]);
      }
      setAuthReady(true);
    });
    return () => unsubscribe();
  }, []);

  // Subscribe to Firestore cart and orders exclusively for the signed-in Firebase user
  useEffect(() => {
    if (!authReady || !firebaseSession?.uid) return;
    const uid = firebaseSession.uid;
    const unsubCart = subscribeUserCart(uid, (items) => {
      setFirebaseCart(items);
    });
    const unsubOrders = subscribeUserOrders(uid, (orders) => {
      setFirebaseOrders(orders);
    });
    return () => {
      unsubCart();
      unsubOrders();
    };
  }, [authReady, firebaseSession?.uid]);

  const firebaseUid = firebaseSession?.uid;

  const openCart = useCallback(() => setIsCartOpen(true), []);
  const closeCart = useCallback(() => setIsCartOpen(false), []);

  const addToCart = useCallback(
    (product: Product, option: string, quantity = 1) => {
      if (firebaseUid) {
        const nextList = addCartItem(firebaseCart, product, option, quantity);
        setFirebaseCart(nextList);
        const updatedItem = nextList.find(
          (i) => i.productId === product.id && i.option === (option || product.options[0]),
        );
        if (updatedItem) {
          void upsertUserCartItem(firebaseUid, updatedItem);
        }
        setIsCartOpen(true);
        return;
      }

      const current = getStoreSnapshot();
      const { cartKey } = getScopedStorageKeys(current.session?.email || null);
      const next = addCartItem(current.cart, product, option, quantity);
      localStorage.setItem(cartKey, JSON.stringify(next));
      emitStoreChange();
      setIsCartOpen(true);
    },
    [firebaseUid, firebaseCart],
  );

  const updateQuantity = useCallback(
    (productId: string, option: string, quantity: number) => {
      if (firebaseUid) {
        const nextList = updateCartItemQuantity(
          firebaseCart,
          productId,
          option,
          quantity,
        );
        setFirebaseCart(nextList);
        if (quantity <= 0) {
          void deleteUserCartItem(firebaseUid, productId, option);
        } else {
          const updatedItem = nextList.find(
            (i) => i.productId === productId && i.option === option,
          );
          if (updatedItem) {
            void upsertUserCartItem(firebaseUid, updatedItem);
          }
        }
        return;
      }

      const current = getStoreSnapshot();
      const { cartKey } = getScopedStorageKeys(current.session?.email || null);
      const next = updateCartItemQuantity(current.cart, productId, option, quantity);
      localStorage.setItem(cartKey, JSON.stringify(next));
      emitStoreChange();
    },
    [firebaseUid, firebaseCart],
  );

  const removeFromCart = useCallback(
    (productId: string, option: string) => {
      if (firebaseUid) {
        setFirebaseCart((prev) => removeCartItem(prev, productId, option));
        void deleteUserCartItem(firebaseUid, productId, option);
        return;
      }

      const current = getStoreSnapshot();
      const { cartKey } = getScopedStorageKeys(current.session?.email || null);
      const next = removeCartItem(current.cart, productId, option);
      localStorage.setItem(cartKey, JSON.stringify(next));
      emitStoreChange();
    },
    [firebaseUid],
  );

  const clearCart = useCallback(() => {
    if (firebaseUid) {
      const itemsToRemove = [...firebaseCart];
      setFirebaseCart([]);
      void clearUserCartFirestore(firebaseUid, itemsToRemove);
      return;
    }

    const current = getStoreSnapshot();
    const { cartKey } = getScopedStorageKeys(current.session?.email || null);
    localStorage.setItem(cartKey, JSON.stringify([]));
    emitStoreChange();
  }, [firebaseUid, firebaseCart]);

  const placeOrder = useCallback(
    async (details: {
      customerName: string;
      address: string;
      phone: string;
      paymentMethod: "cod" | "card";
    }): Promise<OrderRecord> => {
      const activeCart = firebaseUid
        ? firebaseCart
        : getStoreSnapshot().cart;
      const orderSummary = calculateCartSummary(activeCart);
      const nowMs = Date.now();
      const orderRecord: OrderRecord = {
        id: `order_${nowMs}_${Math.floor(Math.random() * 10000)}`,
        orderNumber: generateOrderNumber(nowMs),
        customerName: details.customerName.trim(),
        address: details.address.trim(),
        phone: details.phone.trim(),
        paymentMethod: details.paymentMethod,
        items: activeCart,
        subtotal: orderSummary.subtotal,
        shippingFee: orderSummary.shippingFee,
        total: orderSummary.total,
        status: "Confirmed",
        createdAtMs: nowMs,
        createdAt: new Date(nowMs).toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric",
        }),
      };

      if (firebaseUid) {
        await createUserOrderAndClearCart(
          firebaseUid,
          orderRecord,
          activeCart,
        );
        setFirebaseCart([]);
        setFirebaseOrders((prev) => [
          orderRecord,
          ...prev.filter((o) => o.id !== orderRecord.id),
        ]);
        return orderRecord;
      }

      const current = getStoreSnapshot();
      const { cartKey, ordersKey } = getScopedStorageKeys(
        current.session?.email || null,
      );
      if (ordersKey) {
        const nextOrders = [orderRecord, ...current.orders];
        localStorage.setItem(ordersKey, JSON.stringify(nextOrders));
      }
      localStorage.setItem(cartKey, JSON.stringify([]));
      emitStoreChange();
      return orderRecord;
    },
    [firebaseUid, firebaseCart],
  );

  const registerAccount = useCallback((account: UserAccount) => {
    const users = readUsersFromStorage();
    const normalizedEmail = account.email.trim().toLowerCase();
    const exists = users.some(
      (u) => u.email.trim().toLowerCase() === normalizedEmail,
    );
    if (exists) {
      return {
        ok: false,
        error: "An account with this email already exists. Please log in.",
      };
    }

    const updatedUsers: UserAccount[] = [
      ...users,
      {
        fullName: account.fullName.trim(),
        email: normalizedEmail,
        password: account.password,
      },
    ];
    localStorage.setItem(USERS_KEY, JSON.stringify(updatedUsers));
    localStorage.setItem("userEmail", normalizedEmail);
    localStorage.setItem("userPassword", account.password);
    emitStoreChange();
    return { ok: true };
  }, []);

  const loginAccount = useCallback((email: string, password: string) => {
    const users = readUsersFromStorage();
    const matched = verifyCredentials(users, email, password);
    if (!matched) {
      return {
        ok: false,
        error: "Incorrect email or password. Please check your credentials or sign up.",
      };
    }
    const nextSession: SessionUser = {
      fullName: matched.fullName,
      email: matched.email,
      provider: "local",
    };
    localStorage.setItem(SESSION_KEY, JSON.stringify(nextSession));
    emitStoreChange();
    return { ok: true };
  }, []);

  const loginWithGoogle = useCallback(async () => {
    try {
      const user = await signInWithGooglePopup();
      setFirebaseSession({
        uid: user.uid,
        fullName:
          user.displayName ||
          user.email?.split("@")[0] ||
          "ShopEase Member",
        email: user.email || "",
        photoURL: user.photoURL || undefined,
        provider: "firebase",
      });
      return { ok: true };
    } catch (error) {
      return { ok: false, error: formatFirebaseAuthError(error) };
    }
  }, []);

  const logoutAccount = useCallback(() => {
    localStorage.removeItem(SESSION_KEY);
    emitStoreChange();
    setFirebaseSession(null);
    setFirebaseCart([]);
    setFirebaseOrders([]);
    void signOutFirebase().catch(() => {
      // Ignore Firebase sign-out error if user was signed in locally
    });
  }, []);

  const activeSession: SessionUser | null =
    firebaseSession ??
    (snapshot.session
      ? { ...snapshot.session, provider: snapshot.session.provider ?? "local" }
      : null);

  const activeCart = firebaseSession?.uid ? firebaseCart : snapshot.cart;
  const activeOrders = firebaseSession?.uid
    ? firebaseOrders
    : activeSession
      ? snapshot.orders
      : [];
  const summary = calculateCartSummary(activeCart);

  return (
    <ShopContext.Provider
      value={{
        cart: activeCart,
        orders: activeOrders,
        summary,
        isCartOpen,
        openCart,
        closeCart,
        addToCart,
        updateQuantity,
        removeFromCart,
        clearCart,
        placeOrder,
        session: activeSession,
        authReady,
        registerAccount,
        loginAccount,
        loginWithGoogle,
        logoutAccount,
      }}
    >
      {children}
    </ShopContext.Provider>
  );
}

export function useShop(): ShopContextValue {
  const context = useContext(ShopContext);
  if (!context) {
    throw new Error("useShop must be used within a ShopProvider");
  }
  return context;
}
