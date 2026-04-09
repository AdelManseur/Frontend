"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { getBuyerOrderById, addBuyerOrderReview, requestBuyerRevision } from "./req-res";
import type { BuyerExpandedOrder, SimpleOrderStatus } from "./interfaces";

function formatDate(value?: string) {
  if (!value) return "—";
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? "—" : d.toLocaleString();
}

function statusClass(status: SimpleOrderStatus) {
  switch (status) {
    case "pending":
      return "bg-amber-500/15 text-amber-300";
    case "active":
      return "bg-blue-500/15 text-blue-300";
    case "delivered":
      return "bg-violet-500/15 text-violet-300";
    case "completed":
      return "bg-emerald-500/15 text-emerald-300";
    case "cancelled":
      return "bg-red-500/15 text-red-300";
    case "in_revision":
      return "bg-orange-500/15 text-orange-300";
    default:
      return "bg-white/10 text-gray-300";
  }
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

  // revision state
  const [revisionDescription, setRevisionDescription] = useState("");
  const [isRequestingRevision, setIsRequestingRevision] = useState(false);
  const [revisionError, setRevisionError] = useState("");
  const [revisionSuccess, setRevisionSuccess] = useState("");

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

    return () => {
      mounted = false;
    };
  }, [orderId]);

  const cover = useMemo(() => order?.gig?.images?.[0] ?? "", [order]);

  const onSubmitReview = async () => {
    if (!order?._id) return;

    setReviewError("");
    setReviewSuccess("");
    setIsSubmittingReview(true);

    try {
      const data = await addBuyerOrderReview(order._id, {
        rating,
        comment: comment.trim(),
      });

      setOrder((prev) => (prev ? { ...prev, review: data.review } : prev));
      setReviewSuccess(data.message || "Review added successfully");
    } catch (e) {
      setReviewError(e instanceof Error ? e.message : "Failed to add review.");
    } finally {
      setIsSubmittingReview(false);
    }
  };

  const onRequestRevision = async () => {
    if (!order?._id) return;
    if (!revisionDescription.trim()) {
      setRevisionError("Please describe what needs to be revised.");
      return;
    }

    setIsRequestingRevision(true);
    setRevisionError("");
    setRevisionSuccess("");

    try {
      const data = await requestBuyerRevision(order._id, {
        description: revisionDescription.trim(),
      });

      // append new revision request to order locally
      setOrder((prev) =>
        prev
          ? {
              ...prev,
              revisionRequests: [
                ...(prev.revisionRequests ?? []),
                data.revisionRequest,
              ],
            }
          : prev
      );

      setRevisionSuccess(data.message || "Revision requested successfully");
      setRevisionDescription("");
    } catch (e) {
      setRevisionError(e instanceof Error ? e.message : "Failed to request revision.");
    } finally {
      setIsRequestingRevision(false);
    }
  };

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <div className="mb-6 flex items-center justify-between">
        <button
          onClick={() => router.push("/orders-to-buy")}
          className="rounded-md bg-white/10 px-3 py-2 text-sm text-white hover:bg-white/20"
        >
          ← Back to Orders
        </button>
        {order && (
          <span className={`rounded-full px-3 py-1 text-xs font-medium ${statusClass(order.status)}`}>
            {order.status.replace("_", " ")}
          </span>
        )}
      </div>

      {loading ? (
        <div className="rounded-2xl border border-white/10 bg-white/5 p-6 text-gray-300">Loading order...</div>
      ) : error ? (
        <div className="rounded-2xl border border-red-500/30 bg-red-500/10 p-6 text-red-300">{error}</div>
      ) : !order ? (
        <div className="rounded-2xl border border-white/10 bg-white/5 p-6 text-gray-300">Order not found.</div>
      ) : (
        <div className="space-y-6">
          <div className="rounded-2xl border border-white/10 bg-[#0b1220] p-5">
            <p className="text-xs uppercase tracking-[0.2em] text-indigo-300">Order #{order._id.slice(-8)}</p>
            <h1 className="mt-2 text-2xl font-semibold text-white">{order.gig.title}</h1>
            <p className="mt-1 text-sm text-gray-400">{order.gig.category}</p>

            <div className="mt-5 grid gap-4 md:grid-cols-4 text-sm">
              <div><p className="text-gray-400">Price</p><p className="text-white">${order.price}</p></div>
              <div><p className="text-gray-400">Delivery Time</p><p className="text-white">{order.deliveryTime} day(s)</p></div>
              <div><p className="text-gray-400">Revisions</p><p className="text-white">{order.revisions}</p></div>
              <div><p className="text-gray-400">Expected Delivery</p><p className="text-white">{formatDate(order.expectedDelivery)}</p></div>
            </div>

            {cover && (
              <img
                src={cover}
                alt={order.gig.title}
                className="mt-5 h-52 w-full rounded-xl object-cover"
              />
            )}
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
              <h2 className="text-lg font-semibold text-white">Buyer</h2>
              <p className="mt-2 text-white">{order.buyer.name}</p>
              <p className="text-sm text-gray-400">{order.buyer.email || "—"}</p>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
              <h2 className="text-lg font-semibold text-white">Seller</h2>
              <p className="mt-2 text-white">{order.seller.name}</p>
              <p className="text-sm text-gray-400">{order.seller.email || "—"}</p>
            </div>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
            <h2 className="text-lg font-semibold text-white">Requirements</h2>
            {order.requirements?.length ? (
              <ul className="mt-3 space-y-3">
                {order.requirements.map((r, i) => (
                  <li key={i} className="rounded-lg border border-white/10 bg-white/5 p-3">
                    <p className="text-sm text-indigo-300">Q: {r.question}</p>
                    <p className="mt-1 text-sm text-gray-200">A: {r.answer || "—"}</p>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mt-2 text-sm text-gray-400">No requirements.</p>
            )}
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
              <h2 className="text-lg font-semibold text-white">Deliverables</h2>
              {order.deliverables?.length ? (
                <ul className="mt-3 space-y-3">
                  {order.deliverables.map((d, i) => (
                    <li key={i} className="rounded-lg border border-white/10 bg-white/5 p-3">
                      <p className="text-sm text-gray-200">{d.description || "No description"}</p>
                      <p className="mt-1 text-xs text-gray-400">Delivered: {formatDate(d.deliveredAt)}</p>
                      {!!d.files?.length && (
                        <ul className="mt-2 list-disc pl-5 text-sm text-indigo-300">
                          {d.files.map((f, idx) => <li key={idx}>{f}</li>)}
                        </ul>
                      )}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="mt-2 text-sm text-gray-400">No deliverables yet.</p>
              )}
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
              <h2 className="text-lg font-semibold text-white">Revision Requests</h2>
              {order.revisionRequests?.length ? (
                <ul className="mt-3 space-y-3">
                  {order.revisionRequests.map((r, i) => (
                    <li key={i} className="rounded-lg border border-white/10 bg-white/5 p-3">
                      <p className="text-sm text-gray-200">{r.description || "No description"}</p>
                      <p className="mt-1 text-xs text-gray-400">
                        {r.status || "pending"} • {formatDate(r.requestedAt)}
                      </p>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="mt-2 text-sm text-gray-400">No revision requests.</p>
              )}
            </div>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
              <h2 className="text-lg font-semibold text-white">Payment</h2>
              <p className="mt-2 text-sm text-gray-300">Amount: <span className="text-white">{order.payment.amount} {order.payment.currency}</span></p>
              <p className="text-sm text-gray-300">Status: <span className="text-white">{order.payment.status}</span></p>
              <p className="text-sm text-gray-300">Paid At: <span className="text-white">{formatDate(order.payment.paidAt)}</span></p>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
              <h2 className="text-lg font-semibold text-white">Timeline</h2>
              <p className="mt-2 text-sm text-gray-300">Ordered: <span className="text-white">{formatDate(order.timeline?.ordered || order.createdAt)}</span></p>
              <p className="text-sm text-gray-300">Started: <span className="text-white">{formatDate(order.timeline?.started)}</span></p>
              <p className="text-sm text-gray-300">Updated: <span className="text-white">{formatDate(order.updatedAt)}</span></p>
            </div>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
            <h2 className="text-lg font-semibold text-white">Review</h2>

            {!order?.review ? (
              order?.status === "completed" ? (
                <div className="mt-3 space-y-3">
                  <div>
                    <label className="mb-1 block text-sm text-gray-300">Rating</label>
                    <select
                      value={rating}
                      onChange={(e) => setRating(Number(e.target.value))}
                      className="w-full rounded-md bg-white/10 px-3 py-2 text-white outline-none"
                    >
                      <option value={5}>5 - Excellent</option>
                      <option value={4}>4 - Very good</option>
                      <option value={3}>3 - Good</option>
                      <option value={2}>2 - Fair</option>
                      <option value={1}>1 - Poor</option>
                    </select>
                  </div>

                  <div>
                    <label className="mb-1 block text-sm text-gray-300">Comment</label>
                    <textarea
                      value={comment}
                      onChange={(e) => setComment(e.target.value)}
                      rows={4}
                      className="w-full rounded-md bg-white/10 px-3 py-2 text-white outline-none"
                      placeholder="Excellent work! Very professional and delivered on time."
                    />
                  </div>

                  <button
                    type="button"
                    onClick={onSubmitReview}
                    disabled={isSubmittingReview}
                    className="rounded-md bg-indigo-500 px-4 py-2 text-sm text-white hover:bg-indigo-400 disabled:opacity-60"
                  >
                    {isSubmittingReview ? "Submitting..." : "Submit Review"}
                  </button>

                  {reviewError && <p className="text-sm text-red-400">{reviewError}</p>}
                  {reviewSuccess && <p className="text-sm text-emerald-400">{reviewSuccess}</p>}
                </div>
              ) : (
                <p className="mt-2 text-sm text-gray-400">You can add a review after order completion.</p>
              )
            ) : (
              <div className="mt-2">
                <p className="text-white">Rating: {order.review.rating}/5</p>
                <p className="text-sm text-gray-200">{order.review.comment || "—"}</p>
                <p className="text-xs text-gray-400">{formatDate(order.review.reviewedAt)}</p>
              </div>
            )}
          </div>

          {/* Revision Request section — show only when delivered */}
          {order?.status === "delivered" && (
            <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
              <h2 className="text-lg font-semibold text-white">Request Revision</h2>
              <p className="mt-1 text-sm text-gray-400">
                Revisions allowed: {order.revisions}
              </p>

              <div className="mt-3 space-y-3">
                <div>
                  <label className="mb-1 block text-sm text-gray-300">
                    What needs to be changed?
                  </label>
                  <textarea
                    value={revisionDescription}
                    onChange={(e) => setRevisionDescription(e.target.value)}
                    rows={4}
                    className="w-full rounded-md bg-white/10 px-3 py-2 text-white outline-none placeholder:text-gray-500"
                    placeholder="Please change the color scheme to blue and add a contact form..."
                  />
                </div>

                <button
                  type="button"
                  onClick={onRequestRevision}
                  disabled={isRequestingRevision}
                  className="rounded-md bg-orange-500 px-4 py-2 text-sm text-white hover:bg-orange-400 disabled:opacity-60"
                >
                  {isRequestingRevision ? "Submitting..." : "Request Revision"}
                </button>

                {revisionError && <p className="text-sm text-red-400">{revisionError}</p>}
                {revisionSuccess && <p className="text-sm text-emerald-400">{revisionSuccess}</p>}
              </div>

              {/* existing revision requests list */}
              {!!order.revisionRequests?.length && (
                <div className="mt-5 space-y-2">
                  <p className="text-sm font-medium text-gray-300">Previous Revision Requests</p>
                  {order.revisionRequests.map((r, i) => (
                    <div key={i} className="rounded-lg border border-white/10 bg-white/5 p-3">
                      <p className="text-sm text-gray-200">{r.description || "No description"}</p>
                      <p className="mt-1 text-xs text-gray-400">
                        {r.status || "pending"} • {formatDate(r.requestedAt)}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}