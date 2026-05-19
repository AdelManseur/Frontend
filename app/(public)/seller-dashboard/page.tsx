"use client";

import React, { useEffect, useState } from "react";
import ProfileHeader from "../components/seller/dashboard/ProfileHeader";
import OrdersSection from "../components/seller/dashboard/OrdersSection";
import MessagesSection from "../components/seller/dashboard/MessagesSection";
import NextLevelSection from "../components/seller/dashboard/NextLevelSection";
import ResourcesCarousel from "../components/seller/dashboard/ResourcesCarousel";
import { PerformanceWidget, ProfileStrengthWidget, FeedbackWidget } from "../components/seller/dashboard/Widgets";
import { getMe, getSellerDashboardStats } from "../req-res";
import type { MeResponse } from "../interfaces";
import { Loader2, ShieldCheck, Smartphone } from "lucide-react";
import { useRouter } from "next/navigation";

export default function SellerDashboardPage() {
  const router = useRouter();
  const [session, setSession] = useState<MeResponse | null>(null);
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const [me, stats] = await Promise.all([
          getMe(),
          getSellerDashboardStats().catch(err => {
            console.error("Failed to load dashboard stats", err);
            return null; // Don't crash if stats fail
          })
        ]);
        
        if (mounted) {
          if (!me.logged) {
            router.push("/login");
            return;
          }
          if (!me.user.isSeller) {
            router.push("/become-a-seller");
            return;
          }
          setSession(me);
          setDashboardData(stats || {
            activeOrders: [],
            recentMessages: [],
            performance: {
              activeOrdersCount: 0,
              totalEarnings: 0,
              completedOrdersCount: 0,
              completionRate: 100,
              averageRating: "5.0",
              sellerLevel: { id: "new_seller", label: "New Seller", completedOrders: 0, nextLevelAt: 10, progressToNext: 0 },
            }
          });
        }
      } catch (err) {
        console.error(err);
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, [router]);

  if (loading || !dashboardData) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="w-8 h-8 animate-spin" style={{ color: "var(--jm-violet)" }} />
      </div>
    );
  }

  return (
    <div className="font-sans pb-12 text-white">
      {/* Verification Banner */}
      {session?.logged && session.user && !session.user.idVerified && (
        <div className="mb-6 rounded-xl overflow-hidden" style={{ border: "1px solid rgba(239,68,68,0.35)" }}>
          <div className="flex items-center justify-between gap-4 px-5 py-4" style={{ background: "rgba(239,68,68,0.08)" }}>
            <div className="flex items-center gap-3">
              <ShieldCheck className="w-6 h-6 text-red-400" />
              <div>
                <p className="text-[14px] font-bold text-white">Verification Required</p>
                <p className="text-[12px]" style={{ color: "rgba(255,255,255,0.6)" }}>
                  You must verify your identity via the <strong className="text-white">JobMe mobile app</strong> to create gigs or place orders.
                </p>
              </div>
            </div>
            <a
              href="/verify-identity"
              className="flex-shrink-0 flex items-center gap-2 px-5 py-2 rounded-full font-bold text-[13px] text-white transition-all hover:brightness-110"
              style={{ background: "#7C3AED", border: "1px solid rgba(124,58,237,0.4)" }}
            >
              <Smartphone className="w-4 h-4" />
              Verify Identity
            </a>
          </div>
        </div>
      )}

      {/* Profile Header (Full Width) */}
      <ProfileHeader session={session} sellerLevel={dashboardData.performance?.sellerLevel} />

      {/* Two Column Layout */}
      <div className="flex flex-col lg:flex-row gap-8">
        
        {/* Main Content Column */}
        <div className="flex-1 min-w-0">
          <OrdersSection orders={dashboardData.activeOrders} />
          <MessagesSection messages={dashboardData.recentMessages} />
          <NextLevelSection sellerLevel={dashboardData.performance?.sellerLevel} />
          <ResourcesCarousel />
        </div>
        
        {/* Right Sidebar Column */}
        <div className="w-full lg:w-[320px] flex-shrink-0 flex flex-col gap-6">
          <ProfileStrengthWidget user={(session as any)?.user} />
          <PerformanceWidget stats={dashboardData.performance} />
          <FeedbackWidget />
        </div>
        
      </div>
    </div>
  );
}
