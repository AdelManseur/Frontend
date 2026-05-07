"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { becomeASeller, getMe } from "../req-res";
import { CheckCircle, Loader2, ArrowRight, Smartphone, ShieldCheck } from "lucide-react";
import Image from "next/image";
import MarketingNavbar from "../components/ui/MarketingNavbar";
import Footer from "../components/ui/Footer";

export default function BecomeASellerPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [isVerified, setIsVerified] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const me = await getMe();
        if (!mounted) return;
        if (!me.logged) { router.push("/login"); return; }
        if (me.user.isSeller) { router.push("/seller-dashboard"); return; }
        setIsVerified(me.user.idVerified ?? false);
      } finally {
        if (mounted) setCheckingAuth(false);
      }
    })();
    return () => { mounted = false; };
  }, [router]);

  const handleBecomeSeller = async () => {
    setLoading(true);
    setError(null);
    try {
      await becomeASeller();
      window.localStorage.setItem("jobme.mode", "seller");
      window.location.href = "/seller-dashboard";
    } catch (err: any) {
      setError(err.message || "Something went wrong. Please try again.");
      setLoading(false);
    }
  };

  if (checkingAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <Loader2 className="w-10 h-10 animate-spin text-neutral-900" />
      </div>
    );
  }

  // ── If not verified, show the app-download wall ─────────────────────────────
  if (!isVerified) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 bg-white">
        <div className="max-w-md w-full rounded-[2.5rem] p-10 text-center shadow-2xl shadow-neutral-200/50 border border-neutral-100">
          <div className="w-20 h-20 rounded-2xl mx-auto mb-8 flex items-center justify-center bg-neutral-50 text-neutral-900 border border-neutral-100 shadow-sm">
            <Smartphone className="w-10 h-10" />
          </div>
          <h1 className="text-3xl font-bold mb-4 tracking-tight text-neutral-900">Verify Identity First</h1>
          <p className="text-[15px] mb-10 text-neutral-500 leading-relaxed">
            To protect buyers and sellers, you must verify your identity before becoming a seller on JobMe.
            Verification is completed through the <strong className="text-neutral-900">JobMe mobile app</strong>.
          </p>
          <div className="rounded-2xl p-6 mb-10 text-left space-y-4 bg-neutral-50 border border-neutral-100">
            {[
              { icon: Smartphone, text: "Download the JobMe app on your phone" },
              { icon: ShieldCheck, text: "Complete ID + face verification" },
              { icon: CheckCircle, text: "Come back and start selling" },
            ].map(({ icon: Icon, text }, i) => (
              <div key={i} className="flex items-center gap-4 text-[14px]">
                <div className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 bg-neutral-200 text-neutral-700">
                  <Icon className="w-4 h-4" />
                </div>
                <span className="text-neutral-600 font-medium">{text}</span>
              </div>
            ))}
          </div>
          <a
            href="/verify-identity"
            className="flex items-center justify-center gap-3 w-full py-4 rounded-full font-bold text-[16px] text-white bg-neutral-900 hover:bg-neutral-800 transition-all active:scale-[0.98] shadow-lg shadow-neutral-900/10"
          >
            <Smartphone className="w-5 h-5" />
            Verify Identity
          </a>
        </div>
      </div>
    );
  }
  // ────────────────────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-white text-[#171717] selection:bg-[#1DBF73] selection:text-white font-sans">
      <MarketingNavbar forceScrolled={true} />
      <div className="max-w-6xl mx-auto px-6 py-20 lg:py-32 grid lg:grid-cols-2 gap-16 items-center">
        {/* Left Content */}
        <div className="max-w-xl">
          <p className="text-[#1DBF73] font-bold tracking-widest uppercase text-sm mb-4">
            Join the JobMe Community
          </p>
          <h1 className="text-5xl md:text-6xl font-bold tracking-tighter mb-6 leading-tight text-[#171717]">
            Turn your skills into <span className="text-[#1DBF73]">income.</span>
          </h1>
          <p className="text-xl text-[#737373] font-light mb-10 leading-relaxed">
            Join thousands of professionals offering their services on JobMe. Build your profile, reach clients globally, and grow your freelance business.
          </p>

          <div className="space-y-6 mb-12">
            {[
              "Create a professional seller profile",
              "Publish your services (Gigs) for buyers to see",
              "Communicate with clients and deliver great work",
              "Get paid securely on time, every time"
            ].map((step, idx) => (
              <div key={idx} className="flex items-start gap-4">
                <div className="mt-1 flex-shrink-0 text-[#1DBF73]">
                  <CheckCircle className="w-6 h-6" />
                </div>
                <p className="text-[17px] text-[#171717]">{step}</p>
              </div>
            ))}
          </div>

          {error && (
            <div className="bg-red-50 text-red-600 p-4 rounded-lg mb-6 text-sm font-medium">
              {error}
            </div>
          )}

          <button
            onClick={handleBecomeSeller}
            disabled={loading}
            className="w-full sm:w-auto px-8 py-4 bg-[#1DBF73] text-white rounded-lg font-bold text-lg hover:bg-[#19a463] transition-colors flex items-center justify-center gap-3 active:scale-[0.98] disabled:opacity-70"
          >
            {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : null}
            <span>Start Selling on JobMe</span>
            {!loading && <ArrowRight className="w-5 h-5" />}
          </button>
        </div>

        {/* Right Illustration */}
        <div className="relative aspect-[4/5] rounded-[2rem] overflow-hidden shadow-2xl bg-[#fafafa]">
          <Image
            src="https://images.unsplash.com/photo-1573164713988-8665fc963095?w=800&h=1000&fit=crop"
            alt="Professional working"
            fill
            className="object-cover"
          />
        </div>
      </div>
      <Footer />
    </div>
  );
}
