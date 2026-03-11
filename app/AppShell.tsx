"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { getMe, logoutUser } from "./req-res";
import type { MeResponse } from "./interfaces";

type UserMode = "buyer" | "seller";
type NavItem = { label: string; href: string };

export default function AppShell({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();

  const [session, setSession] = useState<MeResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [mode, setMode] = useState<UserMode>("buyer");
  const [openMenu, setOpenMenu] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  useEffect(() => {
    let mounted = true;

    if (pathname === "/login" || pathname === "/signup" || pathname === "/verify-otp") {
      setIsLoading(false);
      return;
    }

    (async () => {
      try {
        const me = await getMe();
        if (mounted) setSession(me);
      } finally {
        if (mounted) setIsLoading(false);
      }
    })();

    return () => {
      mounted = false;
    };
  }, [pathname]);

  useEffect(() => {
    const saved = window.localStorage.getItem("jobme.sidebar.collapsed");
    if (saved === "1") setIsSidebarCollapsed(true);
  }, []);

  useEffect(() => {
    window.localStorage.setItem("jobme.sidebar.collapsed", isSidebarCollapsed ? "1" : "0");
  }, [isSidebarCollapsed]);

  const buyerItems = useMemo<NavItem[]>(
    () => [
      { label: "Profile", href: "/buyer/profile" },
      { label: "Settings", href: "/settings" },
      { label: "Orders", href: "/buyer/orders" },
      { label: "Browse", href: "/buyer/browse" },
      { label: "Saved", href: "/saved" },
      { label: "Help", href: "/help" },
    ],
    []
  );

  const sellerItems = useMemo<NavItem[]>(
    () => [
      { label: "Profile", href: "/seller/profile" },
      { label: "Orders Confirmed", href: "/seller/orders-confirmed" },
      { label: "Chats", href: "/seller/chats" },
      { label: "Your Gigs", href: "/seller/your-gigs" },
      { label: "Earnings", href: "/seller/earnings" },
      { label: "Settings", href: "/settings" },
    ],
    []
  );

  const navItems = mode === "buyer" ? buyerItems : sellerItems;

  const onLogout = async () => {
    await logoutUser();
    setOpenMenu(false);
    router.refresh();
  };

  if (isLoading) return <main className="min-h-screen grid place-items-center">Loading...</main>;
  if (!session?.logged) return <>{children}</>;

  return (
    <main className="h-screen w-screen overflow-hidden bg-[#0b1220] text-white">
      <div className="flex h-full">
        <aside
          className={`relative h-screen shrink-0 border-r border-white/10 bg-[#0b1220] p-3 backdrop-blur transition-all duration-300 ${
            isSidebarCollapsed ? "w-20" : "w-56"
          }`}
        >
          <div className="flex h-full flex-col">
            <button
              type="button"
              onClick={() => setIsSidebarCollapsed((v) => !v)}
              className="absolute -right-3 top-6 z-20 grid h-6 w-6 place-items-center rounded-full border border-white/20 bg-[#111827] text-xs text-gray-200 hover:bg-[#1f2937]"
              aria-label={isSidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
              title={isSidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
            >
              {isSidebarCollapsed ? "›" : "‹"}
            </button>

            <h2 className={`text-lg font-semibold transition-opacity ${isSidebarCollapsed ? "text-center text-sm" : ""}`}>
              {isSidebarCollapsed ? "JM" : "JobMe"}
            </h2>

            <nav className="mt-6 space-y-2">
              {navItems.map((item) => {
                const active = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    title={item.label}
                    className={`block rounded-md px-3 py-2 text-sm ${
                      active ? "bg-indigo-500 text-white" : "text-gray-300 hover:bg-white/10"
                    } ${isSidebarCollapsed ? "text-center" : ""}`}
                  >
                    {isSidebarCollapsed ? item.label.charAt(0) : item.label}
                  </Link>
                );
              })}
            </nav>

            <div className="mt-auto space-y-4">
              <div className="relative border-t border-white/10 pt-4">
                <button
                  type="button"
                  onClick={() => setOpenMenu((v) => !v)}
                  className={`flex w-full items-center rounded-md px-2 py-2 hover:bg-white/10 ${
                    isSidebarCollapsed ? "justify-center" : "gap-3"
                  }`}
                >
                  <img
                    src={session.user.pfp || "https://placehold.co/80x80/png"}
                    alt="Profile"
                    className="h-9 w-9 rounded-full object-cover"
                  />
                  {!isSidebarCollapsed && (
                    <div className="min-w-0 text-left">
                      <p className="truncate text-sm font-medium">{session.user.name}</p>
                      <p className="truncate text-xs text-gray-400">{session.user.email}</p>
                    </div>
                  )}
                </button>

                {openMenu && (
                  <div className="absolute bottom-16 left-0 w-full rounded-xl border border-white/10 bg-[#111827] p-2 shadow-xl">
                    <div className="mb-2 rounded-md bg-white/5 p-2">
                      <p className="truncate text-sm font-medium text-white">{session.user.name}</p>
                      <p className="truncate text-xs text-gray-400">{session.user.email}</p>
                    </div>

                    <Link
                      href="/profile-details"
                      className="block w-full rounded-md px-3 py-2 text-left text-sm text-gray-200 hover:bg-white/10"
                    >
                      Profile Details
                    </Link>
                    <button className="w-full rounded-md px-3 py-2 text-left text-sm text-gray-200 hover:bg-white/10">
                      Account settings
                    </button>
                    <button className="w-full rounded-md px-3 py-2 text-left text-sm text-gray-200 hover:bg-white/10">
                      Help & support
                    </button>

                    <hr className="my-2 border-white/10" />

                    <button
                      type="button"
                      onClick={onLogout}
                      className="w-full rounded-md bg-red-500/10 px-3 py-2 text-left text-sm font-medium text-red-300 hover:bg-red-500/20"
                    >
                      Logout
                    </button>
                  </div>
                )}
              </div>

              <div className="border-t border-white/10 pt-4">
                {!isSidebarCollapsed && (
                  <p className="mb-2 text-xs uppercase tracking-wide text-gray-400">Mode</p>
                )}
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setMode("buyer")}
                    className={`rounded-md px-3 py-2 text-sm font-medium ${
                      mode === "buyer" ? "bg-indigo-500 text-white" : "bg-white/10 text-gray-300 hover:bg-white/20"
                    }`}
                    title="Buyer"
                  >
                    {isSidebarCollapsed ? "B" : "Buyer"}
                  </button>
                  <button
                    type="button"
                    onClick={() => setMode("seller")}
                    className={`rounded-md px-3 py-2 text-sm font-medium ${
                      mode === "seller" ? "bg-indigo-500 text-white" : "bg-white/10 text-gray-300 hover:bg-white/20"
                    }`}
                    title="Seller"
                  >
                    {isSidebarCollapsed ? "S" : "Seller"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </aside>

        <section className="min-h-0 flex-1 overflow-y-auto bg-[#111827]">
          <div className="min-h-full px-8 py-8">
            {children}
          </div>
        </section>
      </div>
    </main>
  );
}