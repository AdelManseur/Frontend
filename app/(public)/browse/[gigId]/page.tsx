"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { createOrder, getGigDetails, startChat, sendMessageToSeller, ensureConversationExists } from "./req-res";
import type { BuyerGigDetails, PackageType } from "./interfaces";
import { getMe } from "@/app/(public)/req-res";

export default function BuyerGigExpandedPage() {
  const router = useRouter();
  const params = useParams<{ gigId: string }>();
  const gigId = params?.gigId ?? "";

  const [gig, setGig] = useState<BuyerGigDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isOrdering, setIsOrdering] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [selectedPackage, setSelectedPackage] = useState<PackageType>("basic");
  const [showContactBox, setShowContactBox] = useState(false);
  const [contactMessage, setContactMessage] = useState("");
  const [isSendingContact, setIsSendingContact] = useState(false);
  const [showFaqForm, setShowFaqForm] = useState(false);
  const [faqAnswers, setFaqAnswers] = useState<string[]>([]);
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
    return () => { mounted = false; };
  }, [gigId]);

  const currentPackage = useMemo(() => {
    if (!gig) return null;
    return gig.price[selectedPackage] || gig.price.basic;
  }, [gig, selectedPackage]);

  const questions = useMemo(() => {
    return gig?.requirements || [];
  }, [gig]);

  const onOrder = async () => {
    if (!gig?._id) return;
    setError("");
    setSuccess("");
    setIsOrdering(true);

    try {
      const requirements = questions.map((q, i) => ({
        question: q,
        answer: (faqAnswers[i] ?? "").trim(),
      }));

      const payload = {
        gigId: gig._id,
        package: selectedPackage,
        requirements,
      };

      const res = await createOrder(payload);
      setSuccess(res.message || "Order created successfully");
      setShowOrderConfirm(false);
      setShowFaqForm(false);
      
      // Optional: Redirect to buyer orders
      setTimeout(() => router.push("/orders-to-buy"), 2000);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to create order.");
    } finally {
      setIsOrdering(false);
    }
  };

  const resolveSellerId = (g: any): string => {
    return g?.seller?._id || "";
  };

  const onSendContactMessage = async () => {
    if (!gig) return;
    const content = contactMessage.trim();
    if (!content) { setError("Please write a message first."); return; }
    setError("");
    setSuccess("");
    setIsSendingContact(true);
    try {
      const me = await getMe();
      if (!me.logged) throw new Error("You must be logged in.");
      const sellerId = resolveSellerId(gig);
      if (!sellerId) throw new Error("Seller ID not found.");
      await ensureConversationExists(sellerId, me.user._id);
      const result = await sendMessageToSeller({ from: me.user._id, to: sellerId, content });
      setSuccess(result.message || "Message sent.");
      setContactMessage("");
      setShowContactBox(false);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to send message.");
    } finally {
      setIsSendingContact(false);
    }
  };

  if (isLoading) return <div className="grid min-h-[220px] place-items-center text-gray-400">Loading gig...</div>;
  if (!gig) return <div><Link href="/browse" className="mb-4 inline-flex items-center gap-2 text-sm text-indigo-300 hover:text-indigo-200"><span>←</span><span>Back to Browse</span></Link><p className="text-sm text-red-400">{error || "Gig not found."}</p></div>;

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <div className="flex flex-col gap-8 lg:flex-row">
        {/* Left Column: Gig Info */}
        <div className="flex-1">
          <Link href="/browse" className="mb-6 inline-flex items-center gap-2 text-sm text-indigo-300 hover:text-indigo-200">
            <span>←</span><span>Back to Browse</span>
          </Link>

          <div className="border-b border-white/10 pb-8">
            <h1 className="text-3xl font-bold text-white">{gig.title}</h1>
            <div className="mt-4 flex items-center gap-4">
              <div className="flex items-center gap-2">
                <img src={gig.seller.pfp || "https://placehold.co/100x100/111827/9ca3af?text=User"} alt={gig.seller.name} className="h-10 w-10 rounded-full object-cover" />
                <span className="font-medium text-white">{gig.seller.name}</span>
              </div>
              <div className="h-4 w-px bg-white/10" />
              <div className="flex items-center gap-1 text-sm text-yellow-500">
                ⭐ <span>{gig.rating.average.toFixed(1)}</span>
                <span className="text-gray-400">({gig.rating.count})</span>
              </div>
            </div>
          </div>

          <div className="mt-8">
            <h2 className="text-xl font-semibold text-white">About this gig</h2>
            <p className="mt-4 text-gray-300 whitespace-pre-wrap leading-relaxed">{gig.description}</p>
          </div>

          <div className="mt-8">
            <h2 className="text-xl font-semibold text-white">Images</h2>
            <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
              {gig.images.map((src, i) => (
                <img key={i} src={src} alt="" className="rounded-lg border border-white/10 object-cover aspect-video w-full" />
              ))}
            </div>
          </div>

          {gig.faqs.length > 0 && (
            <div className="mt-8">
              <h2 className="text-xl font-semibold text-white">FAQ</h2>
              <div className="mt-4 space-y-4">
                {gig.faqs.map((faq, i) => (
                  <div key={i} className="rounded-lg bg-white/5 p-4 border border-white/10">
                    <p className="font-medium text-white">Q: {faq.question}</p>
                    <p className="mt-2 text-gray-400 text-sm">A: {faq.answer}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Pricing and Order */}
        <div className="w-full lg:w-96">
          <div className="sticky top-24 rounded-xl border border-white/10 bg-white/5 overflow-hidden">
            {/* Package Tabs */}
            <div className="flex border-b border-white/10">
              {(["basic", "standard", "premium"] as const).map((pkg) => (
                <button
                  key={pkg}
                  onClick={() => setSelectedPackage(pkg)}
                  disabled={!gig.price[pkg]}
                  className={`flex-1 py-4 text-sm font-semibold capitalize transition ${
                    selectedPackage === pkg ? "bg-indigo-500 text-white" : "text-gray-400 hover:text-white hover:bg-white/5"
                  } ${!gig.price[pkg] ? "opacity-30 cursor-not-allowed" : ""}`}
                >
                  {pkg}
                </button>
              ))}
            </div>

            {/* Package Details */}
            <div className="p-6">
              {currentPackage && (
                <>
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-bold text-white capitalize">{selectedPackage} Package</h3>
                    <span className="text-2xl font-bold text-indigo-300">${currentPackage.price}</span>
                  </div>
                  <p className="mt-4 text-sm text-gray-300">{currentPackage.description}</p>
                  
                  <div className="mt-6 flex items-center gap-4 text-sm font-medium text-white">
                    <div className="flex items-center gap-1">🕒 {currentPackage.deliveryTime} Days Delivery</div>
                    <div className="flex items-center gap-1">🔄 {currentPackage.revisions} Revisions</div>
                  </div>

                  <ul className="mt-6 space-y-2">
                    {currentPackage.features.map((feature, i) => (
                      <li key={i} className="flex items-center gap-2 text-sm text-gray-300">
                        <span className="text-indigo-400">✓</span> {feature}
                      </li>
                    ))}
                  </ul>

                  <button
                    onClick={() => setShowFaqForm(true)}
                    className="mt-8 w-full rounded-lg bg-indigo-500 py-3 text-sm font-bold text-white transition hover:bg-indigo-400"
                  >
                    Continue (${currentPackage.price})
                  </button>
                </>
              )}

              <button
                onClick={() => setShowContactBox(!showContactBox)}
                className="mt-4 w-full rounded-lg border border-white/10 py-3 text-sm font-bold text-white transition hover:bg-white/10"
              >
                Contact Seller
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Requirement Form Overlay */}
      {showFaqForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-2xl rounded-xl border border-white/10 bg-[#0b1220] p-8 shadow-2xl">
            <h2 className="text-2xl font-bold text-white">Requirements</h2>
            <p className="mt-2 text-gray-400">Please provide the necessary information for the seller to start working.</p>

            <div className="mt-8 space-y-6">
              {questions.length > 0 ? (
                questions.map((q, i) => (
                  <div key={i}>
                    <label className="text-sm font-medium text-white">{q}</label>
                    <textarea
                      rows={3}
                      value={faqAnswers[i] ?? ""}
                      onChange={(e) => {
                        const newAnswers = [...faqAnswers];
                        newAnswers[i] = e.target.value;
                        setFaqAnswers(newAnswers);
                      }}
                      placeholder="Write your answer..."
                      className="mt-2 w-full rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-white focus:border-indigo-500 focus:outline-none"
                    />
                  </div>
                ))
              ) : (
                <p className="text-center text-gray-500">No specific requirements needed for this gig.</p>
              )}
            </div>

            <div className="mt-10 flex justify-end gap-4">
              <button onClick={() => setShowFaqForm(false)} className="px-6 py-2 text-gray-400 hover:text-white transition">Cancel</button>
              <button 
                onClick={() => setShowOrderConfirm(true)} 
                disabled={questions.length > 0 && faqAnswers.some(a => !a?.trim())}
                className="rounded-lg bg-indigo-500 px-8 py-2 font-bold text-white hover:bg-indigo-400 disabled:opacity-30 transition"
              >
                Confirm and Order
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Modal */}
      {showOrderConfirm && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-xl border border-white/10 bg-[#0b1220] p-6 shadow-2xl">
            <h3 className="text-xl font-bold text-white">Final Confirmation</h3>
            <p className="mt-4 text-gray-400 leading-relaxed">
              You are about to order the <span className="text-white font-bold capitalize">{selectedPackage}</span> package for <span className="text-indigo-300 font-bold">${currentPackage?.price}</span>. Proceed?
            </p>
            <div className="mt-8 flex justify-end gap-4">
              <button onClick={() => setShowOrderConfirm(false)} className="px-4 py-2 text-gray-400 hover:text-white transition">No, wait</button>
              <button onClick={onOrder} disabled={isOrdering} className="rounded-lg bg-indigo-500 px-6 py-2 font-bold text-white hover:bg-indigo-400 disabled:opacity-30 transition">
                {isOrdering ? "Processing..." : "Yes, Order Now"}
              </button>
            </div>
          </div>
        </div>
      )}

      {showContactBox && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-lg rounded-xl border border-white/10 bg-[#0b1220] p-6">
            <h3 className="text-xl font-bold text-white">Contact {gig.seller.name}</h3>
            <textarea
              rows={5}
              value={contactMessage}
              onChange={(e) => setContactMessage(e.target.value)}
              placeholder="Hi, I'm interested in your gig..."
              className="mt-6 w-full rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-white focus:border-indigo-500 focus:outline-none"
            />
            <div className="mt-6 flex justify-end gap-4">
              <button onClick={() => setShowContactBox(false)} className="px-4 py-2 text-gray-400 hover:text-white transition">Cancel</button>
              <button onClick={onSendContactMessage} disabled={isSendingContact} className="rounded-lg bg-indigo-500 px-6 py-2 font-bold text-white hover:bg-indigo-400 transition">
                {isSendingContact ? "Sending..." : "Send Message"}
              </button>
            </div>
          </div>
        </div>
      )}

      {error && <div className="fixed bottom-8 right-8 rounded-lg bg-red-500/10 border border-red-500/20 p-4 text-red-400">{error}</div>}
      {success && <div className="fixed bottom-8 right-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 p-4 text-emerald-400">{success}</div>}
    </div>
  );
}