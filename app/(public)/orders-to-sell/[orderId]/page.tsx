"use client";

import { useEffect, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { getSellerOrderById, updateSellerOrderStatus, submitDelivery } from "./req-res";
import type { SellerExpandedOrder, SimpleOrderStatus } from "./interfaces";
import { motion, AnimatePresence } from "motion/react";
import {
  ArrowLeft, Clock, Package, Star,
  RotateCcw, AlertTriangle, CheckCircle2,
  FileText, MessageSquare,
  Calendar, User, Upload,
  CheckCircle, XCircle, AlertCircle,
  Play, Send, Loader2, Plus, Trash2, Link, Github, Info
} from "lucide-react";

function formatDate(value?: string) {
  if (!value) return "—";
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? "—" : d.toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}

const NEXT_STATUS: Record<SimpleOrderStatus, Array<{ value: SimpleOrderStatus; label: string; icon: any; color: string }>> = {
  pending: [
    { value: "active", label: "Accept & Start", icon: Play, color: "#10B981" },
    { value: "cancelled", label: "Decline Order", icon: XCircle, color: "#EF4444" }
  ],
  active: [
    { value: "delivered", label: "Deliver Work", icon: Send, color: "#8B5CF6" },
    { value: "cancelled", label: "Cancel Order", icon: XCircle, color: "#EF4444" }
  ],
  delivered: [
    { value: "completed", label: "Force Complete", icon: CheckCircle2, color: "#10B981" },
    { value: "in_revision", label: "Mock Revision", icon: RotateCcw, color: "#F59E0B" }
  ],
  in_revision: [
    { value: "delivered", label: "Re-Deliver", icon: Send, color: "#8B5CF6" }
  ],
  completed: [],
  cancelled: [],
};

function statusInfo(status: SimpleOrderStatus) {
  switch (status) {
    case "pending":
      return { icon: Clock, color: "#FCD34D", bg: "rgba(251,191,36,0.12)", label: "Waiting for you" };
    case "active":
      return { icon: Play, color: "#93C5FD", bg: "rgba(59,130,246,0.12)", label: "Order Active" };
    case "delivered":
      return { icon: Send, color: "#C4B5FD", bg: "rgba(124,58,237,0.12)", label: "Delivered" };
    case "completed":
      return { icon: CheckCircle2, color: "#6EE7B7", bg: "rgba(52,211,153,0.12)", label: "Completed" };
    case "cancelled":
      return { icon: XCircle, color: "#FCA5A5", bg: "rgba(239,68,68,0.12)", label: "Cancelled" };
    case "in_revision":
      return { icon: RotateCcw, color: "#FDB07A", bg: "rgba(249,115,22,0.12)", label: "Under Revision" };
    default:
      return { icon: AlertCircle, color: "#94A3B8", bg: "rgba(148,163,184,0.12)", label: status };
  }
}

export default function SellerOrderExpandedPage() {
  const router = useRouter();
  const params = useParams<{ orderId: string }>();
  const orderId = params?.orderId ?? "";

  const [order, setOrder] = useState<SellerExpandedOrder | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const [statusError, setStatusError] = useState("");
  const [statusSuccess, setStatusSuccess] = useState("");

  // Delivery modal state
  const [showDeliveryModal, setShowDeliveryModal] = useState(false);
  const [deliveryMessage, setDeliveryMessage] = useState("");
  const [deliveryFiles, setDeliveryFiles] = useState<File[]>([]);
  const [deliveryLinks, setDeliveryLinks] = useState<string[]>([""]);
  const [isSubmittingDelivery, setIsSubmittingDelivery] = useState(false);
  const [deliveryError, setDeliveryError] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  const [activeTab, setActiveTab] = useState<'overview' | 'requirements' | 'deliverables'>('overview');

  useEffect(() => {
    let mounted = true;
    (async () => {
      if (!orderId) return;
      setLoading(true);
      setError("");
      try {
        const data = await getSellerOrderById(orderId);
        if (!mounted) return;
        setOrder(data);
      } catch (e) {
        if (!mounted) return;
        setError(e instanceof Error ? e.message : "Failed to load order.");
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, [orderId]);

  const onUpdateStatus = async (nextStatus: SimpleOrderStatus) => {
    if (!order?._id) return;
    setIsUpdatingStatus(true);
    setStatusError("");
    setStatusSuccess("");
    try {
      const data = await updateSellerOrderStatus(order._id, nextStatus, (order as any).isRegular);
      setOrder(data.order);
      setStatusSuccess(data.message || `Order updated to ${nextStatus}`);
    } catch (e) {
      setStatusError(e instanceof Error ? e.message : "Update failed.");
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  const openDeliveryModal = () => {
    setDeliveryMessage("");
    setDeliveryFiles([]);
    setDeliveryLinks([""]);
    setDeliveryError("");
    setShowDeliveryModal(true);
  };

  const onFileDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const dropped = Array.from(e.dataTransfer.files);
    setDeliveryFiles(prev => [...prev, ...dropped].slice(0, 5));
  };

  const onFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    const selected = Array.from(e.target.files);
    setDeliveryFiles(prev => [...prev, ...selected].slice(0, 5));
  };

  const onSubmitDelivery = async () => {
    if (!order?._id) return;
    if (!deliveryMessage.trim()) { setDeliveryError("Delivery message is required."); return; }
    const validLinks = deliveryLinks.filter(l => l.trim());
    if (deliveryFiles.length === 0 && validLinks.length === 0) {
      setDeliveryError("Please attach at least one file or link."); return;
    }
    setIsSubmittingDelivery(true);
    setDeliveryError("");
    try {
      const result = await submitDelivery(
        order._id,
        deliveryMessage,
        deliveryFiles,
        validLinks,
        (order as any).isRegular
      );
      setOrder(result.order);
      setShowDeliveryModal(false);
      setStatusSuccess("Work delivered successfully! The buyer has been notified.");
      setActiveTab('deliverables');
    } catch (e) {
      setDeliveryError(e instanceof Error ? e.message : "Delivery failed.");
    } finally {
      setIsSubmittingDelivery(false);
    }
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <Loader2 className="w-10 h-10 animate-spin text-violet-500" />
    </div>
  );

  if (error || !order) return (
    <div className="max-w-xl mx-auto mt-20 p-8 glass-card-dark text-center">
      <AlertTriangle className="w-12 h-12 text-red-400 mx-auto mb-4" />
      <h2 className="text-xl font-bold text-white mb-2">{error || "Order Not Found"}</h2>
      <button onClick={() => router.push("/orders-to-sell")} className="grad-btn px-6 py-2 mt-4">Back to Sales</button>
    </div>
  );

  const status = statusInfo(order.status);
  const StatusIcon = status.icon;
  const allowedActions = NEXT_STATUS[order.status] || [];

  return (
    <>
      <div className="max-w-7xl mx-auto px-4 py-8 pb-24">
      {/* Top Nav */}
      <motion.button 
        initial={{ opacity: 0, x: -10 }}
        animate={{ opacity: 1, x: 0 }}
        onClick={() => router.push("/orders-to-sell")}
        className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors mb-8 group"
      >
        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
        <span className="text-sm font-bold uppercase tracking-wider">Back to Dashboard</span>
      </motion.button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        
        {/* LEFT: Main Content */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* Header Card */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-card-dark p-8 relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-64 h-64 bg-violet-500/5 blur-[100px] -mr-32 -mt-32" />
            <div className="flex flex-col md:flex-row gap-8 relative z-10">
              <div className="w-full md:w-56 h-40 rounded-2xl overflow-hidden flex-shrink-0 border border-white/5 shadow-2xl">
                {order.gig.images?.[0] ? (
                  <img src={order.gig.images[0]} alt={order.gig.title} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full bg-white/5 flex items-center justify-center"><Package className="text-gray-700" /></div>
                )}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-3">
                  <span className="px-3 py-1 rounded-full bg-violet-500/10 text-violet-400 text-[10px] font-black uppercase tracking-widest border border-violet-500/20">
                    ID: #{order._id.slice(-8)}
                  </span>
                  <span className="text-gray-700">•</span>
                  <span className="text-[12px] text-gray-500 font-bold">{formatDate(order.createdAt)}</span>
                </div>
                <h1 className="text-3xl font-black text-white leading-tight mb-2 tracking-tight">{order.gig.title}</h1>
                <p className="text-violet-400 font-bold text-sm tracking-wide">{order.gig.category}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-10 pt-8 border-t border-white/5 relative z-10">
              <div className="space-y-1">
                <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Earnings</p>
                <p className="text-xl font-black text-white">{order.price.toLocaleString()} <span className="text-[12px] font-bold text-gray-500">DA</span></p>
              </div>
              <div className="space-y-1">
                <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Type</p>
                <p className="text-xl font-black text-white">{order.isRegular ? "Package" : "Custom"}</p>
              </div>
              <div className="space-y-1">
                <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Deadline</p>
                <p className="text-xl font-black text-white">{new Date(order.expectedDelivery).toLocaleDateString()}</p>
              </div>
              <div className="space-y-1">
                <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Revisions</p>
                <p className="text-xl font-black text-white">{order.revisions}</p>
              </div>
            </div>
          </motion.div>

          {/* Tabs */}
          <div className="flex gap-2 p-1.5 bg-white/5 rounded-2xl border border-white/5 overflow-x-auto no-scrollbar">
            {[
              { id: 'overview', label: 'Overview', icon: Info },
              { id: 'requirements', label: 'Buyer Info', icon: User },
              { id: 'deliverables', label: 'Deliverables', icon: Upload },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-bold transition-all
                  ${activeTab === tab.id ? "bg-violet-500 text-white shadow-lg shadow-violet-500/20" : "text-gray-400 hover:text-white hover:bg-white/5"}`}
              >
                <tab.icon className="w-4 h-4" />
                {tab.label}
              </button>
            ))}
          </div>

          <AnimatePresence mode="wait">
            {activeTab === 'overview' && (
              <motion.div key="overview" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-8">
                <section className="glass-card-dark p-8">
                  <h2 className="text-xl font-black text-white mb-6 flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-violet-400" /> Payment & Timeline
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-4">
                      <div className="flex justify-between items-center p-4 rounded-xl bg-white/5 border border-white/5">
                        <span className="text-sm font-bold text-gray-400">Status</span>
                        <span className="text-sm font-black text-white uppercase tracking-widest">{order.payment.status}</span>
                      </div>
                      <div className="flex justify-between items-center p-4 rounded-xl bg-white/5 border border-white/5">
                        <span className="text-sm font-bold text-gray-400">Method</span>
                        <span className="text-sm font-black text-white">Direct Transfer</span>
                      </div>
                    </div>
                    <div className="space-y-4">
                      <div className="flex justify-between items-center p-4 rounded-xl bg-white/5 border border-white/5">
                        <span className="text-sm font-bold text-gray-400">Ordered</span>
                        <span className="text-sm font-black text-white">{formatDate(order.createdAt)}</span>
                      </div>
                      <div className="flex justify-between items-center p-4 rounded-xl bg-white/5 border border-white/5">
                        <span className="text-sm font-bold text-gray-400">Started</span>
                        <span className="text-sm font-black text-white">{order.timeline?.started ? formatDate(order.timeline.started) : "Not started"}</span>
                      </div>
                    </div>
                  </div>
                </section>

                {order.review && (
                  <section className="glass-card-dark p-8 border-l-4 border-amber-500/50">
                    <h2 className="text-xl font-black text-white mb-4">Buyer Review</h2>
                    <div className="flex items-center gap-1 text-amber-500 mb-3">
                      {[...Array(5)].map((_, i) => <Star key={i} className={`w-4 h-4 ${i < order.review!.rating ? "fill-current" : "opacity-20"}`} />)}
                    </div>
                    <p className="text-lg text-white font-medium italic">\"{order.review.comment}\"</p>
                  </section>
                )}
              </motion.div>
            )}

            {activeTab === 'requirements' && (
              <motion.div key="requirements" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-8">
                <section className="glass-card-dark p-8">
                  <h2 className="text-xl font-black text-white mb-6 flex items-center gap-2">
                    <FileText className="w-5 h-5 text-violet-400" /> Buyer Requirements
                  </h2>
                  {order.requirements?.length ? (
                    <div className="space-y-4">
                      {order.requirements.map((r, i) => (
                        <div key={i} className="p-8 bg-white/5 border border-white/5 rounded-2xl">
                          <p className="text-[10px] font-black text-violet-400 uppercase tracking-widest mb-2">Question {i+1}</p>
                          <p className="text-white font-bold mb-4">{r.question}</p>
                          <div className="p-4 rounded-xl bg-black/20 text-gray-400 italic text-sm">{r.answer || "Buyer didn't provide a text answer."}</div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="p-12 text-center bg-white/5 rounded-2xl border border-dashed border-white/10">
                      <p className="text-gray-500 font-bold">No specific requirements were set for this gig.</p>
                    </div>
                  )}
                </section>
              </motion.div>
            )}

            {activeTab === 'deliverables' && (
              <motion.div key="deliverables" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-8">
                <section className="glass-card-dark p-8">
                  <h2 className="text-xl font-black text-white mb-6 flex items-center gap-2">
                    <Upload className="w-5 h-5 text-emerald-400" /> Files Submitted
                  </h2>
                  {order.deliverables?.length ? (
                    <div className="space-y-4">
                      {order.deliverables.map((d, i) => (
                        <div key={i} className="p-6 rounded-2xl bg-white/5 border border-white/5">
                          <div className="flex justify-between items-start mb-4">
                            <div>
                              <p className="text-white font-bold text-lg">{d.description || "Final Delivery"}</p>
                              <p className="text-xs text-gray-500 font-bold uppercase tracking-widest">Delivered on {formatDate(d.deliveredAt)}</p>
                            </div>
                            <CheckCircle className="w-6 h-6 text-emerald-500" />
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                            {d.files?.map((f, idx) => (
                              <div key={idx} className="p-3 rounded-xl bg-white/5 border border-white/5 text-sm font-bold text-violet-300 flex items-center gap-2">
                                <FileText className="w-4 h-4" /> <span className="truncate">{f.split('/').pop()}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="p-12 text-center bg-white/5 rounded-2xl border border-dashed border-white/10">
                      <p className="text-gray-500 font-bold">You haven't submitted any files yet.</p>
                    </div>
                  )}
                </section>
                
                {order.revisionRequests?.length ? (
                  <section className="glass-card-dark p-8 border-l-4 border-orange-500/50">
                    <h2 className="text-xl font-black text-white mb-6">Revision Requests</h2>
                    <div className="space-y-4">
                      {order.revisionRequests.map((r, i) => (
                        <div key={i} className="p-5 rounded-2xl bg-white/5 border border-white/5">
                          <div className="flex justify-between items-center mb-3">
                            <span className="text-xs font-black uppercase tracking-widest text-orange-400">Request #{i+1}</span>
                            <span className="text-[10px] font-bold text-gray-500">{formatDate(r.requestedAt)}</span>
                          </div>
                          <p className="text-white font-medium italic">\"{r.description}\"</p>
                        </div>
                      ))}
                    </div>
                  </section>
                ) : null}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* RIGHT: Actions & Sidebar */}
        <div className="space-y-8">
          
          {/* Status Tracker */}
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="glass-card-dark p-8">
            <h3 className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-6">Status Management</h3>
            <div className="flex items-center gap-4 mb-8">
              <div className="p-4 rounded-2xl shadow-xl" style={{ background: status.bg, color: status.color }}>
                <StatusIcon className="w-8 h-8" />
              </div>
              <div>
                <p className="text-2xl font-black text-white leading-none mb-2">{status.label}</p>
                <p className="text-[11px] text-gray-500 font-bold uppercase tracking-wider">Status: {order.status}</p>
              </div>
            </div>

            <div className="space-y-3">
              {allowedActions.length > 0 ? allowedActions.map(act => (
                <button
                  key={act.value}
                  onClick={() => act.value === "delivered" ? openDeliveryModal() : onUpdateStatus(act.value)}
                  disabled={isUpdatingStatus}
                  className="w-full py-4 rounded-2xl border transition-all flex items-center justify-center gap-3 font-black uppercase tracking-widest text-[11px] disabled:opacity-50"
                  style={{ borderColor: `${act.color}40`, background: `${act.color}10`, color: act.color }}
                >
                  {isUpdatingStatus ? <Loader2 className="w-4 h-4 animate-spin" /> : <act.icon className="w-4 h-4" />}
                  {act.label}
                </button>
              )) : (
                <div className="p-4 text-center rounded-xl bg-white/5 border border-white/5">
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Final Stage</p>
                </div>
              )}
            </div>
            {statusError && <p className="mt-4 text-xs text-red-400 font-bold text-center">{statusError}</p>}
            {statusSuccess && <p className="mt-4 text-xs text-emerald-400 font-bold text-center">{statusSuccess}</p>}
          </motion.div>

          {/* Participant Sidebar */}
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }} className="glass-card-dark p-8 text-center group">
            <h3 className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-6 text-left">Buyer</h3>
            <div className="w-24 h-24 rounded-full border-4 border-violet-500/10 overflow-hidden mx-auto mb-4 p-1 group-hover:border-violet-500/30 transition-all duration-500">
              <img src={order.buyer.pfp || "https://res.cloudinary.com/dztptq6q1/image/upload/v1756046508/user_rencds.png"} alt={order.buyer.name} className="w-full h-full object-cover rounded-full" />
            </div>
            <h4 className="text-xl font-black text-white mb-1 tracking-tight">{order.buyer.name}</h4>
            <p className="text-sm text-gray-500 font-bold mb-6 italic">{order.buyer.email || "Verified Member"}</p>
            <button 
              onClick={() => router.push(`/chats/${order.buyer._id}?gigId=${order.gig._id}`)}
              className="flex items-center justify-center gap-2 w-full py-3.5 rounded-xl bg-violet-500 text-white font-black uppercase tracking-widest text-[11px] hover:bg-violet-400 transition-all shadow-xl shadow-violet-500/20"
            >
              <MessageSquare className="w-4 h-4" /> Chat with Buyer
            </button>
          </motion.div>

        </div>

      </div>
    </div>

    {/* ── Delivery Modal ── */}
    <AnimatePresence>
      {showDeliveryModal && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
          onClick={(e) => { if (e.target === e.currentTarget) setShowDeliveryModal(false); }}
        >
          <motion.div
            initial={{ opacity: 0, y: 60 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 60 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="w-full max-w-2xl bg-[#0e0e14] border border-white/10 rounded-3xl overflow-hidden shadow-2xl"
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between px-8 py-6 border-b border-white/5">
              <div>
                <p className="text-[10px] font-black text-violet-400 uppercase tracking-widest mb-1">Order Delivery</p>
                <h2 className="text-2xl font-black text-white tracking-tight">Submit Your Work</h2>
              </div>
              <button onClick={() => setShowDeliveryModal(false)} className="w-10 h-10 flex items-center justify-center rounded-xl bg-white/5 hover:bg-white/10 transition-all">
                <XCircle className="w-5 h-5 text-gray-400" />
              </button>
            </div>

            <div className="px-8 py-6 space-y-6 max-h-[70vh] overflow-y-auto">
              {/* Message */}
              <div>
                <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2">Delivery Message <span className="text-red-400">*</span></label>
                <textarea
                  value={deliveryMessage}
                  onChange={e => setDeliveryMessage(e.target.value)}
                  placeholder="Describe what you've delivered, any notes for the buyer, and how to use the work..."
                  rows={4}
                  className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-3 text-white text-sm placeholder-gray-600 resize-none focus:outline-none focus:border-violet-500/50 transition-all"
                />
              </div>

              {/* File Upload */}
              <div>
                <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2">Files <span className="text-gray-600">(up to 5, any type)</span></label>
                <div
                  onDragOver={e => { e.preventDefault(); setIsDragging(true); }}
                  onDragLeave={() => setIsDragging(false)}
                  onDrop={onFileDrop}
                  onClick={() => fileInputRef.current?.click()}
                  className={`border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition-all ${isDragging ? "border-violet-500 bg-violet-500/10" : "border-white/10 hover:border-violet-500/40 hover:bg-white/5"}`}
                >
                  <Upload className="w-8 h-8 text-gray-600 mx-auto mb-2" />
                  <p className="text-sm font-bold text-gray-400">Drag & drop files or <span className="text-violet-400">click to browse</span></p>
                  <p className="text-xs text-gray-600 mt-1">Images, PDFs, ZIPs, source code — any file up to 25MB</p>
                  <input ref={fileInputRef} type="file" multiple className="hidden" onChange={onFileSelect} />
                </div>
                {deliveryFiles.length > 0 && (
                  <div className="mt-3 space-y-2">
                    {deliveryFiles.map((f, i) => (
                      <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/5">
                        <div className="flex items-center gap-2 min-w-0">
                          <FileText className="w-4 h-4 text-violet-400 flex-shrink-0" />
                          <span className="text-sm text-white font-medium truncate">{f.name}</span>
                          <span className="text-xs text-gray-500 flex-shrink-0">({(f.size / 1024).toFixed(0)} KB)</span>
                        </div>
                        <button onClick={() => setDeliveryFiles(prev => prev.filter((_, idx) => idx !== i))} className="text-gray-600 hover:text-red-400 transition-colors flex-shrink-0 ml-2">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Links */}
              <div>
                <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2">
                  <Github className="w-3 h-3 inline mr-1" />GitHub / External Links
                </label>
                <div className="space-y-2">
                  {deliveryLinks.map((link, i) => (
                    <div key={i} className="flex gap-2">
                      <div className="flex-1 flex items-center gap-2 bg-white/5 border border-white/10 rounded-xl px-3 focus-within:border-violet-500/50 transition-all">
                        <Link className="w-4 h-4 text-gray-600 flex-shrink-0" />
                        <input
                          type="url"
                          value={link}
                          onChange={e => setDeliveryLinks(prev => prev.map((l, idx) => idx === i ? e.target.value : l))}
                          placeholder="https://github.com/your/repo or any URL"
                          className="flex-1 bg-transparent py-3 text-sm text-white placeholder-gray-600 focus:outline-none"
                        />
                      </div>
                      {deliveryLinks.length > 1 && (
                        <button onClick={() => setDeliveryLinks(prev => prev.filter((_, idx) => idx !== i))} className="w-10 h-10 flex items-center justify-center rounded-xl bg-white/5 hover:bg-red-500/10 text-gray-600 hover:text-red-400 transition-all">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  ))}
                  {deliveryLinks.length < 5 && (
                    <button onClick={() => setDeliveryLinks(prev => [...prev, ""])} className="flex items-center gap-2 text-xs font-bold text-violet-400 hover:text-violet-300 transition-colors py-1">
                      <Plus className="w-3.5 h-3.5" /> Add another link
                    </button>
                  )}
                </div>
              </div>

              {deliveryError && (
                <div className="flex items-center gap-2 p-3 rounded-xl bg-red-500/10 border border-red-500/20">
                  <AlertTriangle className="w-4 h-4 text-red-400 flex-shrink-0" />
                  <p className="text-sm text-red-400 font-medium">{deliveryError}</p>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="flex gap-3 px-8 py-5 border-t border-white/5">
              <button onClick={() => setShowDeliveryModal(false)} className="flex-1 py-3.5 rounded-xl border border-white/10 text-gray-400 font-black uppercase tracking-widest text-[11px] hover:bg-white/5 transition-all">
                Cancel
              </button>
              <button
                onClick={onSubmitDelivery}
                disabled={isSubmittingDelivery}
                className="flex-1 py-3.5 rounded-xl bg-violet-600 hover:bg-violet-500 text-white font-black uppercase tracking-widest text-[11px] flex items-center justify-center gap-2 transition-all shadow-xl shadow-violet-500/20 disabled:opacity-50"
              >
                {isSubmittingDelivery ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                {isSubmittingDelivery ? "Delivering..." : "Submit Delivery"}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
    </>
  );
}
