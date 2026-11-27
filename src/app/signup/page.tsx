"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { LogIn } from "lucide-react";
import { useShop } from "@/components/ShopProvider";
import { validateSignupInput } from "@/lib/auth";

export default function SignupPage() {
  const router = useRouter();
  const { registerAccount, loginWithGoogle } = useShop();

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

  const handleGoogleSignup = async () => {
    setError("");
    setIsGoogleLoading(true);
    const result = await loginWithGoogle();
    setIsGoogleLoading(false);
    if (!result.ok) {
      setError(result.error || "Unable to sign in with Google.");
      return;
    }
    router.push("/welcome");
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const validation = validateSignupInput({
      fullName,
      email,
      password,
      confirmPassword,
    });
    if (!validation.valid) {
      setError(validation.error || "Please verify your details.");
      return;
    }

    const result = registerAccount({ fullName, email, password });
    if (!result.ok) {
      setError(result.error || "Could not create account.");
      return;
    }

    setError("");
    router.push("/login");
  };

  return (
    <section className="py-16 sm:py-24 bg-stone-50">
      <div className="max-w-md mx-auto px-4">
        <div className="p-8 rounded-2xl bg-white border border-stone-200 space-y-6">
          <div className="text-center space-y-1.5">
            <h1 className="font-display text-2xl font-bold text-stone-900">
              Create an Account
            </h1>
            <p className="text-sm text-stone-600">
              Continue with Google or register a ShopEase account.
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

          <button
            type="button"
            onClick={handleGoogleSignup}
            disabled={isGoogleLoading}
            className="w-full py-3 px-4 min-h-[44px] rounded-lg border border-stone-300 bg-white text-stone-900 text-sm font-semibold hover:bg-stone-100 disabled:opacity-60 transition-colors inline-flex items-center justify-center gap-2.5 cursor-pointer"
          >
            <LogIn className="w-4 h-4 text-orange-700" aria-hidden="true" />
            <span>
              {isGoogleLoading
                ? "Connecting Google account..."
                : "Continue with Google"}
            </span>
          </button>

          <div className="relative flex items-center py-1">
            <div className="flex-grow border-t border-stone-200" />
            <span className="px-3 text-xs uppercase tracking-wider text-stone-400">
              or register with email
            </span>
            <div className="flex-grow border-t border-stone-200" />
          </div>

          <form onSubmit={handleSubmit} noValidate className="space-y-4">
            <div>
              <label
                htmlFor="signup-name"
                className="block text-sm font-medium text-stone-800 mb-1.5"
              >
                Full Name
              </label>
              <input
                id="signup-name"
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Enter your full name"
                className="w-full px-3.5 py-2.5 rounded-lg border border-stone-300 text-sm text-stone-900 focus:outline-none focus:ring-2 focus:ring-orange-600"
              />
            </div>

            <div>
              <label
                htmlFor="signup-email"
                className="block text-sm font-medium text-stone-800 mb-1.5"
              >
                Email Address
              </label>
              <input
                id="signup-email"
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
                htmlFor="signup-password"
                className="block text-sm font-medium text-stone-800 mb-1.5"
              >
                Password
              </label>
              <input
                id="signup-password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Create a password (min. 6 characters)"
                className="w-full px-3.5 py-2.5 rounded-lg border border-stone-300 text-sm text-stone-900 focus:outline-none focus:ring-2 focus:ring-orange-600"
              />
            </div>

            <div>
              <label
                htmlFor="signup-confirm-password"
                className="block text-sm font-medium text-stone-800 mb-1.5"
              >
                Confirm Password
              </label>
              <input
                id="signup-confirm-password"
                type="password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm your password"
                className="w-full px-3.5 py-2.5 rounded-lg border border-stone-300 text-sm text-stone-900 focus:outline-none focus:ring-2 focus:ring-orange-600"
              />
            </div>

            <button
              type="submit"
              className="w-full py-3 px-4 min-h-[44px] rounded-lg bg-orange-600 text-white text-sm font-semibold hover:bg-orange-700 transition-colors cursor-pointer"
            >
              Sign Up
            </button>
          </form>

          <p className="text-center text-sm text-stone-600">
            Already have an account?{" "}
            <Link
              href="/login"
              className="font-semibold text-orange-700 hover:underline"
            >
              Login
            </Link>
          </p>
        </div>
      </div>
    </section>
  );
}
