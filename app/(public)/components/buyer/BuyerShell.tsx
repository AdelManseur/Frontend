"use client";

import React from "react";
import BuyerNavbar from "./BuyerNavbar";
import ParticleCanvas from "../ui/ParticleCanvas";
import type { MeResponse } from "../../interfaces";

interface BuyerShellProps {
  children: React.ReactNode;
  session: MeResponse | null;
  setMode: (mode: "buyer" | "seller") => void;
}

export default function BuyerShell({ children, session, setMode }: BuyerShellProps) {
  return (
    <div className="relative min-h-screen flex flex-col overflow-x-hidden" style={{ background: "var(--jm-bg)", fontFamily: "var(--font-body, 'Plus Jakarta Sans', system-ui, sans-serif)" }}>

      {/* ── Cursor-reactive particles ── */}
      <ParticleCanvas count={65} mode="buyer" />

      {/* ── Animated mesh gradient orbs ── */}
      <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden" aria-hidden="true">
        {/* Violet orb top-left */}
        <div
          className="absolute -top-40 -left-40 w-[700px] h-[700px] rounded-full opacity-20"
          style={{
            background: "radial-gradient(circle, #7C3AED 0%, transparent 70%)",
            animation: "floatOrb1 18s ease-in-out infinite",
            filter: "blur(60px)",
          }}
        />
        {/* Pink orb top-right */}
        <div
          className="absolute -top-20 right-0 w-[500px] h-[500px] rounded-full opacity-15"
          style={{
            background: "radial-gradient(circle, #EC4899 0%, transparent 70%)",
            animation: "floatOrb2 24s ease-in-out infinite",
            filter: "blur(70px)",
          }}
        />
        {/* Violet orb bottom-right */}
        <div
          className="absolute bottom-0 right-1/4 w-[600px] h-[600px] rounded-full opacity-10"
          style={{
            background: "radial-gradient(circle, #7C3AED 0%, transparent 70%)",
            animation: "floatOrb3 20s ease-in-out infinite",
            filter: "blur(80px)",
          }}
        />
      </div>

      {/* ── Navbar (glass, sits above particles) ── */}
      <div className="relative z-50">
        <BuyerNavbar session={session} setMode={setMode} />
      </div>

      {/* ── Page content ── */}
      <main className="relative z-10 flex-1 w-full max-w-[1400px] mx-auto px-6 py-8">
        {children}
      </main>
    </div>
  );
}
