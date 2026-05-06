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
      className="min-h-screen flex flex-col items-center justify-center p-6 text-white"
      style={{ background: "var(--jm-seller-bg)" }}
    >
      {/* Glow blob */}
      <div
        className="absolute w-96 h-96 rounded-full blur-3xl opacity-20 pointer-events-none"
        style={{ background: "var(--jm-violet)", top: "20%", left: "50%", transform: "translateX(-50%)" }}
      />

      <div className="relative z-10 glass-card-dark max-w-md w-full p-8 text-center">
        {/* Icon */}
        <div
          className="w-24 h-24 rounded-full mx-auto mb-6 flex items-center justify-center"
          style={{ background: "rgba(124,58,237,0.15)", border: "2px solid rgba(124,58,237,0.4)" }}
        >
          <Smartphone className="w-12 h-12" style={{ color: "var(--jm-violet)" }} />
        </div>

        {/* Heading */}
        <h1 className="text-2xl font-bold mb-3">Download the JobMe App</h1>
        <p className="text-[15px] mb-8" style={{ color: "rgba(255,255,255,0.65)" }}>
          Identity verification is only available through the <strong className="text-white">JobMe mobile app</strong>.
          Download the app to verify your identity and unlock buying &amp; selling.
        </p>

        {/* Why section */}
        <div
          className="rounded-xl p-4 mb-8 text-left space-y-3"
          style={{ background: "rgba(13,13,26,0.6)", border: "1px solid var(--jm-seller-border)" }}
        >
          {[
            { icon: ShieldCheck, text: "Secure face &amp; ID verification" },
            { icon: Smartphone, text: "Camera access required for selfies" },
            { icon: Download,   text: "Fast &amp; free download" },
          ].map(({ icon: Icon, text }, i) => (
            <div key={i} className="flex items-center gap-3 text-[14px]">
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
                style={{ background: "rgba(124,58,237,0.2)" }}
              >
                <Icon className="w-4 h-4" style={{ color: "var(--jm-violet)" }} />
              </div>
              <span style={{ color: "rgba(255,255,255,0.8)" }} dangerouslySetInnerHTML={{ __html: text }} />
            </div>
          ))}
        </div>

        {/* CTA */}
        <a
          href={APP_DOWNLOAD_URL}
          className="flex items-center justify-center gap-3 w-full py-4 rounded-2xl font-bold text-[16px] transition-all hover:brightness-110"
          style={{ background: "var(--jm-violet)", color: "white" }}
        >
          <Download className="w-5 h-5" />
          Download JobMe App
        </a>

        <p className="mt-4 text-[12px]" style={{ color: "rgba(255,255,255,0.35)" }}>
          Already verified on the app? Refresh your browser session.
        </p>
      </div>
    </div>
  );
}
