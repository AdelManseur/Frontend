"use client";

import { useEffect, useMemo, useState } from "react";
import { getBuyerOrders } from "./req-res";
import { getMe } from "../req-res";
import type { BuyerOrder, BuyerOrderStatus } from "./interfaces";
import Link from "next/link";
import { Loader2, PackageSearch, ShoppingBag, Clock, CheckCircle2, XCircle, RefreshCw, Truck, ShieldCheck } from "lucide-react";
import { useRouter } from "next/navigation";

const STATUS_OPTIONS: Array<{ label: string; value: "all" | BuyerOrderStatus; icon: any }> = [
  { label: "All",         value: "all",         icon: ShoppingBag },
  { label: "Pending",     value: "pending",      icon: Clock },
  { label: "Active",      value: "active",       icon: Truck },
  { label: "Delivered",   value: "delivered",    icon: PackageSearch },
  { label: "Completed",   value: "completed",    icon: CheckCircle2 },
  { label: "Cancelled",   value: "cancelled",    icon: XCircle },
  { label: "In Revision", value: "in_revision",  icon: RefreshCw },
];

const STATUS_STYLE: Record<string, { bg: string; color: string; dot: string }> = {
  pending:     { bg: "rgba(251,191,36,0.12)",  color: "#FCD34D", dot: "#FCD34D" },
  active:      { bg: "rgba(59,130,246,0.12)",  color: "#93C5FD", dot: "#93C5FD" },
  delivered:   { bg: "rgba(124,58,237,0.12)",  color: "#C4B5FD", dot: "#C4B5FD" },
  completed:   { bg: "rgba(52,211,153,0.12)",  color: "#6EE7B7", dot: "#6EE7B7" },
  cancelled:   { bg: "rgba(239,68,68,0.12)",   color: "#FCA5A5", dot: "#FCA5A5" },
  in_revision: { bg: "rgba(249,115,22,0.12)",  color: "#FDB07A", dot: "#FDB07A" },
};

function formatDate(value?: string) {
  if (!value) return "—";
  return new Date(value).toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" });
}

