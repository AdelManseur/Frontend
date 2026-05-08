"use client";

import { useEffect, useMemo, useState } from "react";
import { getBuyerOrders } from "./req-res";
import { getMe } from "../req-res";
import type { BuyerOrder, BuyerOrderStatus } from "./interfaces";
import Link from "next/link";
import { Loader2, PackageSearch, ShoppingBag, Clock, CheckCircle2, XCircle, RefreshCw, Truck, ShieldCheck, ArrowRight, Filter, ChevronRight } from "lucide-react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "motion/react";

const STATUS_OPTIONS: Array<{ label: string; value: "all" | BuyerOrderStatus; icon: any }> = [
  { label: "All",         value: "all",         icon: ShoppingBag },
  { label: "Pending",     value: "pending",      icon: Clock },
  { label: "Active",      value: "active",       icon: Truck },
  { label: "Delivered",   value: "delivered",    icon: PackageSearch },
  { label: "Completed",   value: "completed",    icon: CheckCircle2 },
  { label: "Cancelled",   value: "cancelled",    icon: XCircle },
  { label: "In Revision", value: "in_revision",  icon: RefreshCw },
];

const STATUS_STYLE: Record<string, { bg: string; color: string; border: string; label: string }> = {
  pending:     { bg: "#F9FAFB", color: "#111827", border: "#E5E7EB", label: "Pending" },
  active:      { bg: "#F3F4F6", color: "#111827", border: "#D1D5DB", label: "Active" },
  delivered:   { bg: "#F3F4F6", color: "#111827", border: "#D1D5DB", label: "Delivered" },
  completed:   { bg: "#111827", color: "#FFFFFF", border: "#111827", label: "Completed" },
  cancelled:   { bg: "#FEF2F2", color: "#991B1B", border: "#FEE2E2", label: "Cancelled" },
  in_revision: { bg: "#FFFBEB", color: "#92400E", border: "#FEF3C7", label: "Revision" },
};

