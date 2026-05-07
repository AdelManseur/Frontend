"use client";

import React from "react";
import BuyerNavbar from "./BuyerNavbar";
import ParticleCanvas from "../ui/ParticleCanvas";
import GlobalAIChat from "./GlobalAIChat";
import type { MeResponse } from "../../interfaces";

interface BuyerShellProps {
  children: React.ReactNode;
  session: MeResponse | null;
}

export default function BuyerShell({ children, session }: BuyerShellProps) {
  return (
    <div className="relative min-h-screen flex flex-col overflow-x-hidden" style={{ background: "var(--jm-bg)", fontFamily: "var(--font-body, 'Plus Jakarta Sans', system-ui, sans-serif)" }}>





      {/* ── Navbar (glass, sits above particles) ── */}
      <div className="relative z-50">
        <BuyerNavbar session={session} />
      </div>

      {/* ── Page content ── */}
      <main className="relative z-10 flex-1 w-full max-w-[1400px] mx-auto px-6 py-8">
        {children}
      </main>

      <GlobalAIChat />
    </div>
  );
}
