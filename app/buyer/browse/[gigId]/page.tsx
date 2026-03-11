"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { createOrder, getGigDetails, startChat } from "./req-res";
import type { BuyerGigDetails } from "./interfaces";
import { getMe } from "@/app/req-res";
import { sendMessageToSeller } from "./req-res";

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

  const [showContactBox, setShowContactBox] = useState(false);
  const [contactMessage, setContactMessage] = useState("");
  const [isSendingContact, setIsSendingContact] = useState(false);

  useEffect(() => {
    let mounted = true;

    (async () => {
      try {
        if (!gigId) throw new Error("Missing gig id.");
        const data = await getGigDetails(gigId);
        if (mounted) setGig(data);
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
      setSuccess(res.message || "Order created.");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to create order.");
    } finally {
      setIsOrdering(false);
    }
  };

  const onStartChat = async () => {
    if (!gig) return;
    setError("");
    setSuccess("");
    setIsStartingChat(true);
    try {
      const res = await startChat(gig.sellerId);
      router.push(`/buyer/chats?chatId=${res.chatId}`);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to start chat.");
    } finally {
      setIsStartingChat(false);
    }
  };

  const resolveSellerId = (g: unknown): string => {
    const gigAny = g as any;
    if (typeof gigAny?.sellerId === "string") return gigAny.sellerId;
    if (typeof gigAny?.seller?._id === "string") return gigAny.seller._id;
    if (typeof gigAny?.ownerId === "string") return gigAny.ownerId;
    if (typeof gigAny?.userId === "string") return gigAny.userId;
    return "";
  };

  const onSendContactMessage = async () => {
    if (!gig) return;

    const content = contactMessage.trim();
    if (!content) {
      setError("Please write a message first.");
      return;
    }

    setError("");
    setSuccess("");
    setIsSendingContact(true);

    try {
      const me = await getMe();
      if (!me.logged) throw new Error("You must be logged in.");

      const to = resolveSellerId(gig);
      if (!to) throw new Error("Seller id not found for this gig.");

      const result = await sendMessageToSeller({
        from: me.user._id,
        to,
        content,
      });

      setSuccess(result.message || "Message sent.");
      setContactMessage("");
      setShowContactBox(false);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to send message.");
    } finally {
      setIsSendingContact(false);
    }
  };

  const ratingText = useMemo(() => {
    if (!gig?.rating) return "0.0 (0)";
    if (typeof gig.rating === "number") return `${gig.rating.toFixed(1)} (0)`;
    const avg = typeof gig.rating.average === "number" ? gig.rating.average : 0;
    const count = typeof gig.rating.count === "number" ? gig.rating.count : 0;
    return `${avg.toFixed(1)} (${count})`;
  }, [gig]);

  if (isLoading) {
    return <div className="grid min-h-[220px] place-items-center text-gray-400">Loading gig...</div>;
  }

  if (!gig) {
    return (
      <div>
        <Link
          href="/buyer/browse"
          className="mb-4 inline-flex items-center gap-2 text-sm text-indigo-300 hover:text-indigo-200"
        >
          <span>←</span>
          <span>Back to Browse</span>
        </Link>
        <p className="text-sm text-red-400">{error || "Gig not found."}</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl">
      <Link
        href="/buyer/browse"
        className="mb-4 inline-flex items-center gap-2 text-sm text-indigo-300 hover:text-indigo-200"
      >
        <span>←</span>
        <span>Back to Browse</span>
      </Link>

      <div className="border-b border-white/10 pb-8">
        <p className="text-xs uppercase tracking-[0.2em] text-indigo-300">Gig Details</p>
        <h1 className="mt-2 text-3xl font-semibold text-white">{gig.title}</h1>
        <p className="mt-3 text-sm leading-7 text-gray-300">{gig.description}</p>
      </div>

      <section className="border-b border-white/10 py-8">
        <h2 className="text-lg font-semibold text-white">Images</h2>
        {(gig.images ?? []).length ? (
          <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {gig.images.map((src, i) => (
              <div key={`${src}-${i}`} className="overflow-hidden rounded-xl border border-white/10 bg-white/5">
                <img src={src} alt={`Gig image ${i + 1}`} className="h-56 w-full object-cover" />
              </div>
            ))}
          </div>
        ) : (
          <p className="mt-3 text-sm text-gray-400">No images provided.</p>
        )}
      </section>

      <section className="grid grid-cols-1 gap-6 border-b border-white/10 py-8 md:grid-cols-4">
        <div>
          <p className="text-sm text-gray-400">Category</p>
          <p className="mt-2 text-sm text-white">{gig.category || "Not provided"}</p>
        </div>
        <div>
          <p className="text-sm text-gray-400">Price</p>
          <p className="mt-2 text-sm font-semibold text-indigo-300">${gig.price}</p>
        </div>
        <div>
          <p className="text-sm text-gray-400">Delivery</p>
          <p className="mt-2 text-sm text-white">{gig.deliveryTime} day(s)</p>
        </div>
        <div>
          <p className="text-sm text-gray-400">Rating</p>
          <p className="mt-2 text-sm text-white">{ratingText}</p>
        </div>
      </section>

      <section className="border-b border-white/10 py-8">
        <h2 className="text-lg font-semibold text-white">Tags</h2>
        <div className="mt-4 flex flex-wrap gap-2">
          {(gig.tags ?? []).length ? (
            gig.tags.map((tag) => (
              <span
                key={tag}
                className="rounded-full border border-indigo-400/20 bg-indigo-500/10 px-3 py-1 text-xs text-indigo-200"
              >
                {tag}
              </span>
            ))
          ) : (
            <p className="text-sm text-gray-400">No tags.</p>
          )}
        </div>
      </section>

      <section className="border-b border-white/10 py-8">
        <h2 className="text-lg font-semibold text-white">Features</h2>
        <div className="mt-4 space-y-2">
          {(gig.features ?? []).length ? (
            gig.features.map((feature, i) => (
              <p key={`${feature}-${i}`} className="text-sm text-gray-300">
                • {feature}
              </p>
            ))
          ) : (
            <p className="text-sm text-gray-400">No features listed.</p>
          )}
        </div>
      </section>

      <div className="flex flex-wrap justify-end gap-3 border-t border-white/10 pt-6">
        <button
          type="button"
          onClick={onStartChat}
          disabled={isStartingChat}
          className="rounded-md bg-white/10 px-4 py-2 text-sm text-white hover:bg-white/20 disabled:opacity-60"
        >
          {isStartingChat ? "Starting chat..." : "Message Seller"}
        </button>
        <button
          type="button"
          onClick={onOrder}
          disabled={isOrdering}
          className="rounded-md bg-indigo-500 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-400 disabled:opacity-60"
        >
          {isOrdering ? "Ordering..." : "Order Now"}
        </button>
        <button
          type="button"
          onClick={() => setShowContactBox((v) => !v)}
          className="rounded-md bg-white/10 px-4 py-2 text-sm text-white hover:bg-white/20"
        >
          {showContactBox ? "Close" : "Contact me"}
        </button>
      </div>

      {showContactBox && (
        <section className="mt-4 border-b border-white/10 pb-8">
          <label className="mb-2 block text-sm text-gray-400">Message to seller</label>
          <div className="flex flex-col gap-3">
            <textarea
              rows={4}
              value={contactMessage}
              onChange={(e) => setContactMessage(e.target.value)}
              placeholder="Hi, I want to ask about this gig..."
              className="w-full border-b border-white/10 bg-transparent px-0 py-2 text-sm text-white placeholder:text-gray-500 focus:outline-none"
            />
            <div className="flex justify-end">
              <button
                type="button"
                onClick={onSendContactMessage}
                disabled={isSendingContact}
                className="rounded-md bg-indigo-500 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-400 disabled:opacity-60"
              >
                {isSendingContact ? "Sending..." : "Send message"}
              </button>
            </div>
          </div>
        </section>
      )}

      {error && <p className="mt-4 text-sm text-red-400">{error}</p>}
      {success && <p className="mt-4 text-sm text-emerald-400">{success}</p>}
    </div>
  );
}