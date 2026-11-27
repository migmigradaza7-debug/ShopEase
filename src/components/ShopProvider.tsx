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
  removeCartItem,
  updateCartItemQuantity,
} from "@/lib/cart";
import type { Product } from "@/lib/products";
import { UserAccount, verifyCredentials } from "@/lib/auth";
import {
  auth,
  formatFirebaseAuthError,
  signInWithGooglePopup,
  signOutFirebase,
  testConnection,
} from "@/lib/firebase";

export interface SessionUser {
  uid?: string;
  fullName: string;
  email: string;
  photoURL?: string;
  provider?: "firebase" | "local";
}

export interface OrderReceipt {
  orderNumber: string;
  customerName: string;
  address: string;
  phone: string;
  paymentMethod: "cod" | "card";
  items: CartItem[];
  total: number;
  createdAt: string;
}

interface StoreSnapshot {
  cart: CartItem[];
  users: UserAccount[];
  session: SessionUser | null;
}

const CART_KEY = "shopease_cart";
const USERS_KEY = "shopease_users";
const SESSION_KEY = "shopease_session";
const STORE_EVENT = "shopease-store-updated";

const EMPTY_SNAPSHOT: StoreSnapshot = {
  cart: [],
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
  const rawCart = localStorage.getItem(CART_KEY) || "[]";
  const rawUsers = localStorage.getItem(USERS_KEY) || "[]";
  const rawLegacyEmail = localStorage.getItem("userEmail") || "";
  const rawLegacyPassword = localStorage.getItem("userPassword") || "";
  const rawSession = localStorage.getItem(SESSION_KEY) || "null";
  const signature = `${rawCart}|${rawUsers}|${rawLegacyEmail}|${rawLegacyPassword}|${rawSession}`;

  if (signature === cachedRawSignature) {
    return cachedSnapshot;
  }

  let cart: CartItem[] = [];
  let session: SessionUser | null = null;
  try {
    const parsedCart = JSON.parse(rawCart);
    if (Array.isArray(parsedCart)) cart = parsedCart;
  } catch {
    cart = [];
  }
  try {
    const parsedSession = JSON.parse(rawSession);
    if (parsedSession && typeof parsedSession.email === "string") {
      session = parsedSession;
    }
  } catch {
    session = null;
  }

  cachedRawSignature = signature;
  cachedSnapshot = {
    cart,
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
  }) => OrderReceipt;
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
      }
      setAuthReady(true);
    });
    return () => unsubscribe();
  }, []);

  const openCart = useCallback(() => setIsCartOpen(true), []);
  const closeCart = useCallback(() => setIsCartOpen(false), []);

  const addToCart = useCallback(
    (product: Product, option: string, quantity = 1) => {
      const current = getStoreSnapshot().cart;
      const next = addCartItem(current, product, option, quantity);
      localStorage.setItem(CART_KEY, JSON.stringify(next));
      emitStoreChange();
      setIsCartOpen(true);
    },
    [],
  );

  const updateQuantity = useCallback(
    (productId: string, option: string, quantity: number) => {
      const current = getStoreSnapshot().cart;
      const next = updateCartItemQuantity(current, productId, option, quantity);
      localStorage.setItem(CART_KEY, JSON.stringify(next));
      emitStoreChange();
    },
    [],
  );

  const removeFromCart = useCallback((productId: string, option: string) => {
    const current = getStoreSnapshot().cart;
    const next = removeCartItem(current, productId, option);
    localStorage.setItem(CART_KEY, JSON.stringify(next));
    emitStoreChange();
  }, []);

  const clearCart = useCallback(() => {
    localStorage.setItem(CART_KEY, JSON.stringify([]));
    emitStoreChange();
  }, []);

  const placeOrder = useCallback(
    (details: {
      customerName: string;
      address: string;
      phone: string;
      paymentMethod: "cod" | "card";
    }): OrderReceipt => {
      const current = getStoreSnapshot().cart;
      const orderSummary = calculateCartSummary(current);
      const receipt: OrderReceipt = {
        orderNumber: generateOrderNumber(),
        customerName: details.customerName.trim(),
        address: details.address.trim(),
        phone: details.phone.trim(),
        paymentMethod: details.paymentMethod,
        items: current,
        total: orderSummary.total,
        createdAt: new Date().toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric",
        }),
      };
      localStorage.setItem(CART_KEY, JSON.stringify([]));
      emitStoreChange();
      return receipt;
    },
    [],
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
    void signOutFirebase().catch(() => {
      // Ignore Firebase sign-out error if user was signed in via local fallback
    });
  }, []);

  const summary = calculateCartSummary(snapshot.cart);
  const activeSession: SessionUser | null =
    firebaseSession ??
    (snapshot.session
      ? { ...snapshot.session, provider: snapshot.session.provider ?? "local" }
      : null);

  return (
    <ShopContext.Provider
      value={{
        cart: snapshot.cart,
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
