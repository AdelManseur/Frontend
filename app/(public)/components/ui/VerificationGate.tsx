"use client";

import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
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
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!isLocked) return <>{children}</>;

  return (
    <>
      {/* Click interceptor wrapper */}
      <div
        className="contents"
        onClick={(e) => { e.preventDefault(); e.stopPropagation(); setOpen(true); }}
      >
        {children}
      </div>
      {/* Modal */}
      {open && mounted && createPortal(
        <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 bg-neutral-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-3xl max-w-sm w-full p-8 text-neutral-900 relative shadow-2xl border border-neutral-200/50">
            {/* Close */}
            <button
              onClick={() => setOpen(false)}
              className="absolute top-4 right-4 p-2 rounded-full hover:bg-neutral-100 transition-colors"
            >
              <X className="w-5 h-5 text-neutral-500" />
            </button>

            {/* Icon */}
            <div className="w-16 h-16 rounded-full mx-auto mb-6 flex items-center justify-center bg-neutral-100 text-neutral-900">
              <ShieldCheck className="w-8 h-8" />
            </div>

            <h2 className="text-xl font-bold tracking-tight text-center mb-2">Identity Verification Required</h2>
            <p className="text-sm text-center mb-8 text-neutral-500 leading-relaxed">
              You must verify your identity before you can buy or sell on JobMe.
              Verification is securely completed through the <strong className="text-neutral-900">JobMe mobile app</strong>.
            </p>

            {/* Steps */}
            <div className="rounded-2xl p-5 mb-8 bg-neutral-50 border border-neutral-100 space-y-4">
              {[
                { n: "1", text: "Download the JobMe app" },
                { n: "2", text: "Log in with your account" },
                { n: "3", text: "Complete ID verification" },
                { n: "4", text: "Come back and refresh" },
              ].map(({ n, text }) => (
                <div key={n} className="flex items-center gap-3 text-sm">
                  <span className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 bg-neutral-200 text-neutral-700">
                    {n}
                  </span>
                  <span className="text-neutral-600 font-medium">{text}</span>
                </div>
              ))}
            </div>

            {/* CTA */}
            <Link
              href="/verify-identity"
              className="flex items-center justify-center gap-2 w-full py-3.5 rounded-full font-bold text-sm text-white bg-neutral-900 hover:bg-neutral-800 transition-all active:scale-[0.98] shadow-lg shadow-neutral-900/10"
              onClick={() => setOpen(false)}
            >
              <Smartphone className="w-4 h-4" />
              Verify Identity
            </Link>
          </div>
        </div>,
        document.body
      )}
    </>
  );
}
