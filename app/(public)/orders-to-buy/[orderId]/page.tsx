"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  getBuyerOrderById,
  addBuyerOrderReview,
  requestBuyerRevision,
  submitBuyerOrderReport,
  updateBuyerOrderStatus,
} from "./req-res";
import type {
  BuyerExpandedOrder,
  ReportCategory,
  ReportSeverity,
  SimpleOrderStatus,
  SubmittedOrderReport,
} from "./interfaces";
import { motion, AnimatePresence } from "motion/react";
import { 
  ArrowLeft, Clock, DollarSign, Package, Star, 
  RotateCcw, AlertTriangle, CheckCircle2, 
  FileText, MessageSquare, ShieldCheck, 
  ChevronRight,  Calendar, User, Upload, Info,
  CheckCircle, XCircle, AlertCircle, Loader2,
  ExternalLink, Github, Download, PlayCircle, Send
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

function statusInfo(status: SimpleOrderStatus) {
  switch (status) {
    case "pending":
      return { icon: Clock, color: "#FCD34D", bg: "rgba(251,191,36,0.08)", label: "Waiting for Requirements" };
    case "active":
      return { icon: PlayCircle, color: "#3B82F6", bg: "rgba(59,130,246,0.08)", label: "Order in Progress" };
    case "delivered":
      return { icon: Send, color: "#8B5CF6", bg: "rgba(139,92,246,0.08)", label: "Work Delivered" };
    case "completed":
      return { icon: CheckCircle2, color: "#10B981", bg: "rgba(16,185,129,0.08)", label: "Order Completed" };
    case "cancelled":
      return { icon: XCircle, color: "#EF4444", bg: "rgba(239,68,68,0.08)", label: "Order Cancelled" };
    case "in_revision":
      return { icon: RotateCcw, color: "#F59E0B", bg: "rgba(245,158,11,0.08)", label: "Revision in Progress" };
    default:
      return { icon: AlertCircle, color: "#6B7280", bg: "rgba(107,114,128,0.08)", label: status };
  }
}

// Using PlayCircle from lucide-react imports above

const REPORT_CATEGORIES: Array<{ value: ReportCategory; label: string }> = [
  { value: "non_delivery", label: "Non-delivery" },
  { value: "fake_service", label: "Fake service" },
  { value: "poor_quality", label: "Poor quality" },
  { value: "scam", label: "Scam" },
  { value: "overcharge", label: "Overcharge" },
  { value: "harassment", label: "Harassment" },
  { value: "other", label: "Other" },
];

const REPORT_SEVERITIES: Array<{ value: ReportSeverity; label: string }> = [
  { value: "low", label: "Low" },
  { value: "medium", label: "Medium" },
  { value: "high", label: "High" },
  { value: "critical", label: "Critical" },
];

function formatFileSize(bytes: number) {
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default function BuyerOrderExpandedPage() {
  const router = useRouter();
  const params = useParams<{ orderId: string }>();
  const orderId = params?.orderId ?? "";

  const [order, setOrder] = useState<BuyerExpandedOrder | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);
  const [reviewError, setReviewError] = useState("");
  const [reviewSuccess, setReviewSuccess] = useState("");

  const [revisionDescription, setRevisionDescription] = useState("");
  const [isRequestingRevision, setIsRequestingRevision] = useState(false);
  const [revisionError, setRevisionError] = useState("");
  const [revisionSuccess, setRevisionSuccess] = useState("");

  const [reportCategory, setReportCategory] = useState<ReportCategory>("non_delivery");
  const [reportSeverity, setReportSeverity] = useState<ReportSeverity>("high");
  const [reportDescription, setReportDescription] = useState("");
  const [reportScreenshots, setReportScreenshots] = useState<File[]>([]);
  const [isSubmittingReport, setIsSubmittingReport] = useState(false);
  const [reportError, setReportError] = useState("");
  const [reportSuccess, setReportSuccess] = useState("");
  const [submittedReport, setSubmittedReport] = useState<SubmittedOrderReport | null>(null);

  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const [statusUpdateError, setStatusUpdateError] = useState("");
  const [statusUpdateSuccess, setStatusUpdateSuccess] = useState("");

  const [activeTab, setActiveTab] = useState<'details' | 'actions' | 'report'>('details');

  useEffect(() => {
    let mounted = true;
    (async () => {
      if (!orderId) return;
      setLoading(true);
      setError("");
      try {
        const data = await getBuyerOrderById(orderId);
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

  const cover = useMemo(() => order?.gig?.images?.[0] ?? "", [order]);

  const onSubmitReview = async () => {
    if (!order?._id) return;
    if (!comment.trim()) {
      setReviewError("Please enter a comment.");
      return;
    }
    if (!rating || rating < 1 || rating > 5) {
      setReviewError("Please select a rating.");
      return;
    }
    setIsSubmittingReview(true);
    setReviewError("");
    setReviewSuccess("");
    try {
      const data = await addBuyerOrderReview(order._id, { rating, comment: comment.trim() }, (order as any).isRegular);
      setOrder(prev => prev ? { ...prev, review: data.review } : prev);
      setReviewSuccess("Review submitted successfully");
      setComment("");
    } catch (e) {
      setReviewError(e instanceof Error ? e.message : "Review submission failed.");
    } finally {
      setIsSubmittingReview(false);
    }
  };

  const onRequestRevision = async () => {
    if (!order?._id || !revisionDescription.trim()) return;
    setIsRequestingRevision(true);
    setRevisionError("");
    setReviewSuccess("");
    try {
      const data = await requestBuyerRevision(order._id, { description: revisionDescription.trim() }, (order as any).isRegular);
      setOrder(prev => prev ? { ...prev, revisionRequests: [...(prev.revisionRequests || []), data.revisionRequest] } : prev);
      setRevisionSuccess("Revision requested successfully");
      setRevisionDescription("");
    } catch (e) {
      setRevisionError(e instanceof Error ? e.message : "Revision request failed.");
    } finally {
      setIsRequestingRevision(false);
    }
  };

  const onSubmitReport = async () => {
    if (!order?._id || !reportDescription.trim()) return;
    setIsSubmittingReport(true);
    setReportError("");
    try {
      const payload = {
        reportedUserId: order.seller._id,
        orderId: order._id,
        category: reportCategory,
        severity: reportSeverity,
        description: reportDescription.trim(),
      };
      const data = await submitBuyerOrderReport(payload, reportScreenshots.length ? reportScreenshots : undefined);
      setSubmittedReport(data.report);
      setReportSuccess("Report filed successfully.");
    } catch (e) {
      setReportError(e instanceof Error ? e.message : "Report failed.");
    } finally {
      setIsSubmittingReport(false);
    }
  };

  const onAcceptDelivery = async () => {
    if (!order?._id) return;
    setIsUpdatingStatus(true);
    setStatusUpdateError("");
    setStatusUpdateSuccess("");
    try {
      const data = await updateBuyerOrderStatus(order._id, 'completed', (order as any).isRegular);
      setOrder(data.order);
      setStatusUpdateSuccess("Order completed! Thank you for your business.");
      setActiveTab('actions'); // Move to review tab
    } catch (e) {
      setStatusUpdateError(e instanceof Error ? e.message : "Update failed.");
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-white"><Loader2 className="w-10 h-10 animate-spin text-black" /></div>;

  if (error || !order) return (
    <div className="max-w-xl mx-auto mt-20 p-12 bg-white border border-gray-200 text-center rounded-3xl">
      <AlertTriangle className="w-12 h-12 text-black mx-auto mb-6" />
      <h2 className="text-2xl font-black text-black mb-4">{error || "Order Not Found"}</h2>
      <button onClick={() => router.push("/orders-to-buy")} className="px-8 py-3 bg-black text-white rounded-xl font-bold">Back to Orders</button>
    </div>
  );

  const status = statusInfo(order.status);
  const StatusIcon = status.icon;

  return (
    <div className="max-w-7xl mx-auto px-4 py-12 pb-24 bg-white min-h-screen">
      {/* Back Button */}
      <motion.button 
        initial={{ opacity: 0, x: -10 }}
        animate={{ opacity: 1, x: 0 }}
        onClick={() => router.push("/orders-to-buy")}
        className="flex items-center gap-2 text-gray-400 hover:text-black transition-colors mb-10 group font-bold text-sm"
      >
        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
        <span className="uppercase tracking-widest">Orders</span>
      </motion.button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 items-start">
        
        {/* LEFT COLUMN */}
        <div className="lg:col-span-2 space-y-12">
          
          {/* Header Card */}
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-white border-b border-gray-100 pb-12">
            <div className="flex flex-col md:flex-row gap-10 items-center md:items-start text-center md:text-left">
              <div className="w-full md:w-64 h-44 rounded-2xl overflow-hidden border border-gray-100 shadow-sm">
                {cover ? <img src={cover} alt={order.gig.title} className="w-full h-full object-cover" /> : <div className="w-full h-full bg-gray-50" />}
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-center md:justify-start gap-4 mb-4">
                  <span className="px-3 py-1 rounded-full bg-gray-50 border border-gray-100 text-[10px] font-black uppercase tracking-widest text-gray-500">Order #{order._id.slice(-8)}</span>
                  <span className="text-gray-200">•</span>
                  <span className="text-[12px] text-gray-400 font-bold">{formatDate(order.createdAt)}</span>
                </div>
                <h1 className="text-4xl font-black text-black leading-tight tracking-tighter mb-4">{order.gig.title}</h1>
                <p className="text-gray-400 font-bold text-sm tracking-wide">{order.gig.category}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mt-12 pt-10 border-t border-gray-50">
              <div className="space-y-1">
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Total Paid</p>
                <p className="text-2xl font-black text-black tracking-tighter">{order.price.toLocaleString()} <span className="text-[12px] text-gray-300">DA</span></p>
              </div>
              <div className="space-y-1">
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Duration</p>
                <p className="text-2xl font-black text-black tracking-tighter">{order.deliveryTime} <span className="text-[12px] text-gray-300">Days</span></p>
              </div>
              <div className="space-y-1">
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Revisions</p>
                <p className="text-2xl font-black text-black tracking-tighter">{order.revisions}</p>
              </div>
              <div className="space-y-1">
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Deadline</p>
                <p className="text-2xl font-black text-black tracking-tighter">{new Date(order.expectedDelivery).toLocaleDateString()}</p>
              </div>
            </div>
          </motion.div>

          {/* Navigation Tabs */}
          <div className="flex gap-1 border-b border-gray-100">
            {[
              { id: 'details', label: 'Order Content', icon: FileText },
              { id: 'actions', label: 'Actions', icon: MessageSquare },
              { id: 'report', label: 'Security', icon: ShieldCheck },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 px-8 py-4 text-sm font-black transition-all border-b-2
                  ${activeTab === tab.id ? "border-black text-black" : "border-transparent text-gray-400 hover:text-black"}`}
              >
                <tab.icon className="w-4 h-4" />
                <span className="uppercase tracking-widest text-[11px]">{tab.label}</span>
              </button>
            ))}
          </div>

          <AnimatePresence mode="wait">
            {activeTab === 'details' && (
              <motion.div key="details" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-12">
                {/* Requirements */}
                <section>
                  <h3 className="text-sm font-black text-black uppercase tracking-widest mb-6 flex items-center gap-3">
                    <div className="w-1.5 h-1.5 rounded-full bg-black" /> Buyer Requirements
                  </h3>
                  <div className="space-y-4">
                    {order.requirements?.map((r, i) => (
                      <div key={i} className="p-8 bg-gray-50 border border-gray-100 rounded-3xl">
                        <p className="text-black font-black text-lg mb-4">{r.question}</p>
                        <div className="p-6 bg-white border border-gray-200 rounded-2xl text-gray-500 font-medium leading-relaxed italic">
                          {r.answer || "No response provided."}
                        </div>
                      </div>
                    ))}
                  </div>
                </section>

                {/* Deliverables */}
                <section>
                  <h3 className="text-sm font-black text-black uppercase tracking-widest mb-6 flex items-center gap-3">
                    <div className="w-1.5 h-1.5 rounded-full bg-black" /> Work Deliverables
                  </h3>
                  {order.deliverables?.length ? (
                    <div className="space-y-6">
                      {order.deliverables.map((d, i) => (
                        <div key={i} className="p-10 border border-gray-100 rounded-[2.5rem] bg-gray-50/30">
                          <div className="mb-8">
                            <p className="text-[10px] font-black text-violet-500 uppercase tracking-widest mb-2">Delivery #{i+1} • {formatDate(d.deliveredAt)}</p>
                            <p className="text-black font-medium text-lg leading-relaxed">{d.description || "Final work submitted."}</p>
                          </div>

                          <div className="space-y-4">
                            {/* Files */}
                            {d.files && d.files.length > 0 && (
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                {d.files.map((f, idx) => (
                                  <a 
                                    key={idx} 
                                    href={f} 
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                    className="p-4 bg-white border border-gray-100 rounded-2xl flex items-center justify-between group hover:border-black transition-all"
                                  >
                                    <div className="flex items-center gap-3 min-w-0">
                                      <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center group-hover:bg-black group-hover:text-white transition-colors">
                                        <FileText className="w-5 h-5" />
                                      </div>
                                      <div className="min-w-0">
                                        <p className="text-[12px] font-black text-black truncate">{f.split('/').pop()?.split('-').slice(1).join('-') || "Download File"}</p>
                                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Source File</p>
                                      </div>
                                    </div>
                                    <Download className="w-4 h-4 text-gray-300 group-hover:text-black transition-colors" />
                                  </a>
                                ))}
                              </div>
                            )}

                            {/* Links */}
                            {d.links && d.links.length > 0 && (
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                {d.links.map((link, idx) => (
                                  <a 
                                    key={idx} 
                                    href={link} 
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                    className="p-4 bg-white border border-gray-100 rounded-2xl flex items-center justify-between group hover:border-black transition-all"
                                  >
                                    <div className="flex items-center gap-3 min-w-0">
                                      <div className="w-10 h-10 rounded-xl bg-violet-50 flex items-center justify-center text-violet-600 group-hover:bg-violet-600 group-hover:text-white transition-colors">
                                        {link.includes('github.com') ? <Github className="w-5 h-5" /> : <ExternalLink className="w-5 h-5" />}
                                      </div>
                                      <div className="min-w-0">
                                        <p className="text-[12px] font-black text-black truncate">{link.replace(/^https?:\/\/(www\.)?/, '')}</p>
                                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">External Link</p>
                                      </div>
                                    </div>
                                    <ExternalLink className="w-4 h-4 text-gray-300 group-hover:text-black transition-colors" />
                                  </a>
                                ))}
                              </div>
                            )}
                          </div>

                          {order.status === 'delivered' && i === order.deliverables.length - 1 && (
                            <div className="mt-10 p-8 bg-black rounded-[2rem] text-center">
                              <h4 className="text-white font-black text-xl mb-2">Ready to finish?</h4>
                              <p className="text-gray-400 text-sm font-medium mb-8">If the work is correct, accept the delivery to complete the order.</p>
                              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                                <button 
                                  onClick={onAcceptDelivery}
                                  disabled={isUpdatingStatus}
                                  className="px-10 py-4 bg-white text-black rounded-xl font-black uppercase tracking-widest text-[11px] flex items-center justify-center gap-2 hover:bg-gray-100 transition-all disabled:opacity-50"
                                >
                                  {isUpdatingStatus ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
                                  Accept & Complete
                                </button>
                                <button 
                                  onClick={() => setActiveTab('actions')}
                                  className="px-10 py-4 bg-white/10 text-white rounded-xl font-black uppercase tracking-widest text-[11px] hover:bg-white/20 transition-all"
                                >
                                  Request Revision
                                </button>
                              </div>
                              {statusUpdateError && <p className="mt-4 text-xs text-red-400 font-bold">{statusUpdateError}</p>}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="p-24 text-center bg-gray-50/50 border-2 border-dashed border-gray-100 rounded-[3rem]">
                      <div className="w-20 h-20 bg-white rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-sm border border-gray-100">
                        <Clock className="w-10 h-10 text-gray-200" />
                      </div>
                      <p className="text-gray-400 font-black uppercase tracking-widest text-[10px] mb-2">Awaiting Delivery</p>
                      <p className="text-gray-400 font-medium italic max-w-xs mx-auto">The seller is currently crafting your project. You'll be notified once files are uploaded.</p>
                    </div>
                  )}
                </section>
              </motion.div>
            )}

            {activeTab === 'actions' && (
              <motion.div key="actions" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-12">
                {/* Review Section */}
                <section className="p-10 border border-gray-200 rounded-3xl">
                  <h3 className="text-lg font-black text-black mb-8">Leave Project Review</h3>
                  {!order.review ? (
                    order.status === "completed" ? (
                      <div className="space-y-8">
                        <div>
                          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4">Select Rating</p>
                          <div className="flex gap-3">
                            {[1, 2, 3, 4, 5].map(v => (
                              <button key={v} type="button" onClick={() => setRating(v)} className={`w-14 h-14 rounded-2xl flex items-center justify-center border transition-all ${rating >= v ? "bg-black text-white border-black" : "border-gray-200 text-gray-300"}`}>
                                <Star className={`w-6 h-6 ${rating >= v ? "fill-current" : ""}`} />
                              </button>
                            ))}
                          </div>
                        </div>
                        <textarea 
                          value={comment} onChange={e => setComment(e.target.value)}
                          className="w-full p-6 bg-gray-50 border border-gray-200 rounded-2xl text-black outline-none focus:border-black transition-colors"
                          placeholder="Tell us about your experience..."
                          rows={4}
                        />
                        <button onClick={onSubmitReview} disabled={isSubmittingReview} className="px-10 py-4 bg-black text-white rounded-2xl font-black uppercase tracking-widest text-[12px] hover:bg-gray-800 transition-all disabled:opacity-50 flex items-center justify-center gap-2">
                          {isSubmittingReview && <Loader2 className="w-4 h-4 animate-spin" />}
                          {isSubmittingReview ? "Submitting..." : "Submit Feedback"}
                        </button>
                        {reviewSuccess && <p className="text-sm font-bold text-green-600">{reviewSuccess}</p>}
                        {reviewError && <p className="text-sm font-bold text-red-600">{reviewError}</p>}
                      </div>
                    ) : (
                      <p className="text-gray-400 font-medium italic">Reviews can only be posted after order completion.</p>
                    )
                  ) : (
                    <div className="p-8 bg-black text-white rounded-3xl">
                      <div className="flex gap-1 text-white mb-4">
                        {[...Array(5)].map((_, i) => <Star key={i} className={`w-4 h-4 ${i < order.review!.rating ? "fill-current" : "opacity-30"}`} />)}
                      </div>
                      <p className="text-xl font-medium italic leading-relaxed">\"{order.review.comment}\"</p>
                    </div>
                  )}
                </section>

                {/* Revision Section */}
                {order.status === "delivered" && (
                  <section className="p-10 border border-gray-200 rounded-3xl">
                    <h3 className="text-lg font-black text-black mb-4">Need Changes?</h3>
                    <p className="text-sm text-gray-500 mb-8 font-medium">You have <strong className="text-black">{order.revisions - (order.revisionRequests?.length || 0)}</strong> revisions remaining.</p>
                    <textarea 
                      value={revisionDescription} onChange={e => setRevisionDescription(e.target.value)}
                      className="w-full p-6 bg-gray-50 border border-gray-200 rounded-2xl text-black outline-none focus:border-black transition-colors mb-6"
                      placeholder="Describe exactly what needs to be changed..."
                      rows={4}
                    />
                    <button onClick={onRequestRevision} disabled={isRequestingRevision} className="w-full py-4 bg-black text-white rounded-2xl font-black uppercase tracking-widest text-[12px]">
                      Send Revision Request
                    </button>
                  </section>
                )}
              </motion.div>
            )}

            {activeTab === 'report' && (
              <motion.div key="report" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-8">
                <section className="p-10 border border-gray-200 rounded-3xl">
                  <h3 className="text-xl font-black text-black mb-4">Open Project Dispute</h3>
                  <p className="text-sm text-gray-400 mb-10 leading-relaxed font-medium max-w-2xl">If there are serious issues that cannot be resolved via revisions, you may open a formal dispute for manual investigation by our safety team.</p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    <select value={reportCategory} onChange={e => setReportCategory(e.target.value as any)} className="h-14 px-6 rounded-2xl bg-gray-50 border border-gray-200 font-bold text-sm outline-none">
                      {REPORT_CATEGORIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
                    </select>
                    <select value={reportSeverity} onChange={e => setReportSeverity(e.target.value as any)} className="h-14 px-6 rounded-2xl bg-gray-50 border border-gray-200 font-bold text-sm outline-none">
                      {REPORT_SEVERITIES.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
                    </select>
                  </div>
                  <textarea 
                    value={reportDescription} onChange={e => setReportDescription(e.target.value)}
                    className="w-full p-6 bg-gray-50 border border-gray-200 rounded-2xl mb-8"
                    placeholder="Provide full context for the dispute..."
                    rows={5}
                  />
                  <button onClick={onSubmitReport} disabled={isSubmittingReport} className="w-full py-5 border-2 border-black text-black rounded-2xl font-black uppercase tracking-widest text-[12px] hover:bg-black hover:text-white transition-all">
                    File Official Complaint
                  </button>
                </section>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* RIGHT COLUMN */}
        <div className="space-y-12">
          
          {/* Status Box */}
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="p-10 border border-gray-200 rounded-3xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-gray-50 rounded-bl-[4rem]" />
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-8">Project Status</p>
            <div className="flex items-center gap-6 mb-10">
              <div className="w-16 h-16 rounded-[1.5rem] flex items-center justify-center shadow-xl shadow-black/5 border" style={{ backgroundColor: status.bg, borderColor: status.bg, color: status.color }}>
                <StatusIcon className="w-8 h-8" />
              </div>
              <div>
                <p className="text-2xl font-black text-black leading-none mb-2">{status.label}</p>
                <p className="text-[11px] font-bold text-gray-300 uppercase tracking-widest">Status: {order.status}</p>
              </div>
            </div>
            
            {/* Timeline */}
            <div className="space-y-6">
              {[
                { label: 'Created', date: order.createdAt, active: true },
                { label: 'Started', date: order.timeline?.started, active: !!order.timeline?.started },
                { label: 'Final Delivery', date: order.timeline?.delivered, active: !!order.timeline?.delivered },
              ].map((step, i) => (
                <div key={i} className={`flex items-center gap-4 ${step.active ? "opacity-100" : "opacity-20"}`}>
                  <div className={`w-2.5 h-2.5 rounded-full ${step.active ? "bg-black" : "bg-gray-200"}`} />
                  <div className="flex-1">
                    <p className="text-xs font-black text-black uppercase tracking-widest leading-none mb-1">{step.label}</p>
                    <p className="text-[10px] font-bold text-gray-400">{step.date ? formatDate(step.date) : "TBD"}</p>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Seller Profile */}
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }} className="p-10 border border-gray-200 rounded-3xl text-center group">
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-8 text-left">Contractor</p>
            <div className="w-24 h-24 rounded-full border-2 border-gray-100 overflow-hidden mx-auto mb-6 p-1 group-hover:scale-105 transition-transform duration-500">
              <img src={order.seller.pfp || "https://res.cloudinary.com/dztptq6q1/image/upload/v1756046508/user_rencds.png"} alt={order.seller.name} className="w-full h-full object-cover rounded-full" />
            </div>
            <h4 className="text-2xl font-black text-black tracking-tighter mb-1">{order.seller.name}</h4>
            <p className="text-sm font-bold text-gray-400 mb-8 uppercase tracking-widest text-[10px]">{order.seller.email || "Professional Seller"}</p>
            <button 
              onClick={() => router.push(`/chats/${order.seller._id}?gigId=${order.gig._id}`)}
              className="w-full py-4 bg-black text-white rounded-2xl font-black uppercase tracking-widest text-[11px] shadow-xl shadow-black/10 hover:-translate-y-1 transition-all"
            >
              Contact Seller
            </button>
          </motion.div>

        </div>
      </div>
    </div>
  );
}