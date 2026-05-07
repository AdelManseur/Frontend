"use client";

import React from "react";
import { Smartphone, Download, ShieldCheck } from "lucide-react";

// ─── PLACEHOLDER ─────────────────────────────────────────────────────────────
// Replace this URL with the real download link when ready.
const APP_DOWNLOAD_URL = "#";
// ─────────────────────────────────────────────────────────────────────────────

export default function VerifyIdentityPage() {
  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center p-6 bg-white text-neutral-900"
    >
      <div className="relative z-10 bg-white border border-neutral-100 rounded-[2.5rem] shadow-2xl shadow-neutral-200/50 max-w-md w-full p-10 text-center">
        {/* Icon */}
        <div
          className="w-24 h-24 rounded-2xl mx-auto mb-8 flex items-center justify-center bg-neutral-50 text-neutral-900 border border-neutral-100 shadow-sm"
        >
          <Smartphone className="w-12 h-12" />
        </div>

        {/* Heading */}
        <h1 className="text-3xl font-bold mb-4 tracking-tight">Download the JobMe App</h1>
        <p className="text-[15px] mb-10 text-neutral-500 leading-relaxed">
          Identity verification is completed through the <strong className="text-neutral-900">JobMe mobile app</strong>.
          Download the app to verify your identity and unlock full access.
        </p>

        {/* Why section */}
        <div
          className="rounded-2xl p-6 mb-10 text-left space-y-4 bg-neutral-50 border border-neutral-100"
        >
          {[
            { icon: ShieldCheck, text: "Secure face & ID verification" },
            { icon: Smartphone, text: "Camera access for identity check" },
            { icon: Download,   text: "Available for iOS & Android" },
          ].map(({ icon: Icon, text }, i) => (
            <div key={i} className="flex items-center gap-4 text-[14px]">
              <div
                className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 bg-neutral-200 text-neutral-700"
              >
                <Icon className="w-4 h-4" />
              </div>
              <span className="text-neutral-600 font-medium">{text}</span>
            </div>
          ))}
        </div>

        {/* CTA */}
        <a
          href={APP_DOWNLOAD_URL}
          className="flex items-center justify-center gap-3 w-full py-4 rounded-full font-bold text-[16px] text-white bg-neutral-900 hover:bg-neutral-800 transition-all active:scale-[0.98] shadow-lg shadow-neutral-900/10"
        >
          <Smartphone className="w-5 h-5" />
          Get the App
        </a>

        <p className="mt-6 text-[12px] text-neutral-400 font-medium">
          Already verified? Refresh your browser session.
        </p>
      </div>
    </div>
  );
}
