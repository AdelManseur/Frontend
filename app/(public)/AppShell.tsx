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
  const [mode, setMode] = useState<"buyer" | "seller">("buyer");

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
          
          // Determine initial mode based on localStorage and seller status
          const savedMode = window.localStorage.getItem("jobme.mode") as "buyer" | "seller" | null;
          const isSeller = me.logged && me.user.isSeller;
          
          const newMode = savedMode === "seller" && isSeller ? "seller" : "buyer";
          setMode(newMode);

          // Redirect logged-in users away from the public marketing homepage
          if (pathname === "/") {
            router.replace(newMode === "seller" ? "/seller-dashboard" : "/browse");
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

  useEffect(() => {
    window.localStorage.setItem("jobme.mode", mode);
  }, [mode]);

  if (isLoading) return (
    <main
      className="min-h-screen grid place-items-center"
      style={{ background: "var(--jm-bg)" }}
    >
      <div className="flex flex-col items-center gap-4">
        <span
          className="text-4xl font-extrabold tracking-tight"
          style={{
            color: "var(--jm-violet)",
            animation: "pulse 1.5s ease-in-out infinite",
          }}
        >
          jobme<span style={{ opacity: 0.7 }}>.</span>
        </span>
        <div
          className="w-8 h-1 rounded-full"
          style={{
            background: "var(--jm-violet)",
            animation: "pulse 1.5s ease-in-out infinite",
          }}
        />
      </div>
    </main>
  );

  
  if (!session?.logged) {
    const rawPages = ["/", "/login", "/signup", "/verify-otp"];
    if (rawPages.includes(pathname)) {
      return <>{children}</>;
    }
    return <BuyerShell session={null} setMode={setMode}>{children}</BuyerShell>;
  }

  if (mode === "seller") {
    return <SellerShell session={session} setMode={setMode}>{children}</SellerShell>;
  }

  return <BuyerShell session={session} setMode={setMode}>{children}</BuyerShell>;
}