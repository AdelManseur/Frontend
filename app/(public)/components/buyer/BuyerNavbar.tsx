"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Search, Bell, Mail, Heart } from "lucide-react";
import type { MeResponse } from "../../interfaces";

interface BuyerNavbarProps {
  session: MeResponse | null;
  setMode: (mode: "buyer" | "seller") => void;
}

export default function BuyerNavbar({ session, setMode }: BuyerNavbarProps) {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");

  const user = session?.logged ? session.user : null;
  const isSeller = user?.isSeller || false;

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    router.push(`/browse?q=${encodeURIComponent(searchQuery.trim())}`);
  };

  const categories = [
    "Trending 🔥",
    "Graphics & Design",
    "Programming & Tech",
    "Digital Marketing",
    "Video & Animation",
    "Writing & Translation",
    "Music & Audio",
    "Business",
    "Finance",
    "AI Services",
  ];

  return (
    <nav
      className="sticky top-0 z-50 w-full"
      style={{
        background: "rgba(248, 250, 252, 0.75)",
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
        borderBottom: "1px solid rgba(255,255,255,0.8)",
        boxShadow: "0 2px 24px rgba(124,58,237,0.06)",
      }}
    >
      {/* ── Top Row ── */}
      <div className="max-w-[1400px] mx-auto px-6 h-[72px] flex items-center gap-8">

        {/* Logo */}
        <Link href="/browse" className="flex-shrink-0">
          <span className="text-[26px] font-extrabold tracking-tight" style={{ color: "var(--jm-text)" }}>
            jobme
            <span style={{ color: "var(--jm-violet)" }}>.</span>
          </span>
        </Link>

        {/* Search Bar */}
        <div className="flex-1 max-w-2xl">
          <form
            onSubmit={handleSearch}
            className="flex items-center w-full h-[44px] overflow-hidden"
            style={{
              background: "rgba(255,255,255,0.8)",
              backdropFilter: "blur(12px)",
              WebkitBackdropFilter: "blur(12px)",
              border: "1px solid rgba(255,255,255,0.9)",
              borderRadius: "999px",
              boxShadow: "0 2px 16px rgba(124,58,237,0.08)",
            }}
          >
            <input
              type="text"
              placeholder="What service are you looking for today?"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1 h-full px-5 outline-none text-[14px] bg-transparent"
              style={{ color: "var(--jm-text)" }}
            />
            <button
              type="submit"
              className="h-full px-5 flex items-center justify-center flex-shrink-0 rounded-r-full"
              style={{
                background: "var(--jm-violet)",
                borderTopRightRadius: "999px",
                borderBottomRightRadius: "999px",
                minWidth: "52px",
              }}
            >
              <Search className="w-4 h-4 text-white" />
            </button>
          </form>
        </div>

        {/* Right side */}
        <div className="flex items-center gap-5 ml-auto flex-shrink-0">
          {user ? (
            <>
              <div className="flex items-center gap-4" style={{ color: "var(--jm-muted)" }}>
                <button className="relative hover:text-[#7C3AED] transition-colors">
                  <Bell className="w-5 h-5" />
                  <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-[#EC4899] rounded-full border-2 border-white/80" />
                </button>
                <Link href="/chats" className="hover:text-[#7C3AED] transition-colors">
                  <Mail className="w-5 h-5" />
                </Link>
                <Link href="/saved" className="hover:text-[#EC4899] transition-colors">
                  <Heart className="w-5 h-5" />
                </Link>
              </div>

              <Link
                href="/orders-to-buy"
                className="text-[14px] font-semibold transition-colors"
                style={{ color: "var(--jm-muted)" }}
                onMouseEnter={e => (e.currentTarget.style.color = "var(--jm-text)")}
                onMouseLeave={e => (e.currentTarget.style.color = "var(--jm-muted)")}
              >
                Orders
              </Link>

              {isSeller ? (
                <button
                  onClick={() => setMode("seller")}
                  className="grad-btn px-4 py-2 text-[13px]"
                  style={{ fontSize: "13px", padding: "6px 16px" }}
                >
                  Switch to Selling
                </button>
              ) : (
                <Link
                  href="/become-a-seller"
                  className="grad-btn px-4 py-2"
                  style={{ fontSize: "13px", padding: "6px 16px", display: "inline-block", textAlign: "center", textDecoration: "none" }}
                >
                  Become a Seller
                </Link>
              )}

              {/* Avatar */}
              <Link
                href="/profile"
                className="block w-9 h-9 rounded-full overflow-hidden flex-shrink-0"
                style={{
                  border: "2px solid var(--jm-violet)",
                }}
              >
                <img
                  src={user.pfp || "https://res.cloudinary.com/dztptq6q1/image/upload/v1756046508/user_rencds.png"}
                  alt="Avatar"
                  className="w-full h-full object-cover rounded-full"
                />
              </Link>
            </>
          ) : (
            <>
              <Link
                href="/login"
                className="text-[14px] font-semibold transition-colors"
                style={{ color: "var(--jm-muted)" }}
              >
                Sign In
              </Link>
              <Link href="/signup" className="grad-btn px-5 py-2 text-[14px]">
                Join
              </Link>
            </>
          )}
        </div>
      </div>

      {/* ── Categories ── */}
      <div style={{ borderTop: "1px solid rgba(124,58,237,0.08)" }}>
        <div className="max-w-[1400px] mx-auto px-6 h-[40px] flex items-center overflow-x-auto no-scrollbar">
          <ul className="flex items-center gap-7 whitespace-nowrap">
            {categories.map((cat, idx) => (
              <li key={idx}>
                <Link
                  href={`/browse?category=${encodeURIComponent(cat.replace(" 🔥", ""))}`}
                  className="text-[13px] font-medium pb-[9px] transition-all relative"
                  style={{ color: "var(--jm-muted)" }}
                  onMouseEnter={e => {
                    e.currentTarget.style.color = "var(--jm-violet)";
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.color = "var(--jm-muted)";
                  }}
                >
                  {cat}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </nav>
  );
}
