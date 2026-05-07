"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Search, Bell, Mail, Heart } from "lucide-react";
import type { MeResponse } from "../../interfaces";

import VerificationGate from "../ui/VerificationGate";

interface BuyerNavbarProps {
  session: MeResponse | null;
}

export default function BuyerNavbar({ session }: BuyerNavbarProps) {
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
      className="sticky top-0 z-50 w-full border-b border-neutral-200 bg-white/80 backdrop-blur-xl shadow-sm"
    >
      {/* ── Top Row ── */}
      <div className="max-w-[1400px] mx-auto px-6 h-[72px] flex items-center gap-8">

        {/* Logo */}
        <Link href="/browse" className="flex-shrink-0">
          <span className="text-2xl font-bold tracking-tighter text-neutral-900">
            jobme.
          </span>
        </Link>

        {/* Search Bar */}
        <div className="flex-1 max-w-2xl">
          <form
            onSubmit={handleSearch}
            className="flex items-center w-full h-11 bg-neutral-100 border border-neutral-200 rounded-full"
          >
            <input
              type="text"
              placeholder="What service are you looking for today?"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1 h-full px-5 outline-none text-sm bg-transparent text-neutral-900 placeholder:text-neutral-400"
            />
            <button
              type="submit"
              className="h-full px-5 flex items-center justify-center flex-shrink-0 bg-neutral-900 rounded-r-full text-white hover:bg-neutral-800 transition-colors"
            >
              <Search className="w-4 h-4" />
            </button>
          </form>
        </div>

        {/* Right side */}
        <div className="flex items-center gap-5 ml-auto flex-shrink-0">
          {user ? (
            <>
              <div className="flex items-center gap-4 text-neutral-400">
                <button className="relative hover:text-neutral-900 transition-colors">
                  <Bell className="w-5 h-5" />
                  <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white" />
                </button>
                <Link href="/chats" className="hover:text-neutral-900 transition-colors">
                  <Mail className="w-5 h-5" />
                </Link>
                <Link href="/saved" className="group hover:text-red-500 transition-colors">
                  <Heart className="w-5 h-5 group-hover:fill-red-500" />
                </Link>
              </div>

              <Link
                href="/orders-to-buy"
                className="text-sm font-semibold text-neutral-500 hover:text-neutral-900 transition-colors"
              >
                Orders
              </Link>

              {isSeller ? (
                user.idVerified ? (
                  <button
                    onClick={() => {
                      window.localStorage.setItem("jobme.mode", "seller");
                      router.push("/seller-dashboard");
                    }}
                    className="px-4 py-2 text-xs font-semibold rounded-full border border-neutral-200 hover:bg-neutral-50 transition-colors"
                  >
                    Switch to Selling
                  </button>
                ) : (
                  <VerificationGate isLocked={true}>
                    <button
                      className="px-4 py-2 text-xs font-semibold rounded-full bg-neutral-900 text-white hover:bg-neutral-800 transition-colors"
                    >
                      Become a Seller
                    </button>
                  </VerificationGate>
                )
              ) : (
                <Link
                  href="/become-a-seller"
                  className="px-4 py-2 text-xs font-semibold rounded-full bg-neutral-900 text-white hover:bg-neutral-800 transition-colors"
                >
                  Become a Seller
                </Link>
              )}

              {/* Avatar */}
              <Link
                href="/profile"
                className="block w-9 h-9 rounded-full overflow-hidden flex-shrink-0 border border-neutral-200 hover:border-neutral-900 transition-colors"
              >
                <img
                  src={user.pfp || "https://res.cloudinary.com/dztptq6q1/image/upload/v1756046508/user_rencds.png"}
                  alt="Avatar"
                  className="w-full h-full object-cover"
                />
              </Link>
            </>
          ) : (
            <>
              <Link
                href="/login"
                className="text-sm font-semibold text-neutral-500 hover:text-neutral-900 transition-colors"
              >
                Sign In
              </Link>
              <Link href="/signup" className="px-5 py-2 rounded-full bg-neutral-900 text-white text-sm font-semibold hover:bg-neutral-800 transition-colors">
                Join
              </Link>
            </>
          )}
        </div>
      </div>

      <div className="border-t border-neutral-100">
        <div className="max-w-[1400px] mx-auto px-6 h-10 flex items-center overflow-x-auto no-scrollbar">
          <ul className="flex items-center gap-8 whitespace-nowrap">
            {categories.map((cat, idx) => (
              <li key={idx}>
                <Link
                  href={`/browse?category=${encodeURIComponent(cat.replace(" 🔥", ""))}`}
                  className="text-xs font-medium text-neutral-400 hover:text-neutral-900 transition-colors"
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
