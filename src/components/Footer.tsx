import React from "react";
import Link from "next/link";

export function Footer() {
  return (
    <footer className="border-t border-stone-200 bg-stone-900 text-stone-300 mt-auto">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12 grid grid-cols-1 md:grid-cols-3 gap-8">
        <div>
          <p className="font-display text-lg font-bold text-white tracking-tight">
            ShopEase
          </p>
          <p className="mt-2 text-sm text-stone-400 max-w-xs leading-relaxed">
            Quality essentials for modern living — footwear, audio, wearables,
            and everyday carry curated for lasting value.
          </p>
        </div>

        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-stone-400">
            Explore
          </p>
          <ul className="mt-3 space-y-2 text-sm">
            <li>
              <Link href="/" className="hover:text-white transition-colors">
                Home
              </Link>
            </li>
            <li>
              <Link href="/shop" className="hover:text-white transition-colors">
                Shop Collection
              </Link>
            </li>
            <li>
              <Link href="/about" className="hover:text-white transition-colors">
                About Us
              </Link>
            </li>
            <li>
              <Link href="/contact" className="hover:text-white transition-colors">
                Contact
              </Link>
            </li>
            <li>
              <Link href="/login" className="hover:text-white transition-colors">
                Account Login
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-stone-400">
            Customer Service
          </p>
          <ul className="mt-3 space-y-2 text-sm text-stone-400">
            <li>Email: support@shopease.com</li>
            <li>Phone: 09687368011</li>
            <li>Address: Davao City, Philippines</li>
          </ul>
        </div>
      </div>

      <div className="border-t border-stone-800">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-5 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-stone-400">
          <p>&copy; 2025 ShopEase. All rights reserved.</p>
          <p>Free shipping on orders over $100.00</p>
        </div>
      </div>
    </footer>
  );
}
