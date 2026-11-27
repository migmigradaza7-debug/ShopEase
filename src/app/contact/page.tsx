"use client";

import React, { useState } from "react";
import { CheckCircle2 } from "lucide-react";
import { validateContactInput } from "@/lib/auth";

export default function ContactPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [submittedName, setSubmittedName] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const validation = validateContactInput({ name, email, message });
    if (!validation.valid) {
      setError(validation.error || "Please check your entries.");
      return;
    }

    setError("");
    setSubmittedName(name.trim());
    setName("");
    setEmail("");
    setMessage("");
  };

  return (
    <section className="py-14 sm:py-20 bg-stone-50">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 grid grid-cols-1 lg:grid-cols-12 gap-10">
        <div className="lg:col-span-5 space-y-6">
          <div>
            <p className="text-xs font-medium uppercase tracking-wider text-stone-500">
              Support
            </p>
            <h1 className="mt-2 font-display text-3xl sm:text-4xl font-bold text-stone-900 tracking-tight">
              Contact Us
            </h1>
            <p className="mt-3 text-base text-stone-600 leading-relaxed">
              We are here to help. Get in touch for questions, support, or
              feedback.
            </p>
          </div>

          <div className="p-6 rounded-xl bg-white border border-stone-200 space-y-4">
            <h2 className="font-display text-base font-semibold text-stone-900">
              Customer Service
            </h2>
            <dl className="space-y-3 text-sm">
              <div>
                <dt className="text-xs text-stone-500">Email</dt>
                <dd className="font-medium text-stone-900">
                  support@shopease.com
                </dd>
              </div>
              <div>
                <dt className="text-xs text-stone-500">Phone</dt>
                <dd className="font-medium text-stone-900 tabular-nums">
                  09687368011
                </dd>
              </div>
              <div>
                <dt className="text-xs text-stone-500">Address</dt>
                <dd className="font-medium text-stone-900">
                  Davao City, Philippines
                </dd>
              </div>
            </dl>
          </div>
        </div>

        <div className="lg:col-span-7">
          <div className="p-6 sm:p-8 rounded-2xl bg-white border border-stone-200">
            {submittedName && (
              <div
                role="status"
                className="mb-6 p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-950 flex items-start gap-3"
              >
                <CheckCircle2
                  className="w-5 h-5 text-emerald-700 shrink-0 mt-0.5"
                  aria-hidden="true"
                />
                <div className="text-sm">
                  <p className="font-semibold">Message received</p>
                  <p className="text-emerald-800 mt-0.5">
                    Thank you, {submittedName}. Our customer service team will
                    reply to your email shortly.
                  </p>
                </div>
              </div>
            )}

            {error && (
              <p
                role="alert"
                className="mb-5 p-3.5 rounded-lg bg-red-50 border border-red-200 text-sm text-red-800"
              >
                {error}
              </p>
            )}

            <form onSubmit={handleSubmit} noValidate className="space-y-5">
              <div>
                <label
                  htmlFor="contact-name"
                  className="block text-sm font-medium text-stone-800 mb-1.5"
                >
                  Full Name
                </label>
                <input
                  id="contact-name"
                  name="name"
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter your full name"
                  className="w-full px-3.5 py-2.5 rounded-lg border border-stone-300 bg-white text-sm text-stone-900 focus:outline-none focus:ring-2 focus:ring-orange-600"
                />
              </div>

              <div>
                <label
                  htmlFor="contact-email"
                  className="block text-sm font-medium text-stone-800 mb-1.5"
                >
                  Email Address
                </label>
                <input
                  id="contact-email"
                  name="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="w-full px-3.5 py-2.5 rounded-lg border border-stone-300 bg-white text-sm text-stone-900 focus:outline-none focus:ring-2 focus:ring-orange-600"
                />
              </div>

              <div>
                <label
                  htmlFor="contact-message"
                  className="block text-sm font-medium text-stone-800 mb-1.5"
                >
                  Message
                </label>
                <textarea
                  id="contact-message"
                  name="message"
                  rows={5}
                  required
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="How can we help you?"
                  className="w-full px-3.5 py-2.5 rounded-lg border border-stone-300 bg-white text-sm text-stone-900 focus:outline-none focus:ring-2 focus:ring-orange-600"
                />
              </div>

              <button
                type="submit"
                className="w-full sm:w-auto px-6 py-3 min-h-[44px] rounded-lg bg-orange-600 text-white text-sm font-semibold hover:bg-orange-700 transition-colors cursor-pointer"
              >
                Send Message
              </button>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}