export default function BuyerOrdersPage() {
  const router = useRouter();
  const [orders, setOrders] = useState<BuyerOrder[]>([]);
  const [status, setStatus] = useState<"all" | BuyerOrderStatus>("all");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [idVerified, setIdVerified] = useState<boolean | null>(null);
  const limit = 10;

  // Auth + verification check
  useEffect(() => {
    let mounted = true;
    (async () => {
      const me = await getMe().catch(() => null);
      if (!mounted) return;
      if (!me?.logged) { router.push("/login"); return; }
      setIdVerified(me.user.idVerified ?? false);
    })();
    return () => { mounted = false; };
  }, [router]);

  useEffect(() => {
    if (idVerified === null) return;
    let mounted = true;
    (async () => {
      setIsLoading(true);
      setError("");
      try {
        const data = await getBuyerOrders({ status: status === "all" ? undefined : status, page, limit });
        if (!mounted) return;
        setOrders(data.orders);
        setTotalPages(data.pagination.totalPages || 1);
        setTotalCount(data.pagination.totalCount || 0);
      } catch (e) {
        if (!mounted) return;
        setError(e instanceof Error ? e.message : "Failed to load orders.");
      } finally {
        if (mounted) setIsLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, [status, page, idVerified]);

  // Loading skeleton
  if (idVerified === null || (isLoading && orders.length === 0)) {
    return (
      <div className="max-w-5xl mx-auto p-8 text-white">
        <div className="h-8 w-48 rounded-xl mb-3 animate-pulse" style={{ background: "rgba(255,255,255,0.06)" }} />
        <div className="space-y-4 mt-8">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-36 rounded-2xl animate-pulse" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.06)" }} />
          ))}
        </div>
      </div>
    );
  }

  // Verification gate
  if (!idVerified) {
    return (
      <div className="max-w-md mx-auto p-8 mt-24">
        <div className="bg-white rounded-[2.5rem] p-10 text-center shadow-2xl shadow-neutral-200/50 border border-neutral-100">
          <div className="w-16 h-16 rounded-2xl mx-auto mb-8 flex items-center justify-center bg-neutral-50 text-neutral-900 border border-neutral-100 shadow-sm">
            <ShieldCheck className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-bold mb-4 tracking-tight text-neutral-900">Identity Verification</h2>
          <p className="text-sm text-neutral-500 mb-10 leading-relaxed max-w-[280px] mx-auto">
            To ensure a secure marketplace, we require identity verification through the <span className="text-neutral-900 font-semibold">JobMe mobile app</span> before accessing orders.
          </p>
          <div className="space-y-4">
            <Link 
              href="/verify-identity" 
              className="flex items-center justify-center gap-2 w-full py-4 rounded-full font-semibold text-[15px] bg-neutral-900 text-white hover:bg-neutral-800 transition-all active:scale-[0.98] shadow-lg shadow-neutral-900/10"
            >
              Verify Identity
            </Link>
            <Link 
              href="/browse" 
              className="flex items-center justify-center w-full py-2 text-sm font-medium text-neutral-400 hover:text-neutral-900 transition-colors"
            >
              Return to marketplace
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto text-white">
      {/* Header */}
      <div className="mb-8">
        <p className="text-[11px] font-bold uppercase tracking-widest mb-1" style={{ color: "var(--jm-violet)" }}>Buyer</p>
        <h1 className="text-3xl font-bold">Your Orders</h1>
        <p className="text-[14px] mt-1" style={{ color: "rgba(255,255,255,0.5)" }}>Track all orders you've placed as a buyer.</p>
      </div>

      {/* Filter tabs */}
      <div className="flex flex-wrap gap-2 mb-6">
        {STATUS_OPTIONS.map(({ label, value, icon: Icon }) => {
          const active = status === value;
          return (
            <button
              key={value}
              onClick={() => { setStatus(value); setPage(1); }}
              className="flex items-center gap-1.5 px-4 py-2 rounded-full text-[13px] font-semibold transition-all"
              style={{
                background: active ? "var(--jm-violet)" : "rgba(255,255,255,0.05)",
                color: active ? "white" : "rgba(255,255,255,0.5)",
                border: active ? "1px solid var(--jm-violet)" : "1px solid rgba(255,255,255,0.08)",
              }}
            >
              <Icon className="w-3.5 h-3.5" />
              {label}
            </button>
          );
        })}
        <span className="ml-auto self-center text-[13px]" style={{ color: "rgba(255,255,255,0.3)" }}>
          {totalCount} order{totalCount !== 1 ? "s" : ""}
        </span>
      </div>

      {error && <p className="text-red-400 text-[13px] mb-4">{error}</p>}

      {/* Orders list */}
      {isLoading ? (
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-32 rounded-2xl animate-pulse" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.06)" }} />
          ))}
        </div>
      ) : orders.length === 0 ? (
        <div className="glass-card-dark p-12 text-center">
          <ShoppingBag className="w-12 h-12 mx-auto mb-4" style={{ color: "rgba(255,255,255,0.2)" }} />
          <h3 className="text-lg font-bold mb-1">No orders yet</h3>
          <p className="text-[14px]" style={{ color: "rgba(255,255,255,0.5)" }}>Browse gigs and place your first order.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => {
            const sty = STATUS_STYLE[order.status] ?? { bg: "rgba(255,255,255,0.05)", color: "rgba(255,255,255,0.5)", dot: "#888" };
            return (
              <Link
                key={order._id}
                href={`/orders-to-buy/${order._id}`}
                className="block rounded-2xl overflow-hidden transition-all hover:translate-y-[-1px]"
                style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" }}
              >
                <div className="flex flex-col sm:flex-row gap-0">
                  {/* Gig thumbnail */}
                  <div className="w-full sm:w-48 h-36 flex-shrink-0 overflow-hidden" style={{ background: "rgba(255,255,255,0.04)" }}>
                    {order.gig.images?.[0] ? (
                      <img src={order.gig.images[0]} alt={order.gig.title} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-[11px]" style={{ color: "rgba(255,255,255,0.2)" }}>No image</div>
                    )}
                  </div>

                  {/* Details */}
                  <div className="flex-1 p-5 flex flex-col justify-between">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-[11px] font-bold uppercase tracking-wider mb-1" style={{ color: "rgba(255,255,255,0.3)" }}>
                          Order #{order._id.slice(-8)}
                        </p>
                        <h2 className="text-[16px] font-bold text-white leading-snug">{order.gig.title}</h2>
                        <p className="text-[12px] mt-0.5" style={{ color: "rgba(255,255,255,0.4)" }}>{order.gig.category}</p>
                      </div>
                      <span className="flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold flex-shrink-0" style={{ background: sty.bg, color: sty.color }}>
                        <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: sty.dot }} />
                        {order.status.replace("_", " ")}
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-x-6 gap-y-2 mt-4 text-[13px]">
                      {/* Seller */}
                      <div className="flex items-center gap-2">
                        <img src={order.seller.pfp || "https://res.cloudinary.com/dztptq6q1/image/upload/v1756046508/user_rencds.png"} alt={order.seller.name} className="w-6 h-6 rounded-full object-cover" />
                        <span style={{ color: "rgba(255,255,255,0.7)" }}>{order.seller.name}</span>
                      </div>
                      {/* Price */}
                      <span className="font-bold" style={{ color: "var(--jm-violet)" }}>{order.price?.toLocaleString()} DA</span>
                      {/* Delivery */}
                      <span style={{ color: "rgba(255,255,255,0.4)" }}>Due {formatDate(order.expectedDelivery)}</span>
                      {/* Ordered at */}
                      <span style={{ color: "rgba(255,255,255,0.3)" }}>Ordered {formatDate(order.createdAt)}</span>
                    </div>
                  </div>
                </div>

                {order.reported && (
                  <div className="px-5 py-3 flex items-center gap-3" style={{ background: "rgba(239,68,68,0.08)", borderTop: "1px solid rgba(239,68,68,0.2)" }}>
                    <span className="text-[11px] font-bold uppercase tracking-wider px-2 py-0.5 rounded" style={{ background: "rgba(239,68,68,0.25)", color: "#FCA5A5" }}>Reported</span>
                    <Link href={`/orders-to-buy/report/${order.reportId ?? order._id}`} className="text-[13px] font-medium hover:underline" style={{ color: "#FCA5A5" }}>
                      View your report →
                    </Link>
                  </div>
                )}
              </Link>
            );
          })}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mt-8 flex items-center justify-between">
          <button
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page <= 1 || isLoading}
            className="px-5 py-2 rounded-full text-[13px] font-semibold transition-all disabled:opacity-30"
            style={{ background: "rgba(255,255,255,0.06)", color: "rgba(255,255,255,0.7)", border: "1px solid rgba(255,255,255,0.1)" }}
          >
            ← Previous
          </button>
          <p className="text-[13px]" style={{ color: "rgba(255,255,255,0.4)" }}>
            Page <span className="text-white font-bold">{page}</span> of <span className="text-white font-bold">{totalPages}</span>
          </p>
          <button
            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
            disabled={page >= totalPages || isLoading}
            className="px-5 py-2 rounded-full text-[13px] font-semibold transition-all disabled:opacity-30"
            style={{ background: "rgba(255,255,255,0.06)", color: "rgba(255,255,255,0.7)", border: "1px solid rgba(255,255,255,0.1)" }}
          >
            Next →
          </button>
        </div>
      )}
    </div>
  );
}