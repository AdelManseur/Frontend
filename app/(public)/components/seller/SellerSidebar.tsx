"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Briefcase, DollarSign, Package, MessageSquare, ChevronDown, ChevronRight, Globe } from "lucide-react";
import type { MeResponse } from "../../interfaces";

interface SellerSidebarProps {
  session: MeResponse | null;
}

export default function SellerSidebar({ session }: SellerSidebarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const user = session?.logged ? session.user : null;

  const [expanded, setExpanded] = useState<Record<string, boolean>>({
    "My Business": true,
    "Orders": true,
    "Communication": true,
  });

  const toggleSection = (section: string) => {
    setExpanded(prev => ({ ...prev, [section]: !prev[section] }));
  };

  const menuSections = [
    {
      title: "My Business",
      icon: <Briefcase className="w-4 h-4" />,
      links: [
        { label: "Dashboard", href: "/seller-dashboard" },
        { label: "My Gigs", href: "/your-gigs" },
        { label: "Earnings", href: "/earnings" },
        { label: "Profile", href: "/profile" },
      ],
    },
    {
      title: "Orders",
      icon: <Package className="w-4 h-4" />,
      links: [{ label: "Orders to Sell", href: "/orders-to-sell" }],
    },
    {
      title: "Communication",
      icon: <MessageSquare className="w-4 h-4" />,
      links: [{ label: "Chats", href: "/chats" }],
    },
  ];

  return (
    <aside
      className="w-[260px] h-screen flex flex-col flex-shrink-0 overflow-y-auto no-scrollbar"
      style={{
        background: "rgba(13, 13, 26, 0.85)",
        backdropFilter: "blur(24px)",
        WebkitBackdropFilter: "blur(24px)",
        borderRight: "1px solid rgba(124, 58, 237, 0.18)",
      }}
    >
      {/* Logo */}
      <div className="h-[65px] px-6 flex items-center" style={{ borderBottom: "1px solid rgba(124,58,237,0.12)" }}>
        <Link href="/seller-dashboard">
          <span className="text-[22px] font-extrabold tracking-tight text-white">
            JobMe
            <span style={{ color: "var(--jm-violet)" }}>.</span>
          </span>
        </Link>
      </div>

      {/* User Profile Summary */}
      {user && (
        <div className="p-5 flex items-center gap-3" style={{ borderBottom: "1px solid rgba(124,58,237,0.12)" }}>
          <div
            className="w-10 h-10 rounded-full overflow-hidden flex-shrink-0"
            style={{ border: "2px solid var(--jm-violet)" }}
          >
            <img
              src={user.pfp || "https://res.cloudinary.com/dztptq6q1/image/upload/v1756046508/user_rencds.png"}
              alt="Avatar"
              className="w-full h-full object-cover rounded-full"
            />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[13px] font-semibold truncate text-white">{user.name}</p>
            <p className="text-[11px] truncate" style={{ color: "rgba(255,255,255,0.45)" }}>{user.email}</p>
          </div>
        </div>
      )}

      {/* Navigation */}
      <nav className="flex-1 py-4">
        {menuSections.map((section) => {
          const isExpanded = expanded[section.title];
          return (
            <div key={section.title} className="mb-1">
              <button
                onClick={() => toggleSection(section.title)}
                className="w-full flex items-center justify-between px-5 py-2.5 transition-colors group"
                style={{ color: "rgba(255,255,255,0.5)" }}
                onMouseEnter={e => (e.currentTarget.style.background = "rgba(124,58,237,0.08)")}
                onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
              >
                <div className="flex items-center gap-3 group-hover:text-white transition-colors">
                  {section.icon}
                  <span className="text-[12px] font-semibold uppercase tracking-wider">{section.title}</span>
                </div>
                {isExpanded ? (
                  <ChevronDown className="w-3.5 h-3.5" />
                ) : (
                  <ChevronRight className="w-3.5 h-3.5" />
                )}
              </button>

              {isExpanded && (
                <ul className="mt-0.5">
                  {section.links.map((link) => {
                    const isActive = pathname === link.href;
                    return (
                      <li key={link.href}>
                        <Link
                          href={link.href}
                          className="flex items-center py-2.5 pl-12 pr-5 text-[13px] font-medium transition-all"
                          style={
                            isActive
                              ? {
                                  background: "rgba(124,58,237,0.15)",
                                  borderLeft: "2px solid #7C3AED",
                                  color: "#A78BFA",
                                }
                              : {
                                  borderLeft: "2px solid transparent",
                                  color: "rgba(255,255,255,0.5)",
                                }
                          }
                          onMouseEnter={e => {
                            if (!isActive) {
                              e.currentTarget.style.background = "rgba(124,58,237,0.08)";
                              e.currentTarget.style.color = "rgba(255,255,255,0.85)";
                            }
                          }}
                          onMouseLeave={e => {
                            if (!isActive) {
                              e.currentTarget.style.background = "transparent";
                              e.currentTarget.style.color = "rgba(255,255,255,0.5)";
                            }
                          }}
                        >
                          {link.label}
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
          );
        })}
      </nav>

      {/* Bottom Actions */}
      <div className="p-4 space-y-1" style={{ borderTop: "1px solid rgba(124,58,237,0.12)" }}>
        <button
          className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-[13px] transition-colors"
          style={{ color: "rgba(255,255,255,0.4)" }}
          onMouseEnter={e => { e.currentTarget.style.background = "rgba(124,58,237,0.08)"; e.currentTarget.style.color = "rgba(255,255,255,0.7)"; }}
          onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "rgba(255,255,255,0.4)"; }}
        >
          <Globe className="w-4 h-4" /> English
        </button>

        <div style={{ height: "1px", background: "rgba(124,58,237,0.1)", margin: "8px 0" }} />


        <button
          onClick={async () => {
            if (confirm("Are you sure you want to log out?")) {
              const { logoutUser } = await import("../../req-res");
              await logoutUser();
            }
          }}
          className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-full text-[13px] font-semibold transition-all mt-1"
          style={{
            background: "rgba(239, 68, 68, 0.05)",
            border: "1px solid rgba(239, 68, 68, 0.15)",
            color: "#f87171",
          }}
          onMouseEnter={e => {
            e.currentTarget.style.background = "rgba(239, 68, 68, 0.15)";
            e.currentTarget.style.borderColor = "rgba(239, 68, 68, 0.25)";
          }}
          onMouseLeave={e => {
            e.currentTarget.style.background = "rgba(239, 68, 68, 0.05)";
            e.currentTarget.style.borderColor = "rgba(239, 68, 68, 0.15)";
          }}
        >
          Log Out
        </button>
      </div>
    </aside>
  );
}
