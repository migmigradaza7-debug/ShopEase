import React from "react";
import type { Metadata } from "next";
import { WelcomeLandingClient } from "@/components/WelcomeLandingClient";

export const metadata: Metadata = {
  title: "Welcome | ShopEase",
  description:
    "Your personalized ShopEase member welcome landing page showcasing new arrivals and saved bag status.",
};

export default function WelcomePage() {
  return <WelcomeLandingClient />;
}
