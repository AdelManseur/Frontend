"use client";

import React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Mail, HelpCircle, Menu } from "lucide-react";
import type { MeResponse } from "../../interfaces";
import NotificationBell from "../ui/NotificationBell";

interface SellerTopBarProps {
  session: MeResponse | null;
  title?: string;
  onMenuClick?: () => void;
}

export default function SellerTopBar({ session, title = "Dashboard", onMenuClick }: SellerTopBarProps) {
  const router = useRouter();
  const user = session?.logged ? session.user : null;

  return (
    <header
      className="h-[65px] flex items-center justify-between px-6 flex-shrink-0 sticky top-0 z-10"
      style={{
        background: "rgba(13,13,26,0.75)",
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
        borderBottom: "1px solid rgba(124,58,237,0.15)",
      }}
    >
      <div className="flex items-center gap-4">
        {onMenuClick && (
          <button onClick={onMenuClick} className="lg:hidden text-white/60 hover:text-white transition-colors">
            <Menu className="w-5 h-5" />
          </button>
        )}
        <h1
          className="text-[18px] font-bold"
          style={{ color: "var(--jm-violet)" }}
        >
          {title}
        </h1>
      </div>

      <div className="flex items-center gap-5">
        <div className="flex items-center gap-4" style={{ color: "rgba(255,255,255,0.45)" }}>
          {user && <NotificationBell userId={user._id} mode="seller" />}
          <Link
            href="/chats"
            className="transition-colors"
            style={{ color: "rgba(255,255,255,0.45)" }}
            onMouseEnter={e => (e.currentTarget.style.color = "#A78BFA")}
            onMouseLeave={e => (e.currentTarget.style.color = "rgba(255,255,255,0.45)")}
          >
            <Mail className="w-5 h-5" />
          </Link>
          <button
            className="transition-colors"
            onMouseEnter={e => (e.currentTarget.style.color = "#A78BFA")}
            onMouseLeave={e => (e.currentTarget.style.color = "rgba(255,255,255,0.45)")}
          >
            <HelpCircle className="w-5 h-5" />
          </button>
        </div>

        <button
          onClick={() => {
            window.localStorage.setItem("jobme.mode", "buyer");
            router.push("/browse");
          }}
          className="px-4 py-2 text-xs font-semibold rounded-full border border-white/20 text-white hover:bg-white/5 transition-colors"
        >
          Switch to Buying
        </button>

        {user && (
          <Link href="/profile" className="relative block">
            <div
              className="w-9 h-9 rounded-full overflow-hidden"
              style={{ border: "2px solid var(--jm-violet)" }}
            >
              <img
                src={user.pfp || "https://res.cloudinary.com/dztptq6q1/image/upload/v1756046508/user_rencds.png"}
                alt="Avatar"
                className="w-full h-full object-cover rounded-full"
              />
            </div>
            <div className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full border-2" style={{ background: "#A78BFA", borderColor: "#0D0D1A" }} />
          </Link>
        )}
      </div>
    </header>
  );
}