function formatDate(value?: string) {
  if (!value) return "—";
  return new Date(value).toLocaleDateString(undefined, { 
    year: "numeric", 
    month: "short", 
    day: "numeric" 
  });
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

  if (idVerified === null || (isLoading && orders.length === 0)) {
    return (
      <div className="max-w-6xl mx-auto p-8 bg-white min-h-screen">
        <div className="h-10 w-64 bg-gray-100 rounded-lg mb-8 animate-pulse" />
        <div className="space-y-6">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-40 bg-white border border-gray-100 rounded-xl animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  if (!idVerified) {
    return (
      <div className="max-w-md mx-auto p-8 mt-24 bg-white">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white border border-gray-200 p-10 text-center rounded-2xl shadow-sm"
        >
          <div className="w-16 h-16 rounded-full mx-auto mb-6 flex items-center justify-center bg-gray-50 text-black border border-gray-200">
            <ShieldCheck className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-bold mb-3 text-black">Identity Verification</h2>
          <p className="text-sm text-gray-500 mb-8 leading-relaxed">
            Please verify your identity using the <strong className="text-black">JobMe mobile app</strong> to access your orders.
          </p>
          <div className="space-y-3">
            <Link 
              href="/verify-identity" 
              className="block w-full py-3 bg-black text-white rounded-xl font-bold hover:bg-gray-900 transition-colors"
            >
              Verify Identity
            </Link>
            <Link 
              href="/browse" 
              className="block w-full py-2 text-sm font-medium text-gray-400 hover:text-black transition-colors"
            >
              Return to marketplace
            </Link>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 pb-20 bg-white min-h-screen">
      {/* Header */}
      <motion.div 
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-12 mt-12"
      >
        <p className="text-[11px] font-black uppercase tracking-[0.2em] text-gray-400 mb-2">Account Dashboard</p>
        <h1 className="text-4xl font-black text-black tracking-tighter mb-2">My Orders</h1>
        <div className="h-1 w-12 bg-black rounded-full" />
      </motion.div>

      {/* Filter Tabs - Monochrome Premium */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10 border-b border-gray-100 pb-6">
        <div className="flex flex-wrap gap-1.5">
          {STATUS_OPTIONS.map(({ label, value, icon: Icon }) => {
            const active = status === value;
            return (
              <button
                key={value}
                onClick={() => { setStatus(value); setPage(1); }}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-[13px] font-bold transition-all
                  ${active ? "bg-black text-white" : "bg-transparent text-gray-500 hover:text-black hover:bg-gray-50"}`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{label}</span>
              </button>
            );
          })}
        </div>
        <div className="flex items-center gap-2 text-[12px] font-bold text-gray-400">
          <Filter className="w-3 h-3" />
          <span>{totalCount} Active Projects</span>
        </div>
      </div>

      {error && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="p-4 rounded-xl bg-red-50 border border-red-100 text-red-600 text-[13px] mb-8 font-bold flex items-center gap-3"
        >
          <XCircle className="w-4 h-4" />
          {error}
        </motion.div>
      )}

      {/* Orders list - Black & White Aesthetic */}
      <AnimatePresence mode="wait">
        {isLoading && orders.length === 0 ? (
          <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-6">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-48 bg-gray-50 border border-gray-100 rounded-2xl animate-pulse" />
            ))}
          </motion.div>
        ) : orders.length === 0 ? (
          <motion.div 
            key="empty"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            className="py-24 text-center border-2 border-dashed border-gray-100 rounded-3xl"
          >
            <div className="w-16 h-16 bg-gray-50 rounded-full mx-auto mb-6 flex items-center justify-center text-gray-300">
              <ShoppingBag className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-black text-black mb-2">No orders found</h3>
            <p className="text-gray-400 max-w-xs mx-auto text-sm font-medium">Your purchase history is currently empty. Start exploring the marketplace!</p>
            <Link href="/browse" className="inline-block mt-8 px-8 py-3 bg-black text-white rounded-xl font-bold text-sm hover:bg-gray-900 transition-colors">
              Explore Gigs
            </Link>
          </motion.div>
        ) : (
          <motion.div key="list" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
            {orders.map((order, index) => {
              const sty = STATUS_STYLE[order.status] ?? { bg: "#F9FAFB", color: "#111827", border: "#E5E7EB", label: order.status };
              return (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  key={order._id}
                >
                  <Link
                    href={`/orders-to-buy/${order._id}`}
                    className="block bg-white border border-gray-200 rounded-2xl overflow-hidden hover:border-black transition-all duration-300 group shadow-sm hover:shadow-xl hover:shadow-black/5"
                  >
                    <div className="flex flex-col lg:flex-row">
                      {/* Left: Thumbnail */}
                      <div className="w-full lg:w-72 h-52 lg:h-auto overflow-hidden relative border-r border-gray-50">
                        {order.gig.images?.[0] ? (
                          <img 
                            src={order.gig.images[0]} 
                            alt={order.gig.title} 
                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" 
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-gray-50">
                            <PackageSearch className="w-10 h-10 text-gray-200" />
                          </div>
                        )}
                        <div className="absolute top-4 left-4">
                          <span className="px-3 py-1 rounded-full bg-black/80 backdrop-blur-sm text-[9px] font-black uppercase tracking-widest text-white">
                            {order.isRegular ? "Standard" : "Custom Offer"}
                          </span>
                        </div>
                      </div>

                      {/* Right: Content */}
                      <div className="flex-1 p-8 flex flex-col">
                        <div className="flex flex-col md:flex-row md:items-start justify-between gap-6 mb-8">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-3 text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                              <span>Order #{order._id.slice(-8)}</span>
                              <span className="w-1 h-1 rounded-full bg-gray-200" />
                              <span>{formatDate(order.createdAt)}</span>
                            </div>
                            <h2 className="text-2xl font-black text-black leading-tight mb-2 group-hover:underline decoration-black decoration-2 underline-offset-4">
                              {order.gig.title}
                            </h2>
                            <p className="text-[13px] font-bold text-gray-400">{order.gig.category}</p>
                          </div>

                          <div className="flex flex-col md:items-end gap-3">
                            <span 
                              className="px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-wider border"
                              style={{ backgroundColor: sty.bg, color: sty.color, borderColor: sty.border }}
                            >
                              {sty.label}
                            </span>
                            <div className="text-3xl font-black text-black tracking-tighter">
                              {order.price?.toLocaleString()} <span className="text-sm font-bold text-gray-400">DA</span>
                            </div>
                          </div>
                        </div>

                        <div className="mt-auto pt-6 border-t border-gray-50 flex flex-wrap items-center justify-between gap-4">
                          <div className="flex items-center gap-8">
                            {/* Seller Mini Profile */}
                            <div className="flex items-center gap-3">
                              <div className="w-9 h-9 rounded-full overflow-hidden border border-gray-100 bg-gray-50">
                                <img 
                                  src={order.seller.pfp || "https://res.cloudinary.com/dztptq6q1/image/upload/v1756046508/user_rencds.png"} 
                                  alt={order.seller.name} 
                                  className="w-full h-full object-cover" 
                                />
                              </div>
                              <div className="flex flex-col">
                                <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none mb-1">Seller</span>
                                <span className="text-[14px] font-bold text-black">{order.seller.name}</span>
                              </div>
                            </div>

                            {/* Deadline Info */}
                            <div className="hidden sm:flex flex-col">
                              <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none mb-1">Due Date</span>
                              <div className="flex items-center gap-2">
                                <Clock className="w-3.5 h-3.5 text-black" />
                                <span className="text-[14px] font-bold text-black">{formatDate(order.expectedDelivery)}</span>
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-2 text-black font-black text-[12px] uppercase tracking-widest group-hover:translate-x-1 transition-transform">
                            View Project <ChevronRight className="w-4 h-4" />
                          </div>
                        </div>
                      </div>
                    </div>

                    {order.reported && (
                      <div className="px-8 py-3 bg-red-50 flex items-center justify-between border-t border-red-100">
                        <div className="flex items-center gap-3 text-red-700">
                          <ShieldCheck className="w-4 h-4" />
                          <span className="text-[11px] font-black uppercase tracking-widest">Active Dispute</span>
                        </div>
                        <span className="text-[12px] font-bold text-red-600 underline">Case Details &rarr;</span>
                      </div>
                    )}
                  </Link>
                </motion.div>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Pagination - Minimalist */}
      {totalPages > 1 && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mt-16 flex items-center justify-center gap-4"
        >
          <button
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page <= 1 || isLoading}
            className="w-10 h-10 rounded-full flex items-center justify-center border border-gray-200 hover:border-black hover:bg-black hover:text-white transition-all disabled:opacity-30 disabled:cursor-not-allowed"
          >
            &larr;
          </button>
          <div className="flex items-center gap-2 font-black text-[14px]">
            <span className="text-black">{page}</span>
            <span className="text-gray-300">/</span>
            <span className="text-gray-300">{totalPages}</span>
          </div>
          <button
            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
            disabled={page >= totalPages || isLoading}
            className="w-10 h-10 rounded-full flex items-center justify-center border border-gray-200 hover:border-black hover:bg-black hover:text-white transition-all disabled:opacity-30 disabled:cursor-not-allowed"
          >
            &rarr;
          </button>
        </motion.div>
      )}
    </div>
  );
}