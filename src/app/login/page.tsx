"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Eye, EyeOff } from "lucide-react";
import { useShop } from "@/components/ShopProvider";
import { validateLoginInput } from "@/lib/auth";

export default function LoginPage() {
  const router = useRouter();
  const { loginAccount, session, logoutAccount } = useShop();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [isRedirecting, setIsRedirecting] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const validation = validateLoginInput({ email, password });
    if (!validation.valid) {
      setError(validation.error || "Invalid credentials.");
      return;
    }

    const result = loginAccount(email, password);
    if (!result.ok) {
      setError(result.error || "Incorrect credentials.");
      return;
    }

    setError("");
    setIsRedirecting(true);
    router.push("/welcome");
  };

  if (session && !isRedirecting) {
    return (
      <section className="py-16 sm:py-24 bg-stone-50">
        <div className="max-w-md mx-auto px-4">
          <div className="p-8 rounded-2xl bg-white border border-stone-200 text-center space-y-5">
            <h1 className="font-display text-2xl font-bold text-stone-900">
              Signed in as {session.fullName}
            </h1>
            <p className="text-sm text-stone-600">{session.email}</p>
            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <Link
                href="/welcome"
                className="flex-1 py-2.5 px-4 rounded-lg bg-orange-600 text-white text-sm font-semibold hover:bg-orange-700 transition-colors"
              >
                Member Lounge
              </Link>
              <button
                type="button"
                onClick={logoutAccount}
                className="flex-1 py-2.5 px-4 rounded-lg border border-stone-300 text-sm font-medium text-stone-800 hover:bg-stone-100 transition-colors cursor-pointer"
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-16 sm:py-24 bg-stone-50">
      <div className="max-w-md mx-auto px-4">
        <div className="p-8 rounded-2xl bg-white border border-stone-200 space-y-6">
          <div className="text-center space-y-1.5">
            <h1 className="font-display text-2xl font-bold text-stone-900">
              Login to Your Account
            </h1>
            <p className="text-sm text-stone-600">
              Sign in with your ShopEase credentials.
            </p>
          </div>

          {error && (
            <p
              role="alert"
              className="p-3.5 rounded-lg bg-red-50 border border-red-200 text-sm text-red-800"
            >
              {error}
            </p>
          )}

          <form onSubmit={handleSubmit} noValidate className="space-y-4">
            <div>
              <label
                htmlFor="login-email"
                className="block text-sm font-medium text-stone-800 mb-1.5"
              >
                Email Address
              </label>
              <input
                id="login-email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                className="w-full px-3.5 py-2.5 rounded-lg border border-stone-300 text-sm text-stone-900 focus:outline-none focus:ring-2 focus:ring-orange-600"
              />
            </div>

            <div>
              <label
                htmlFor="login-password"
                className="block text-sm font-medium text-stone-800 mb-1.5"
              >
                Password
              </label>
              <div className="relative">
                <input
                  id="login-password"
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="w-full pl-3.5 pr-11 py-2.5 rounded-lg border border-stone-300 text-sm text-stone-900 focus:outline-none focus:ring-2 focus:ring-orange-600"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 text-stone-500 hover:text-stone-900 cursor-pointer"
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4" aria-hidden="true" />
                  ) : (
                    <Eye className="w-4 h-4" aria-hidden="true" />
                  )}
                </button>
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3 px-4 min-h-[44px] rounded-lg bg-orange-600 text-white text-sm font-semibold hover:bg-orange-700 transition-colors cursor-pointer"
            >
              Login
            </button>
          </form>

          <p className="text-center text-sm text-stone-600">
            Don&apos;t have an account?{" "}
            <Link
              href="/signup"
              className="font-semibold text-orange-700 hover:underline"
            >
              Sign Up
            </Link>
          </p>
        </div>
      </div>
    </section>
  );
}
