"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { createOrder, getGigDetails, startChat, sendMessageToSeller, ensureConversationExists } from "./req-res";
import type { BuyerGigDetails, PackageType } from "./interfaces";
import { getMe } from "@/app/(public)/req-res";
import { Star, Clock, RefreshCw } from "lucide-react";

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

  if (isLoading) return <div className="grid min-h-[220px] place-items-center text-neutral-400">Loading gig...</div>;
  if (!gig) return <div><Link href="/browse" className="mb-4 inline-flex items-center gap-2 text-sm text-neutral-500 hover:text-neutral-900"><span>←</span><span>Back to Browse</span></Link><p className="text-sm text-red-500">{error || "Gig not found."}</p></div>;

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <div className="flex flex-col gap-8 lg:flex-row">
        {/* Left Column: Gig Info */}
        <div className="flex-1">
          <Link href="/browse" className="mb-6 inline-flex items-center gap-2 text-sm text-neutral-500 hover:text-neutral-900 transition-colors">
            <span>←</span><span>Back to Browse</span>
          </Link>

          <div className="border-b border-neutral-200 pb-8">
            <h1 className="text-3xl font-bold text-neutral-900">{gig.title}</h1>
            <div className="mt-4 flex items-center gap-4">
              <div className="flex items-center gap-2">
                <img src={gig.seller.pfp || "https://placehold.co/100x100/111827/9ca3af?text=User"} alt={gig.seller.name} className="h-10 w-10 rounded-full object-cover" />
                <span className="font-medium text-neutral-900">{gig.seller.name}</span>
              </div>
              <div className="h-4 w-px bg-neutral-200" />
              <div className="flex items-center gap-1 text-sm font-bold text-neutral-900">
                <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                {gig.rating.average.toFixed(1)}
                <span className="text-neutral-500 font-medium">({gig.rating.count})</span>
              </div>
            </div>
          </div>

          <div className="mt-8">
            <h2 className="text-xl font-bold text-neutral-900">About this gig</h2>
            <p className="mt-4 text-neutral-600 whitespace-pre-wrap leading-relaxed">{gig.description}</p>
          </div>

          <div className="mt-8">
            <h2 className="text-xl font-bold text-neutral-900">Images</h2>
            <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
              {gig.images.map((src, i) => (
                <img key={i} src={src} alt="" className="rounded-xl border border-neutral-200 object-cover aspect-video w-full" />
              ))}
            </div>
          </div>

          {gig.faqs.length > 0 && (
            <div className="mt-12">
              <h2 className="text-xl font-bold text-neutral-900">FAQ</h2>
              <div className="mt-6 space-y-4">
                {gig.faqs.map((faq, i) => (
                  <div key={i} className="rounded-xl bg-neutral-50 p-6 border border-neutral-100">
                    <p className="font-semibold text-neutral-900">Q: {faq.question}</p>
                    <p className="mt-2 text-neutral-600 text-sm leading-relaxed">A: {faq.answer}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Pricing and Order */}
        <div className="w-full lg:w-96">
          <div className="sticky top-24 rounded-2xl border border-neutral-200 bg-white overflow-hidden shadow-sm">
            {/* Package Tabs */}
            <div className="flex border-b border-neutral-200 bg-neutral-50">
              {(["basic", "standard", "premium"] as const).map((pkg) => (
                <button
                  key={pkg}
                  onClick={() => setSelectedPackage(pkg)}
                  disabled={!gig.price[pkg]}
                  className={`flex-1 py-4 text-sm font-bold capitalize transition ${
                    selectedPackage === pkg ? "bg-white text-neutral-900 border-b-2 border-neutral-900 shadow-sm" : "text-neutral-500 hover:text-neutral-900 hover:bg-neutral-100/50"
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
                    <h3 className="text-lg font-bold text-neutral-900 capitalize">{selectedPackage} Package</h3>
                    <span className="text-2xl font-bold text-neutral-900">{currentPackage.price} DA</span>
                  </div>
                  <p className="mt-4 text-sm text-neutral-600">{currentPackage.description}</p>
                  
                  <div className="mt-6 flex items-center gap-4 text-sm font-bold text-neutral-700">
                    <div className="flex items-center gap-1.5"><Clock className="w-4 h-4 text-neutral-500" /> {currentPackage.deliveryTime} Days Delivery</div>
                    <div className="flex items-center gap-1.5"><RefreshCw className="w-4 h-4 text-neutral-500" /> {currentPackage.revisions} Revisions</div>
                  </div>

                  <ul className="mt-6 space-y-3">
                    {currentPackage.features.map((feature, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-neutral-600">
                        <span className="text-neutral-900 mt-0.5">✓</span> {feature}
                      </li>
                    ))}
                  </ul>

                  <button
                    onClick={() => setShowFaqForm(true)}
                    className="mt-8 w-full rounded-full bg-neutral-900 py-3.5 text-sm font-bold text-white transition hover:bg-neutral-800 active:scale-95"
                  >
                    Continue (${currentPackage.price})
                  </button>
                </>
              )}

              <button
                onClick={() => setShowContactBox(!showContactBox)}
                className="mt-4 w-full rounded-full border border-neutral-200 bg-white py-3.5 text-sm font-bold text-neutral-900 transition hover:bg-neutral-50 active:scale-95"
              >
                Contact Seller
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Requirement Form Overlay */}
      {showFaqForm && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="w-full max-w-2xl rounded-3xl border border-neutral-100 bg-white p-8 shadow-2xl">
            <h2 className="text-2xl font-bold text-neutral-900">Requirements</h2>
            <p className="mt-2 text-neutral-500">Please provide the necessary information for the seller to start working.</p>

            <div className="mt-8 space-y-6">
              {questions.length > 0 ? (
                questions.map((q, i) => (
                  <div key={i}>
                    <label className="text-sm font-bold text-neutral-900">{q}</label>
                    <textarea
                      rows={3}
                      value={faqAnswers[i] ?? ""}
                      onChange={(e) => {
                        const newAnswers = [...faqAnswers];
                        newAnswers[i] = e.target.value;
                        setFaqAnswers(newAnswers);
                      }}
                      placeholder="Write your answer..."
                      className="mt-2 w-full rounded-xl border border-neutral-200 bg-neutral-50 px-4 py-3 text-neutral-900 focus:border-neutral-900 focus:outline-none focus:ring-1 focus:ring-neutral-900 transition-all"
                    />
                  </div>
                ))
              ) : (
                <p className="text-center text-neutral-500 font-medium py-4 bg-neutral-50 rounded-xl border border-neutral-100">No specific requirements needed for this gig.</p>
              )}
            </div>

            <div className="mt-10 flex justify-end gap-3">
              <button onClick={() => setShowFaqForm(false)} className="px-6 py-2.5 text-sm font-bold text-neutral-500 hover:text-neutral-900 transition-colors">Cancel</button>
              <button 
                onClick={() => setShowOrderConfirm(true)} 
                disabled={questions.length > 0 && faqAnswers.some(a => !a?.trim())}
                className="rounded-full bg-neutral-900 px-8 py-2.5 text-sm font-bold text-white hover:bg-neutral-800 disabled:opacity-50 transition-all active:scale-95 shadow-lg shadow-neutral-900/10"
              >
                Confirm and Order
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Modal */}
      {showOrderConfirm && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-3xl border border-neutral-100 bg-white p-8 shadow-2xl">
            <h3 className="text-xl font-bold text-neutral-900">Final Confirmation</h3>
            <p className="mt-4 text-neutral-600 leading-relaxed">
              You are about to order the <span className="text-neutral-900 font-bold capitalize">{selectedPackage}</span> package for <span className="text-neutral-900 font-bold">{currentPackage?.price} DA</span>. Proceed?
            </p>
            <div className="mt-8 flex justify-end gap-3">
              <button onClick={() => setShowOrderConfirm(false)} className="px-6 py-2.5 text-sm font-bold text-neutral-500 hover:text-neutral-900 transition-colors">No, wait</button>
              <button onClick={onOrder} disabled={isOrdering} className="rounded-full bg-neutral-900 px-6 py-2.5 text-sm font-bold text-white hover:bg-neutral-800 disabled:opacity-50 transition-all active:scale-95">
                {isOrdering ? "Processing..." : "Yes, Order Now"}
              </button>
            </div>
          </div>
        </div>
      )}

      {showContactBox && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="w-full max-w-lg rounded-3xl border border-neutral-100 bg-white p-8 shadow-2xl">
            <h3 className="text-xl font-bold text-neutral-900">Contact {gig.seller.name}</h3>
            <textarea
              rows={5}
              value={contactMessage}
              onChange={(e) => setContactMessage(e.target.value)}
              placeholder="Hi, I'm interested in your gig..."
              className="mt-6 w-full rounded-xl border border-neutral-200 bg-neutral-50 px-4 py-3 text-neutral-900 focus:border-neutral-900 focus:outline-none focus:ring-1 focus:ring-neutral-900 transition-all"
            />
            <div className="mt-8 flex justify-end gap-3">
              <button onClick={() => setShowContactBox(false)} className="px-6 py-2.5 text-sm font-bold text-neutral-500 hover:text-neutral-900 transition-colors">Cancel</button>
              <button onClick={onSendContactMessage} disabled={isSendingContact} className="rounded-full bg-neutral-900 px-8 py-2.5 text-sm font-bold text-white hover:bg-neutral-800 disabled:opacity-50 transition-all active:scale-95 shadow-lg shadow-neutral-900/10">
                {isSendingContact ? "Sending..." : "Send Message"}
              </button>
            </div>
          </div>
        </div>
      )}

      {error && <div className="fixed bottom-8 right-8 z-[100] rounded-xl bg-red-50 border border-red-100 p-4 text-sm font-bold text-red-600 shadow-lg">{error}</div>}
      {success && <div className="fixed bottom-8 right-8 z-[100] rounded-xl bg-emerald-50 border border-emerald-100 p-4 text-sm font-bold text-emerald-600 shadow-lg">{success}</div>}
    </div>
  );
}