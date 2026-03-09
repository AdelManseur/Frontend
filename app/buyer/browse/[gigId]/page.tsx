"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { createOrder, getGigDetails, startChat } from "./req-res";
import type { BuyerGigDetails } from "./interfaces";

export default function BuyerGigExpandedPage() {
  const router = useRouter();
  const params = useParams<{ gigId: string }>();
  const gigId = params?.gigId ?? "";

  const [gig, setGig] = useState<BuyerGigDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isOrdering, setIsOrdering] = useState(false);
  const [isStartingChat, setIsStartingChat] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    let mounted = true;

    (async () => {
      if (!gigId) {
        setError("Missing gig id.");
        setIsLoading(false);
        return;
      }

      try {
        const details = await getGigDetails(gigId);
        if (mounted) setGig(details);
      } catch (e) {
        if (mounted) setError(e instanceof Error ? e.message : "Unexpected error");
      } finally {
        if (mounted) setIsLoading(false);
      }
    })();

    return () => {
      mounted = false;
    };
  }, [gigId]);

  const onOrder = async () => {
    if (!gig) return;
    setError("");
    setSuccess("");
    setIsOrdering(true);
    try {
      const res = await createOrder(gig._id);
      setSuccess(res.message || "Order created successfully.");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unexpected error");
    } finally {
      setIsOrdering(false);
    }
  };

  const onStartChat = async () => {
    if (!gig?.seller?._id) return;
    setError("");
    setSuccess("");
    setIsStartingChat(true);
    try {
      const res = await startChat(gig.seller._id, gig._id);
      const chatId = res.conversationId || res.chatId;
      if (chatId) router.push(`/chat/${chatId}`);
      else setSuccess(res.message || "Chat started.");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unexpected error");
    } finally {
      setIsStartingChat(false);
    }
  };

  if (isLoading) return <div className="grid min-h-[260px] place-items-center">Loading...</div>;
  if (!gig) return <div className="text-red-400">{error || "Gig not found."}</div>;

  return (
    <div>
      <Link href="/buyer/browse" className="mb-4 inline-flex items-center gap-2 text-sm text-indigo-300 hover:text-indigo-200">
        <span>←</span>
        <span>Back to Browse</span>
      </Link>

      <div className="overflow-hidden rounded-xl border border-white/10 bg-white/5">
        <div className="h-[280px] w-full bg-black/20">
          <img
            src={gig.images?.[0] || "https://placehold.co/1200x600/111827/9ca3af?text=No+Image"}
            alt={gig.title}
            className="h-full w-full object-cover"
          />
        </div>

        <div className="grid gap-6 p-6 lg:grid-cols-3">
          <section className="lg:col-span-2">
            <h1 className="text-2xl font-bold">{gig.title}</h1>
            <p className="mt-2 text-gray-300">{gig.description}</p>

            <div className="mt-4 flex flex-wrap gap-2">
              {(gig.tags || []).map((tag) => (
                <span key={tag} className="rounded-full bg-white/10 px-3 py-1 text-xs text-gray-300">
                  #{tag}
                </span>
              ))}
            </div>

            <div className="mt-6">
              <h3 className="text-sm font-semibold text-gray-200">What’s included</h3>
              <ul className="mt-2 list-inside list-disc space-y-1 text-sm text-gray-300">
                {(gig.features || []).map((f, i) => (
                  <li key={`${f}-${i}`}>{f}</li>
                ))}
              </ul>
            </div>
          </section>

          <aside className="rounded-lg border border-white/10 bg-white/5 p-4">
            <p className="text-2xl font-bold text-indigo-300">${gig.price}</p>
            <p className="mt-1 text-sm text-gray-400">{gig.deliveryTime} day(s) delivery</p>
            <p className="text-sm text-gray-400">{gig.revisions} revision(s)</p>
            <p className="mt-1 text-sm text-gray-400">⭐ {gig.rating?.average?.toFixed?.(1) ?? "0.0"} ({gig.rating?.count ?? 0})</p>

            <div className="mt-4 rounded-md border border-white/10 bg-black/20 p-3">
              <p className="text-xs uppercase tracking-wide text-gray-400">Seller</p>
              <div className="mt-2 flex items-center gap-2">
                <img
                  src={gig.seller?.pfp || "https://placehold.co/64x64/1f2937/e5e7eb?text=U"}
                  alt={gig.seller?.name || "Seller"}
                  className="h-8 w-8 rounded-full object-cover"
                />
                <span className="text-sm text-gray-200">{gig.seller?.name || "Unknown seller"}</span>
              </div>
            </div>

            <div className="mt-4 space-y-2">
              <button
                type="button"
                onClick={onOrder}
                disabled={isOrdering}
                className="w-full rounded-md bg-indigo-500 px-4 py-2 text-sm font-semibold hover:bg-indigo-400 disabled:opacity-60"
              >
                {isOrdering ? "Ordering..." : "Order this gig"}
              </button>

              <button
                type="button"
                onClick={onStartChat}
                disabled={isStartingChat}
                className="w-full rounded-md bg-white/10 px-4 py-2 text-sm font-medium hover:bg-white/20 disabled:opacity-60"
              >
                {isStartingChat ? "Starting..." : "Start chat with seller"}
              </button>
            </div>
          </aside>
        </div>
      </div>

      {error && <p className="mt-4 text-sm text-red-400">{error}</p>}
      {success && <p className="mt-4 text-sm text-emerald-400">{success}</p>}
    </div>
  );
}