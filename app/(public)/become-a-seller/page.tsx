"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { becomeASeller } from "../req-res";
import { CheckCircle, Loader2, ArrowRight } from "lucide-react";
import Image from "next/image";

export default function BecomeASellerPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleBecomeSeller = async () => {
    setLoading(true);
    setError(null);
    try {
      await becomeASeller();
      // On success, set mode to seller and redirect
      window.localStorage.setItem("jobme.mode", "seller");
      // Force a hard navigation to reload session state from AppShell
      window.location.href = "/seller-dashboard";
    } catch (err: any) {
      setError(err.message || "Something went wrong. Please try again.");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white text-[#171717] selection:bg-[#1DBF73] selection:text-white font-sans">
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
    </div>
  );
}
