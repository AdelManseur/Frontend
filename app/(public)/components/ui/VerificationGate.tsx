"use client";

import React, { useState } from "react";
import { Smartphone, X, Download, ShieldCheck } from "lucide-react";
import Link from "next/link";

interface VerificationGateProps {
  /** Set to true when the user has idVerified = false */
  isLocked: boolean;
  /** The actual button/content that should trigger the action when verified */
  children: React.ReactNode;
}

/**
 * VerificationGate wraps any interactive element.
 * - If the user IS verified → renders children normally.
 * - If NOT verified → renders a lookalike disabled shell that opens a modal
 *   when clicked, directing the user to download the mobile app.
 */
export default function VerificationGate({ isLocked, children }: VerificationGateProps) {
  const [open, setOpen] = useState(false);

  if (!isLocked) return <>{children}</>;

  return (
    <>
      {/* Disabled wrapper — intercepts clicks */}
      <div
        className="relative cursor-not-allowed select-none"
        onClick={(e) => { e.preventDefault(); e.stopPropagation(); setOpen(true); }}
      >
        <div className="pointer-events-none opacity-50">{children}</div>
        {/* Lock overlay badge */}
        <div
          className="absolute inset-0 flex items-center justify-center rounded-xl"
          style={{ background: "rgba(13,13,26,0.3)" }}
        >
          <span
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[12px] font-bold"
            style={{ background: "rgba(239,68,68,0.2)", color: "#FCA5A5", border: "1px solid rgba(239,68,68,0.4)" }}
          >
            🔒 Verify to unlock
          </span>
        </div>
      </div>

      {/* Modal */}
      {open && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4" style={{ background: "rgba(0,0,0,0.7)" }}>
          <div
            className="glass-card-dark max-w-sm w-full p-6 text-white relative"
            style={{ border: "1px solid var(--jm-seller-border)" }}
          >
            {/* Close */}
            <button
              onClick={() => setOpen(false)}
              className="absolute top-4 right-4 p-1.5 rounded-full"
              style={{ background: "rgba(255,255,255,0.08)" }}
            >
              <X className="w-4 h-4" style={{ color: "rgba(255,255,255,0.6)" }} />
            </button>

            {/* Icon */}
            <div
              className="w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center"
              style={{ background: "rgba(124,58,237,0.15)", border: "2px solid rgba(124,58,237,0.4)" }}
            >
              <Smartphone className="w-8 h-8" style={{ color: "var(--jm-violet)" }} />
            </div>

            <h2 className="text-lg font-bold text-center mb-2">Identity Verification Required</h2>
            <p className="text-[13px] text-center mb-5" style={{ color: "rgba(255,255,255,0.6)" }}>
              You must verify your identity before you can buy or sell on JobMe.
              Verification is only available through the <strong className="text-white">JobMe mobile app</strong>.
            </p>

            {/* Steps */}
            <div
              className="rounded-xl p-4 mb-5 space-y-2"
              style={{ background: "rgba(13,13,26,0.6)", border: "1px solid var(--jm-seller-border)" }}
            >
              {[
                { n: "1", text: "Download the JobMe app" },
                { n: "2", text: "Log in with your account" },
                { n: "3", text: "Complete ID verification" },
                { n: "4", text: "Come back and refresh" },
              ].map(({ n, text }) => (
                <div key={n} className="flex items-center gap-3 text-[13px]">
                  <span
                    className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold flex-shrink-0"
                    style={{ background: "var(--jm-violet)" }}
                  >
                    {n}
                  </span>
                  <span style={{ color: "rgba(255,255,255,0.75)" }}>{text}</span>
                </div>
              ))}
            </div>

            {/* CTA */}
            <Link
              href="/verify-identity"
              className="flex items-center justify-center gap-2 w-full py-3 rounded-xl font-bold text-[14px] hover:brightness-110 transition-all"
              style={{ background: "var(--jm-violet)", color: "white" }}
              onClick={() => setOpen(false)}
            >
              <Download className="w-4 h-4" />
              Go to App Download
            </Link>
          </div>
        </div>
      )}
    </>
  );
}
