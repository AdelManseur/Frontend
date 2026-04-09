"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { createSimpleOrder, createSimpleOrderMessage, getGigDetails, startChat } from "./req-res";
import { ensureConversationExists } from "./req-res";
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
  const [showFaqForm, setShowFaqForm] = useState(false);
  const [faqAnswers, setFaqAnswers] = useState<string[]>([]);
  const [customSpecifications, setCustomSpecifications] = useState("");

  const [showOrderConfirm, setShowOrderConfirm] = useState(false);

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
    if (!gig?._id) return;

    setError("");
    setSuccess("");
    setIsOrdering(true);

    try {
      const faqRequirements = questions.map((q, i) => ({
        question: q,
        answer: (faqAnswers[i] ?? "").trim(),
      }));

      const requirements = [
        ...faqRequirements,
        {
          question: "Specific Confirmation",
          answer: customSpecifications.trim() || "No additional specifications",
        },
      ];

      const price = Number((gig as any).price ?? 0);
      const deliveryTime = Number((gig as any).deliveryTime ?? 1);
      const revisions = Number((gig as any).revisions ?? 0);
      const currency = "USD";
      const started = new Date().toISOString();

      const payload = {
        gigId: gig._id,
        requirements,
        price,
        currency,
        deliveryTime,
        revisions,
        status: "pending" as const,
        payment: {
          amount: price,
          currency,
          status: "pending" as const,
        },
        timeline: {
          started,
        },
      };

      const res = await createSimpleOrder(payload);

      // Build full order message from FAQs + custom specs
      const messageParts: string[] = [];
      if (faqRequirements.length > 0) {
        messageParts.push("FAQ Answers:");
        faqRequirements.forEach((item, idx) => {
          messageParts.push(`Q${idx + 1}: ${item.question}`);
          messageParts.push(`A${idx + 1}: ${item.answer || "-"}`);
        });
      }
      messageParts.push("Custom Specifications:");
      messageParts.push(customSpecifications.trim() || "No additional specifications");
      const composedMessage = messageParts.join("\n");

      // REQUIRED: include from/to
      if (res?.order?._id) {
        const me = await getMe();
        if (!me.logged) throw new Error("You must be logged in.");

        const to = resolveSellerId(gig);
        if (!to) throw new Error("Seller id not found for this gig.");

        await createSimpleOrderMessage({
          simpleOrderId: res.order._id,
          from: me.user._id,
          to,
          message: composedMessage,
          attachments: [],
          read: false,
        });
      }

      setSuccess(res.message || "Order created successfully");
      setShowOrderConfirm(false);
      setShowFaqForm(false);
      setFaqAnswers(Array.from({ length: questions.length }, () => ""));
      setCustomSpecifications("");
    } catch (e) {
      console.error("[BuyerGigExpandedPage] createSimpleOrder error:", e);
      setError(e instanceof Error ? e.message : "Failed to create order.");
    } finally {
      setIsOrdering(false);
    }
  };

  /*const onStartChat = async () => {
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
  };*/

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

      const sellerId = resolveSellerId(gig);
      if (!sellerId) throw new Error("Seller ID not found.");

      // ensure conversation exists first
      const conv_res = await ensureConversationExists(sellerId, me.user._id);
      console.log("ensureConversationExists result:", conv_res);

      const result = await sendMessageToSeller({
        from: me.user._id,
        to: sellerId,
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

  const questions = useMemo(() => {
    const raw = (gig as any)?.questions;
    if (!Array.isArray(raw)) return [];
    return raw.map((q) => String(q).trim()).filter(Boolean);
  }, [gig]);

  const hasGigQuestions = questions.length > 0;

  useEffect(() => {
    setFaqAnswers(Array.from({ length: questions.length }, () => ""));
    setShowFaqForm(false);
    setCustomSpecifications("");
  }, [gig?._id, questions.length]);

  const onFaqAnswerChange = (index: number, value: string) => {
    setFaqAnswers((prev) => prev.map((a, i) => (i === index ? value : a)));
  };

  const onOrderClick = async () => {
    // Always open the pre-order form first (FAQ + Custom Specifications)
    setShowFaqForm(true);
  };

  const onOrderNowClick = () => {
    if (hasGigQuestions) {
      const hasEmpty = faqAnswers.some((a) => !a.trim());
      if (hasEmpty) {
        setError("Please answer all FAQ questions before ordering.");
        return;
      }
    }

    setShowOrderConfirm(true);
  };

  const onConfirmOrder = async () => {
    const me = await getMe();
    if (!me.logged) throw new Error("You must be logged in.");

    const sellerId = resolveSellerId(gig);
    if (!sellerId) throw new Error("Seller ID not found.");

    // ensure conversation exists first
    const conv_res = await ensureConversationExists(sellerId, me.user._id);
    console.log("ensureConversationExists result:", conv_res);

    setShowOrderConfirm(false);
    await onOrder();
  };

  const isLoadingGig = isLoading;

  if (isLoadingGig) {
    return <div className="grid min-h-[220px] place-items-center text-gray-400">Loading gig...</div>;
  }

  if (!gig) {
    return (
      <div>
        <Link
          href="/browse"
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
        href="/browse"
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
          onClick={onOrderClick}
          disabled={isOrdering}
          className="rounded-md bg-indigo-500 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-400 disabled:opacity-60"
        >
          Add Specification to Order
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

      {/*hasGigQuestions &&*/ showFaqForm && (
        <section className="mt-6 border-t border-white/10 pt-6">
          <h2 className="text-lg font-semibold text-white">
            {hasGigQuestions ? "Answer FAQ before ordering" : "Add Custom Specifications"}
          </h2>
          <p className="mt-1 text-sm text-gray-400">
            {hasGigQuestions
              ? "Please answer the seller’s questions."
              : "Add your custom requirements before placing the order."}
          </p>

          <div className="mt-5 space-y-5">
            {hasGigQuestions &&
              questions.map((q, i) => (
                <div key={`${q}-${i}`}>
                  <p className="text-sm text-white">{i + 1}. {q}</p>
                  <textarea
                    rows={3}
                    value={faqAnswers[i] ?? ""}
                    onChange={(e) => onFaqAnswerChange(i, e.target.value)}
                    placeholder="Write your answer..."
                    className="mt-2 w-full border-b border-white/10 bg-transparent px-0 py-2 text-sm text-white placeholder:text-gray-500 focus:outline-none"
                  />
                </div>
              ))}

            <div>
              <p className="text-sm text-white">Custom Specifications</p>
              <textarea
                rows={4}
                value={customSpecifications}
                onChange={(e) => setCustomSpecifications(e.target.value)}
                placeholder="Add any extra requirements, notes, files info, or preferences..."
                className="mt-2 w-full border-b border-white/10 bg-transparent px-0 py-2 text-sm text-white placeholder:text-gray-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="mt-6 flex justify-end">
            <button
              type="button"
              onClick={onOrderNowClick}
              disabled={isOrdering}
              className="rounded-md bg-indigo-500 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-400 disabled:opacity-60"
            >
              {isOrdering ? "Ordering..." : "Order Now"}
            </button>
          </div>
        </section>
      )}

      {showOrderConfirm && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/50 backdrop-blur-sm px-4">
          <div className="w-full max-w-md rounded-xl border border-white/10 bg-[#0b1220] p-5">
            <p className="text-sm text-gray-200">
              This action will immediately launch an order to the seller, be sure that you want to make this order
            </p>

            <div className="mt-5 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setShowOrderConfirm(false)}
                className="rounded-md bg-white/10 px-4 py-2 text-sm text-white hover:bg-white/20"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={onConfirmOrder}
                disabled={isOrdering}
                className="rounded-md bg-indigo-500 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-400 disabled:opacity-60"
              >
                {isOrdering ? "Ordering..." : "Confirm Order"}
              </button>
            </div>
          </div>
        </div>
      )}

      {error && <p className="mt-4 text-sm text-red-400">{error}</p>}
      {success && <p className="mt-4 text-sm text-emerald-400">{success}</p>}
    </div>
  );
}