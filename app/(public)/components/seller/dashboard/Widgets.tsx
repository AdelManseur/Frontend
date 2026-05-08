import React from "react";
import { ProgressBar } from "../../ui/ProgressBar";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

export function PerformanceWidget({ stats }: { stats?: any }) {
  return (
    <div className="glass-card-dark mb-6 overflow-hidden">
      <div className="px-6 py-5 border-b" style={{ borderColor: "var(--jm-seller-border)" }}>
        <h2 className="text-lg font-bold text-white">Track your performance</h2>
      </div>
      <div className="p-6 space-y-4">
        <div className="grid grid-cols-3 gap-4">
          <div className="p-3 rounded-lg transition-colors group" style={{ background: "rgba(13,13,26,0.4)", border: "1px solid var(--jm-seller-border)" }}>
            <p className="text-[11px] font-bold uppercase tracking-wider mb-1" style={{ color: "rgba(255,255,255,0.4)" }}>Total Earned</p>
            <div className="flex items-end gap-2">
              <p className="text-2xl font-bold transition-colors" style={{ color: "var(--jm-violet)" }}>{stats?.totalEarnings || 0} DA</p>
            </div>
          </div>
          
          <div className="p-3 rounded-lg transition-colors group" style={{ background: "rgba(13,13,26,0.4)", border: "1px solid var(--jm-seller-border)" }}>
            <p className="text-[11px] font-bold uppercase tracking-wider mb-1" style={{ color: "rgba(255,255,255,0.4)" }}>Active orders</p>
            <div className="flex items-end gap-2">
              <p className="text-2xl font-bold transition-colors text-white">{stats?.activeOrdersCount || 0}</p>
            </div>
          </div>
          
          <div className="p-3 rounded-lg transition-colors group" style={{ background: "rgba(13,13,26,0.4)", border: "1px solid var(--jm-seller-border)" }}>
            <p className="text-[11px] font-bold uppercase tracking-wider mb-1" style={{ color: "rgba(255,255,255,0.4)" }}>Completion Rate</p>
            <div className="flex items-end gap-2">
              <p className="text-2xl font-bold transition-colors text-white">{stats?.completionRate || 100}%</p>
            </div>
          </div>
        </div>
        
        <div className="pt-2">
          <Link href="/earnings" className="text-[14px] font-bold hover:underline flex items-center gap-1" style={{ color: "var(--jm-violet)" }}>
            View more analytics <ArrowUpRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}

export function ProfileStrengthWidget({ user }: { user?: any }) {
  const calculateStrength = () => {
    if (!user) return { score: 0, total: 12, percent: 0 };
    
    let score = 0;
    const total = 12;

    if (user.name) score++;
    if (user.email) score++;
    if (user.phone) score++;
    if (user.bday) score++;
    if (user.pfp) score++;
    if (user.address?.street) score++;
    if (user.address?.city) score++;
    if (user.address?.postalCode) score++;
    if (user.address?.country) score++;
    if (user.idVerified) score++;
    if (user.fieldsOfInterest && user.fieldsOfInterest.length > 0) score++;
    if (user.isSeller) score++;

    return {
      score,
      total,
      percent: Math.round((score / total) * 100)
    };
  };

  const { score, total, percent } = calculateStrength();

  return (
    <div className="glass-card-dark mb-6 overflow-hidden">
      <div className="p-6">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-lg font-bold text-white">Profile Strength</h2>
          <div className="text-right">
            <span className="text-2xl font-bold text-white">{score}</span>
            <span className="text-[14px] font-bold" style={{ color: "rgba(255,255,255,0.4)" }}>/{total}</span>
          </div>
        </div>
        
        <ProgressBar progress={percent} className="mb-4" />
        
        <p className="text-[14px] mb-5" style={{ color: "rgba(255,255,255,0.6)" }}>
          A strong profile helps you stand out and attracts more buyers. Add your portfolio and certifications!
        </p>
        
        <Link href="/profile-details" className="block text-center w-full rounded-full py-2.5 font-bold text-[14px] transition-colors" style={{ background: "var(--jm-violet)", color: "white" }}>
          Complete profile
        </Link>
      </div>
    </div>
  );
}

import { useState } from "react";
import { submitFeedback } from "../../../req-res";
import { Loader2, CheckCircle2 } from "lucide-react";

export function FeedbackWidget() {
  const [feedback, setFeedback] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = async () => {
    if (!feedback.trim()) return;
    setIsSubmitting(true);
    try {
      await submitFeedback(feedback);
      setIsSuccess(true);
      setFeedback("");
      setTimeout(() => setIsSuccess(false), 3000);
    } catch (error) {
      console.error(error);
      alert("Failed to submit feedback");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="glass-card-dark overflow-hidden">
      <div className="p-6">
        <h2 className="text-[16px] font-bold text-white mb-4">Share feedback to shape your dashboard</h2>
        {isSuccess ? (
          <div className="flex flex-col items-center justify-center py-4 text-center">
            <CheckCircle2 className="w-8 h-8 mb-2" style={{ color: "var(--jm-violet)" }} />
            <p className="text-sm font-bold text-white">Thank you!</p>
            <p className="text-xs" style={{ color: "rgba(255,255,255,0.6)" }}>Your feedback has been sent.</p>
          </div>
        ) : (
          <div className="space-y-3">
            <textarea
              className="w-full h-20 px-3 py-2 text-sm rounded-lg resize-none outline-none transition-colors text-white"
              style={{ background: "rgba(13,13,26,0.6)", border: "1px solid rgba(255,255,255,0.2)" }}
              placeholder="Tell us what you think..."
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              disabled={isSubmitting}
            />
            <button 
              onClick={handleSubmit}
              disabled={isSubmitting || !feedback.trim()}
              className="w-full flex justify-center items-center rounded-full py-2.5 font-bold text-[14px] transition-colors disabled:opacity-50" 
              style={{ 
                background: feedback.trim() ? "var(--jm-violet)" : "rgba(255,255,255,0.05)", 
                color: feedback.trim() ? "white" : "rgba(255,255,255,0.4)" 
              }}
            >
              {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : "Send Feedback"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
