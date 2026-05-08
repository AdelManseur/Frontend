"use client";

import { useEffect, useMemo, useState } from "react";
import { getSellerOrders } from "./req-res";
import type { SellerOrder, SellerOrderStatus } from "./interfaces";
import Link from "next/link";
import { Loader2, PackageSearch, ShoppingBag, Clock, CheckCircle2, XCircle, RefreshCw, Truck, ArrowRight, Filter, User } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

const STATUS_OPTIONS: Array<{ label: string; value: "all" | SellerOrderStatus; icon: any }> = [
  { label: "All",         value: "all",         icon: ShoppingBag },
  { label: "Pending",     value: "pending",      icon: Clock },
  { label: "Active",      value: "active",       icon: Truck },
  { label: "Delivered",   value: "delivered",    icon: PackageSearch },
  { label: "Completed",   value: "completed",    icon: CheckCircle2 },
  { label: "Cancelled",   value: "cancelled",    icon: XCircle },
  { label: "In Revision", value: "in_revision",  icon: RefreshCw },
];

const STATUS_STYLE: Record<string, { bg: string; color: string; dot: string; label: string }> = {
  pending:     { bg: "rgba(251,191,36,0.12)",  color: "#FCD34D", dot: "#FCD34D", label: "Pending" },
  active:      { bg: "rgba(59,130,246,0.12)",  color: "#93C5FD", dot: "#93C5FD", label: "Active" },
  delivered:   { bg: "rgba(124,58,237,0.12)",  color: "#C4B5FD", dot: "#C4B5FD", label: "Delivered" },
  completed:   { bg: "rgba(52,211,153,0.12)",  color: "#6EE7B7", dot: "#6EE7B7", label: "Completed" },
  cancelled:   { bg: "rgba(239,68,68,0.12)",   color: "#FCA5A5", dot: "#FCA5A5", label: "Cancelled" },
  in_revision: { bg: "rgba(249,115,22,0.12)",  color: "#FDB07A", dot: "#FDB07A", label: "Revision" },
};

function formatDate(value?: string) {
  if (!value) return "—";
  return new Date(value).toLocaleDateString(undefined, { 
    year: "numeric", 
    month: "short", 
    day: "numeric" 
  });
}

