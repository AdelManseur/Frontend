"use client";

import React, { useState } from "react";
import SellerSidebar from "./SellerSidebar";
import SellerTopBar from "./SellerTopBar";
import ParticleCanvas from "../ui/ParticleCanvas";
import type { MeResponse } from "../../interfaces";

interface SellerShellProps {
  children: React.ReactNode;
  session: MeResponse | null;
}

export default function SellerShell({ children, session }: SellerShellProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div
      className="relative flex min-h-screen"
      style={{ background: "var(--jm-seller-bg)", fontFamily: "var(--font-body, 'Plus Jakarta Sans', system-ui, sans-serif)" }}
    >
      {/* ── Seller particles — brighter/denser ── */}
      <ParticleCanvas count={90} mode="seller" />      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-40 lg:hidden backdrop-blur-sm"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-50 transform transition-transform duration-300 lg:sticky lg:top-0 lg:h-screen lg:translate-x-0 ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}`}>
        <SellerSidebar session={session} />
      </div>

      {/* Main Content Area */}
      <div className="relative z-10 flex-1 flex flex-col min-w-0">
        <SellerTopBar session={session} onMenuClick={() => setSidebarOpen(true)} />
        <main className="flex-1 p-6 lg:p-8">
          <div className="max-w-[1400px] mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
