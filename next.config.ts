import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    unoptimized: true,
  },
  async redirects() {
    return [
      {
        source: "/index.html",
        destination: "/",
        permanent: true,
      },
      {
        source: "/about.html",
        destination: "/about",
        permanent: true,
      },
      {
        source: "/contact.html",
        destination: "/contact",
        permanent: true,
      },
      {
        source: "/login.html",
        destination: "/login",
        permanent: true,
      },
      {
        source: "/log%20in.html",
        destination: "/login",
        permanent: true,
      },
      {
        source: "/signup.html",
        destination: "/signup",
        permanent: true,
      },
      {
        source: "/product1.html",
        destination: "/products/classic-sneakers",
        permanent: true,
      },
      {
        source: "/product2.html",
        destination: "/products/wireless-headphones",
        permanent: true,
      },
      {
        source: "/product3.html",
        destination: "/products/smart-watch",
        permanent: true,
      },
      {
        source: "/product4.html",
        destination: "/products/leather-backpack",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