export default function SellerOrdersPage() {
  const [orders, setOrders] = useState<SellerOrder[]>([]);
  const [status, setStatus] = useState<"all" | SellerOrderStatus>("all");
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let mounted = true;
    (async () => {
      setIsLoading(true);
      setError("");
      try {
        const data = await getSellerOrders({
          status: status === "all" ? undefined : status,
          page,
          limit,
        });
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
  }, [status, page, limit]);

  return (
    <div className="max-w-6xl mx-auto px-4 pb-20">
      {/* Header */}
      <motion.div 
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        className="mb-12 mt-8"
      >
        <div className="flex items-center gap-3 mb-2">
          <div className="w-1 h-8 rounded-full bg-violet-500" />
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-violet-400">Seller Dashboard</p>
        </div>
        <h1 className="text-4xl font-extrabold text-white tracking-tight">Your Sales</h1>
        <p className="text-[15px] mt-2 text-gray-400 font-medium">Manage your active gigs, deliveries, and incoming orders.</p>
      </motion.div>

      {/* Filter tabs */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
        <div className="flex flex-wrap gap-2.5">
          {STATUS_OPTIONS.map(({ label, value, icon: Icon }) => {
            const active = status === value;
            return (
              <button
                key={value}
                onClick={() => { setStatus(value); setPage(1); }}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-2xl text-[13px] font-bold transition-all relative group
                  ${active ? "text-white" : "text-gray-400 hover:text-gray-200"}`}
              >
                {active && (
                  <motion.div 
                    layoutId="activeTabSeller"
                    className="absolute inset-0 bg-violet-500 rounded-2xl shadow-lg shadow-violet-500/20"
                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                  />
                )}
                <Icon className={`w-3.5 h-3.5 relative z-10 ${active ? "animate-pulse" : ""}`} />
                <span className="relative z-10">{label}</span>
              </button>
            );
          })}
        </div>
        <div className="flex items-center gap-2 text-[13px] font-bold text-gray-500 px-4 py-2 rounded-xl bg-white/5 border border-white/5">
          <Filter className="w-3.5 h-3.5" />
          <span>{totalCount} Active Orders</span>
        </div>
      </div>

      {error && (
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="p-4 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-400 text-[13px] mb-8 font-semibold flex items-center gap-3"
        >
          <XCircle className="w-4 h-4" />
          {error}
        </motion.div>
      )}

      {/* Orders list */}
      <AnimatePresence mode="wait">
        {isLoading && orders.length === 0 ? (
          <motion.div 
            key="loading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="space-y-6"
          >
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-40 rounded-3xl bg-white/5 animate-pulse border border-white/5" />
            ))}
          </motion.div>
        ) : orders.length === 0 ? (
          <motion.div 
            key="empty"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-card-dark p-20 text-center"
          >
            <div className="w-20 h-20 bg-white/5 rounded-3xl mx-auto mb-6 flex items-center justify-center">
              <ShoppingBag className="w-10 h-10 text-gray-600" />
            </div>
            <h3 className="text-xl font-bold mb-2">No orders yet</h3>
            <p className="text-gray-500 max-w-xs mx-auto">You haven't received any orders for this status yet. Keep up the great work!</p>
          </motion.div>
        ) : (
          <motion.div 
            key="list"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-6"
          >
            {orders.map((order, index) => {
              const sty = STATUS_STYLE[order.status] ?? { bg: "rgba(255,255,255,0.05)", color: "rgba(255,255,255,0.5)", dot: "#888", label: order.status };
              return (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  key={order._id}
                >
                  <Link
                    href={`/orders-to-sell/${order._id}`}
                    className="block glass-card-dark group hover:border-violet-500/30 transition-all duration-300 relative overflow-hidden"
                  >
                    {/* Hover Glow Effect */}
                    <div className="absolute -inset-1 bg-gradient-to-r from-violet-600/0 via-violet-600/5 to-violet-600/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                    <div className="flex flex-col lg:flex-row gap-0 relative z-10">
                      {/* Gig thumbnail */}
                      <div className="w-full lg:w-64 h-48 flex-shrink-0 overflow-hidden relative">
                        {order.gig.images?.[0] ? (
                          <img 
                            src={order.gig.images[0]} 
                            alt={order.gig.title} 
                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" 
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-white/5">
                            <PackageSearch className="w-10 h-10 text-gray-700" />
                          </div>
                        )}
                        {/* Package Badge */}
                        <div className="absolute top-4 left-4 px-3 py-1 rounded-full bg-black/40 backdrop-blur-md border border-white/10 text-[10px] font-black uppercase tracking-widest text-white">
                          {order.isRegular ? "Package Order" : "Custom Offer"}
                        </div>
                      </div>

                      {/* Details */}
                      <div className="flex-1 p-6 flex flex-col">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500">
                                #{order._id.slice(-8)}
                              </p>
                              <div className="h-1 w-1 rounded-full bg-gray-700" />
                              <p className="text-[10px] font-bold text-gray-500">
                                {formatDate(order.createdAt)}
                              </p>
                            </div>
                            <h2 className="text-xl font-extrabold text-white leading-tight group-hover:text-violet-300 transition-colors">
                              {order.gig.title}
                            </h2>
                            <p className="text-[13px] mt-1.5 font-bold text-violet-400/80">{order.gig.category}</p>
                          </div>
                          
                          <div className="flex flex-col items-end gap-2">
                            <span className="flex items-center gap-2 px-4 py-1.5 rounded-2xl text-[11px] font-black uppercase tracking-wider" style={{ background: sty.bg, color: sty.color }}>
                              <span className="w-1.5 h-1.5 rounded-full" style={{ background: sty.dot }} />
                              {sty.label}
                            </span>
                            <p className="text-2xl font-black text-white tracking-tight">
                              {order.price?.toLocaleString()} <span className="text-sm font-bold text-gray-500">DA</span>
                            </p>
                          </div>
                        </div>

                        <div className="mt-auto pt-6 flex flex-wrap items-center justify-between border-t border-white/5">
                          <div className="flex items-center gap-6">
                            {/* Buyer */}
                            <div className="flex items-center gap-2.5 group/buyer">
                              <div className="w-8 h-8 rounded-full border-2 border-white/5 overflow-hidden transition-transform group-hover/buyer:scale-110">
                                <img 
                                  src={order.buyer.pfp || "https://res.cloudinary.com/dztptq6q1/image/upload/v1756046508/user_rencds.png"} 
                                  alt={order.buyer.name} 
                                  className="w-full h-full object-cover" 
                                />
                              </div>
                              <div>
                                <p className="text-[11px] text-gray-500 font-bold uppercase tracking-wider leading-none mb-0.5">Buyer</p>
                                <span className="text-[13px] text-white font-bold">{order.buyer.name}</span>
                              </div>
                            </div>
                            
                            {/* Delivery */}
                            <div>
                              <p className="text-[11px] text-gray-500 font-bold uppercase tracking-wider leading-none mb-0.5">Expected Delivery</p>
                              <div className="flex items-center gap-1.5">
                                <Clock className="w-3 h-3 text-violet-400" />
                                <span className="text-[13px] text-gray-300 font-bold">{formatDate(order.expectedDelivery)}</span>
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-2 text-violet-400 font-bold text-[13px] opacity-0 group-hover:opacity-100 transition-opacity">
                            Open Details <ArrowRight className="w-4 h-4" />
                          </div>
                        </div>
                      </div>
                    </div>

                    {order.reported && (
                      <div className="px-6 py-3 flex items-center justify-between bg-red-500/5 border-t border-red-500/10">
                        <div className="flex items-center gap-3">
                          <XCircle className="w-4 h-4 text-red-400" />
                          <span className="text-[11px] font-black uppercase tracking-[0.2em] text-red-400">Security Alert / Dispute Opened</span>
                        </div>
                        <span className="text-[12px] font-bold text-red-300/80 hover:text-red-300 hover:underline cursor-pointer">
                          View Dispute Progress &rarr;
                        </span>
                      </div>
                    )}
                  </Link>
                </motion.div>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Pagination */}
      {totalPages > 1 && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mt-12 flex items-center justify-center gap-8"
        >
          <button
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page <= 1 || isLoading}
            className="w-12 h-12 rounded-2xl flex items-center justify-center bg-white/5 border border-white/10 text-white transition-all hover:bg-white/10 disabled:opacity-20 disabled:cursor-not-allowed"
          >
            &larr;
          </button>
          <div className="flex items-center gap-2">
            <span className="text-[14px] font-black text-white">{page}</span>
            <span className="text-[14px] font-bold text-gray-600">/</span>
            <span className="text-[14px] font-bold text-gray-600">{totalPages}</span>
          </div>
          <button
            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
            disabled={page >= totalPages || isLoading}
            className="w-12 h-12 rounded-2xl flex items-center justify-center bg-white/5 border border-white/10 text-white transition-all hover:bg-white/10 disabled:opacity-20 disabled:cursor-not-allowed"
          >
            &rarr;
          </button>
        </motion.div>
      )}
    </div>
  );
}