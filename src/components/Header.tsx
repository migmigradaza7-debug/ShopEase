"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, ShoppingBag, X } from "lucide-react";
import { useShop } from "./ShopProvider";

export function Header() {
  const pathname = usePathname();
  const { summary, openCart, session, logoutAccount } = useShop();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { href: "/", label: "Home" },
    { href: "/shop", label: "Shop" },
    { href: "/about", label: "About" },
    { href: "/contact", label: "Contact" },
  ];

  const isActive = (href: string) => {
    if (href === "/") return pathname === "/";
    if (href === "/shop") {
      return pathname === "/shop" || pathname.startsWith("/products");
    }
    return pathname === href;
  };

  return (
    <header className="sticky top-0 z-40 bg-stone-50/95 backdrop-blur-sm border-b border-stone-200">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-8">
        {/* Zone 1: Single-element Brand Wordmark */}
        <Link
          href="/"
          className="font-display text-xl font-bold tracking-tight text-stone-900 whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-600 rounded"
        >
          ShopEase
        </Link>

        {/* Zone 2: Concise single-line navigation links */}
        <nav
          aria-label="Primary navigation"
          className="hidden md:flex items-center gap-7 text-sm font-medium text-stone-600"
        >
          {navLinks.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`whitespace-nowrap shrink-0 py-1 border-b-2 transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-600 rounded-sm ${
                isActive(item.href)
                  ? "text-stone-900 border-orange-600"
                  : "border-transparent hover:text-stone-900 hover:border-stone-300"
              }`}
            >
              {item.label}
            </Link>
          ))}
          {session ? (
            <button
              type="button"
              onClick={logoutAccount}
              title={`Signed in as ${session.email}`}
              className="whitespace-nowrap shrink-0 py-1 border-b-2 border-transparent text-stone-700 hover:text-orange-700 transition-colors duration-150 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-600 rounded-sm"
            >
              Sign Out ({session.fullName.split(" ")[0]})
            </button>
          ) : (
            <Link
              href="/login"
              className={`whitespace-nowrap shrink-0 py-1 border-b-2 transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-600 rounded-sm ${
                pathname === "/login" || pathname === "/signup"
                  ? "text-stone-900 border-orange-600"
                  : "border-transparent hover:text-stone-900 hover:border-stone-300"
              }`}
            >
              Login
            </Link>
          )}
        </nav>

        {/* Zone 3: Single Primary Action (Shopping Bag) + Mobile Toggle */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={openCart}
            aria-label={`Open shopping bag, ${summary.itemCount} items`}
            className="inline-flex items-center gap-2 px-4 py-2 min-h-[40px] rounded-lg bg-stone-900 text-stone-50 text-sm font-medium hover:bg-stone-800 transition-colors duration-150 whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-600 focus-visible:ring-offset-2"
          >
            <ShoppingBag className="w-4 h-4 shrink-0" aria-hidden="true" />
            <span>Bag</span>
            <span className="tabular-nums text-stone-300">
              ({summary.itemCount})
            </span>
          </button>

          <button
            type="button"
            onClick={() => setMobileMenuOpen((prev) => !prev)}
            aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
            aria-expanded={mobileMenuOpen}
            className="md:hidden inline-flex items-center justify-center w-11 h-11 rounded-lg border border-stone-200 bg-white text-stone-800 hover:bg-stone-100 transition-colors cursor-pointer"
          >
            {mobileMenuOpen ? (
              <X className="w-5 h-5" aria-hidden="true" />
            ) : (
              <Menu className="w-5 h-5" aria-hidden="true" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Navigation */}
      {mobileMenuOpen && (
        <nav
          aria-label="Mobile navigation"
          className="md:hidden border-t border-stone-200 bg-white px-4 py-3 flex flex-col gap-1"
        >
          {navLinks.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setMobileMenuOpen(false)}
              className="px-3 py-2.5 rounded-lg text-sm font-medium text-stone-700 hover:bg-stone-100 hover:text-stone-900"
            >
              {item.label}
            </Link>
          ))}
          {session ? (
            <button
              type="button"
              onClick={() => {
                logoutAccount();
                setMobileMenuOpen(false);
              }}
              className="text-left px-3 py-2.5 rounded-lg text-sm font-medium text-stone-700 hover:bg-stone-100 hover:text-orange-700"
            >
              Sign Out ({session.fullName})
            </button>
          ) : (
            <Link
              href="/login"
              onClick={() => setMobileMenuOpen(false)}
              className="px-3 py-2.5 rounded-lg text-sm font-medium text-stone-700 hover:bg-stone-100 hover:text-stone-900"
            >
              Login
            </Link>
          )}
        </nav>
      )}
    </header>
  );
}
