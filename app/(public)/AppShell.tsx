"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { getMe } from "./req-res";
import type { MeResponse } from "./interfaces";
import BuyerShell from "./components/buyer/BuyerShell";
import SellerShell from "./components/seller/SellerShell";

export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();

  const [session, setSession] = useState<MeResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Determine mode dynamically from route
  const sellerRoutes = ["/seller-dashboard", "/your-gigs", "/orders-to-sell", "/earnings"];
  const isSellerRoute = sellerRoutes.some((route) => pathname?.startsWith(route));
  
  // For /chats, we use the saved mode in localStorage if available
  const [mode, setMode] = useState<"buyer" | "seller">("buyer");

  useEffect(() => {
    const savedMode = window.localStorage.getItem("jobme.mode") as "buyer" | "seller" | null;
    if (isSellerRoute) {
      setMode("seller");
    } else if (pathname?.startsWith("/chats")) {
      setMode(savedMode === "seller" ? "seller" : "buyer");
    } else {
      setMode("buyer");
    }
  }, [pathname, isSellerRoute]);

  useEffect(() => {
    let mounted = true;

    if (pathname === "/login" || pathname === "/signup" || pathname === "/verify-otp") {
      setIsLoading(false);
      return;
    }

    (async () => {
      try {
        const me = await getMe();
        if (mounted) {
          setSession(me);
          
          // Redirect logged-in users away from the public marketing homepage
          if (me.logged && pathname === "/") {
            // Check localStorage to decide where to land initially, but don't force mode globally
            const savedMode = window.localStorage.getItem("jobme.mode") as "buyer" | "seller" | null;
            const isSeller = me.logged && me.user.isSeller;
            const landingMode = savedMode === "seller" && isSeller ? "seller" : "buyer";
            router.replace(landingMode === "seller" ? "/seller-dashboard" : "/browse");
          }
        }
      } catch (err) {
        console.error("Failed to fetch session", err);
      } finally {
        if (mounted) setIsLoading(false);
      }
    })();

    return () => {
      mounted = false;
    };
  }, [pathname]);

  if (isLoading) return (
    <main
      className="min-h-screen grid place-items-center"
      style={{ background: "var(--jm-bg)" }}
    >
      <div className="flex flex-col items-center gap-4">
        <span
          className="text-4xl font-extrabold tracking-tighter text-neutral-900 animate-pulse"
        >
          jobme.
        </span>
        <div
          className="w-8 h-1 rounded-full bg-neutral-900 animate-pulse"
        />
      </div>
    </main>
  );

  const rawPages = ["/", "/login", "/signup", "/verify-otp"];
  if (rawPages.includes(pathname || "")) {
    return <>{children}</>;
  }

  if (!session?.logged) {
    return <BuyerShell session={null}>{children}</BuyerShell>;
  }

  if (mode === "seller") {
    return <SellerShell session={session}>{children}</SellerShell>;
  }

  return <BuyerShell session={session}>{children}</BuyerShell>;
}