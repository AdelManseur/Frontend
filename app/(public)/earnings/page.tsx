"use client";

import React, { useEffect, useState } from "react";
import { getMe, getEarningsData } from "../req-res";
import type { MeResponse } from "../interfaces";
import { Loader2, DollarSign, Wallet, ArrowUpRight, ArrowDownRight, Clock, PackageCheck, Timer } from "lucide-react";
import { useRouter } from "next/navigation";

export default function EarningsPage() {
  const router = useRouter();
  const [session, setSession] = useState<MeResponse | null>(null);
  const [earningsData, setEarningsData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const [me, data] = await Promise.all([
          getMe(),
          getEarningsData().catch(err => {
            console.error("Failed to load earnings", err);
            return null;
          })
        ]);

        if (mounted) {
          if (!me.logged) { router.push("/login"); return; }
          if (!me.user.isSeller) { router.push("/become-a-seller"); return; }
          setSession(me);
          setEarningsData(data || {
            netIncome: 0, withdrawn: 0, availableForWithdrawal: 0,
            completedOrdersCount: 0, completedOnTime: 0, onTimeRate: 100,
            transactions: []
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

  if (loading || !earningsData) {
    return (
      <div className="flex justify-center items-center h-full">
        <Loader2 className="w-12 h-12 animate-spin" style={{ color: "var(--jm-violet)" }} />
      </div>
    );
  }

  return (
    <div className="max-w-[1200px] mx-auto text-white">
      <h1 className="text-3xl font-bold mb-8">Earnings</h1>

      {/* Top Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        {/* Net Income */}
        <div className="glass-card-dark p-6 overflow-hidden relative">
          <div className="absolute -right-4 -top-4 opacity-10">
            <DollarSign className="w-32 h-32" style={{ color: "var(--jm-violet)" }} />
          </div>
          <div className="relative z-10">
            <h3 className="text-[12px] font-bold uppercase tracking-widest mb-3" style={{ color: "rgba(255,255,255,0.5)" }}>Net Income</h3>
            <p className="text-4xl font-bold mb-1">{earningsData.netIncome.toLocaleString()} <span className="text-2xl font-semibold" style={{ color: "var(--jm-violet)" }}>DA</span></p>
            <p className="text-[13px]" style={{ color: "rgba(255,255,255,0.5)" }}>Lifetime earnings</p>
          </div>
        </div>

        {/* Available for Withdrawal */}
        <div className="glass-card-dark p-6 overflow-hidden relative" style={{ border: "1px solid var(--jm-violet)" }}>
          <div className="absolute -right-4 -top-4 opacity-10">
            <Wallet className="w-32 h-32" style={{ color: "var(--jm-violet)" }} />
          </div>
          <div className="relative z-10">
            <h3 className="text-[12px] font-bold uppercase tracking-widest mb-3" style={{ color: "var(--jm-violet)" }}>Available for Withdrawal</h3>
            <p className="text-4xl font-bold mb-4">{earningsData.availableForWithdrawal.toLocaleString()} <span className="text-2xl font-semibold" style={{ color: "var(--jm-violet)" }}>DA</span></p>
            <button className="w-full py-2.5 rounded-full font-bold text-sm transition-all hover:brightness-110" style={{ background: "var(--jm-violet)", color: "white" }}>
              Withdraw Balance
            </button>
          </div>
        </div>

        {/* Withdrawn */}
        <div className="glass-card-dark p-6 overflow-hidden relative">
          <div className="absolute -right-4 -top-4 opacity-10">
            <ArrowUpRight className="w-32 h-32 text-pink-500" />
          </div>
          <div className="relative z-10">
            <h3 className="text-[12px] font-bold uppercase tracking-widest mb-3" style={{ color: "rgba(255,255,255,0.5)" }}>Withdrawn</h3>
            <p className="text-4xl font-bold mb-1">{earningsData.withdrawn.toLocaleString()} <span className="text-2xl font-semibold text-pink-400">DA</span></p>
            <p className="text-[13px] text-pink-400">Total withdrawn</p>
          </div>
        </div>
      </div>

      {/* Order Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {/* Completed Orders */}
        <div className="glass-card-dark p-5 flex items-center gap-4">
          <div className="w-12 h-12 flex-shrink-0 rounded-xl flex items-center justify-center" style={{ background: "rgba(124,58,237,0.15)" }}>
            <PackageCheck className="w-6 h-6" style={{ color: "var(--jm-violet)" }} />
          </div>
          <div>
            <p className="text-[12px] font-bold uppercase tracking-wider mb-1" style={{ color: "rgba(255,255,255,0.5)" }}>Completed Orders</p>
            <p className="text-2xl font-bold text-white">{earningsData.completedOrdersCount}</p>
          </div>
        </div>

        {/* On-Time Deliveries */}
        <div className="glass-card-dark p-5 flex items-center gap-4">
          <div className="w-12 h-12 flex-shrink-0 rounded-xl flex items-center justify-center" style={{ background: "rgba(34,197,94,0.1)" }}>
            <Timer className="w-6 h-6 text-green-400" />
          </div>
          <div>
            <p className="text-[12px] font-bold uppercase tracking-wider mb-1" style={{ color: "rgba(255,255,255,0.5)" }}>Delivered On Time</p>
            <p className="text-2xl font-bold text-white">
              {earningsData.completedOnTime}
              <span className="text-sm font-semibold ml-1" style={{ color: "rgba(255,255,255,0.4)" }}>/ {earningsData.completedOrdersCount}</span>
            </p>
          </div>
        </div>

        {/* On-Time Rate */}
        <div className="glass-card-dark p-5 flex items-center gap-4">
          <div className="w-12 h-12 flex-shrink-0 rounded-xl flex items-center justify-center" style={{ background: "rgba(251,191,36,0.1)" }}>
            <Clock className="w-6 h-6 text-yellow-400" />
          </div>
          <div className="flex-1">
            <p className="text-[12px] font-bold uppercase tracking-wider mb-1" style={{ color: "rgba(255,255,255,0.5)" }}>On-Time Rate</p>
            <div className="flex items-center gap-3">
              <p className="text-2xl font-bold text-white">{earningsData.onTimeRate}%</p>
              <div className="flex-1 h-1.5 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.1)" }}>
                <div
                  className="h-full rounded-full transition-all"
                  style={{ width: `${earningsData.onTimeRate}%`, background: earningsData.onTimeRate >= 80 ? "#4ade80" : earningsData.onTimeRate >= 50 ? "#facc15" : "#f87171" }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Transactions Table */}
      <div className="glass-card-dark overflow-hidden">
        <div className="px-6 py-5 border-b flex items-center justify-between" style={{ borderColor: "var(--jm-seller-border)" }}>
          <h2 className="text-lg font-bold">Transaction History</h2>
          <span className="text-[13px] font-semibold" style={{ color: "rgba(255,255,255,0.4)" }}>All amounts in DA</span>
        </div>

        {earningsData.transactions.length === 0 ? (
          <div className="p-12 text-center">
            <div className="w-16 h-16 mx-auto rounded-full flex items-center justify-center mb-4" style={{ background: "rgba(255,255,255,0.05)" }}>
              <Clock className="w-8 h-8" style={{ color: "rgba(255,255,255,0.3)" }} />
            </div>
            <h3 className="text-lg font-bold mb-2">No transactions yet</h3>
            <p className="text-sm" style={{ color: "rgba(255,255,255,0.5)" }}>Complete your first order to see your earnings here.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr style={{ background: "rgba(13,13,26,0.5)", borderBottom: "1px solid var(--jm-seller-border)" }}>
                  <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-wider" style={{ color: "rgba(255,255,255,0.4)" }}>Date</th>
                  <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-wider" style={{ color: "rgba(255,255,255,0.4)" }}>Buyer</th>
                  <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-wider" style={{ color: "rgba(255,255,255,0.4)" }}>Amount (DA)</th>
                  <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-wider" style={{ color: "rgba(255,255,255,0.4)" }}>Status</th>
                </tr>
              </thead>
              <tbody>
                {earningsData.transactions.map((tx: any, idx: number) => (
                  <tr
                    key={idx}
                    className="transition-colors hover:bg-[rgba(124,58,237,0.05)]"
                    style={{ borderBottom: "1px solid var(--jm-seller-border)" }}
                  >
                    <td className="px-6 py-4 text-[14px]" style={{ color: "rgba(255,255,255,0.7)" }}>
                      {new Date(tx.date).toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" })}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full overflow-hidden border border-[rgba(255,255,255,0.15)]">
                          <img
                            src={tx.buyer?.pfp || "https://res.cloudinary.com/dztptq6q1/image/upload/v1756046508/user_rencds.png"}
                            alt="Buyer"
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <p className="text-[14px] font-semibold text-white">{tx.buyer?.name || "Unknown"}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <span className="flex items-center justify-center w-5 h-5 rounded-full" style={{ background: "rgba(34,197,94,0.15)", color: "#4ade80" }}>
                          <ArrowDownRight className="w-3 h-3" />
                        </span>
                        <span className="text-[15px] font-bold text-[#4ade80]">+{tx.amount.toLocaleString()} DA</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-block px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider" style={{ background: "rgba(34,197,94,0.15)", color: "#4ade80" }}>
                        Cleared
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}