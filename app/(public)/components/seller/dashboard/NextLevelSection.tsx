import React from "react";
import { Star, Shield, Award, Zap, ChevronRight } from "lucide-react";

interface SellerLevel {
  id: string;
  label: string;
  completedOrders: number;
  nextLevelAt: number | null;
  progressToNext: number;
}

const LEVEL_ICONS: Record<string, any> = {
  new_seller: Star,
  level_1: Shield,
  level_2: Award,
  top_rated: Zap,
};

const NEXT_LEVEL_LABELS: Record<string, string> = {
  new_seller: "Level 1",
  level_1: "Level 2",
  level_2: "Top Rated",
  top_rated: "Max Level",
};

export function LevelProgressBar({ completed }: { completed: number }) {
  const total = 6;
  return (
    <div className="flex items-center gap-1 w-full h-2">
      {Array.from({ length: total }).map((_, i) => (
        <div 
          key={i} 
          className={`h-full flex-1 rounded-full ${i < completed ? 'bg-[var(--jm-violet)]' : 'bg-[rgba(255,255,255,0.1)]'}`}
        />
      ))}
    </div>
  );
}

export default function NextLevelSection({ sellerLevel }: { sellerLevel?: SellerLevel }) {
  const level = sellerLevel ?? {
    id: "new_seller", label: "New Seller", completedOrders: 0, nextLevelAt: 10, progressToNext: 0,
  };

  const CurrentIcon = LEVEL_ICONS[level.id] || Star;
  const nextLabel = NEXT_LEVEL_LABELS[level.id] || "Max Level";
  const isMaxLevel = level.nextLevelAt === null;

  // Map 0–100% progress to 0–6 dots filled
  const filledDots = isMaxLevel ? 6 : Math.round((level.progressToNext / 100) * 6);

  return (
    <div className="glass-card-dark mb-8 cursor-pointer group overflow-hidden">
      <div className="p-6">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-lg font-bold text-white">Your path to the next level</h2>
          <ChevronRight className="w-5 h-5 text-[rgba(255,255,255,0.5)] group-hover:text-white transition-colors transform group-hover:translate-x-1" />
        </div>

        {/* Stats row */}
        <div className="flex items-center gap-6 mb-6">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-wider mb-1" style={{ color: "rgba(255,255,255,0.4)" }}>Completed</p>
            <p className="text-xl font-bold text-white">{level.completedOrders}</p>
          </div>
          {!isMaxLevel && (
            <div>
              <p className="text-[11px] font-bold uppercase tracking-wider mb-1" style={{ color: "rgba(255,255,255,0.4)" }}>Next Level At</p>
              <p className="text-xl font-bold" style={{ color: "var(--jm-violet)" }}>{level.nextLevelAt} orders</p>
            </div>
          )}
          <div>
            <p className="text-[11px] font-bold uppercase tracking-wider mb-1" style={{ color: "rgba(255,255,255,0.4)" }}>Progress</p>
            <p className="text-xl font-bold text-white">{level.progressToNext}%</p>
          </div>
        </div>

        {/* Level track */}
        <div className="relative flex items-center justify-between mb-4">
          <div className="flex flex-col items-center">
            <div className="w-10 h-10 rounded-full flex items-center justify-center shadow-md relative z-10" style={{ background: "rgba(124,58,237,0.3)", border: "2px solid rgba(124,58,237,0.6)" }}>
              <CurrentIcon className="w-5 h-5 text-white" />
            </div>
            <span className="text-[12px] font-bold text-white mt-2">{level.label}</span>
          </div>

          <div className="flex-1 flex justify-between px-6 relative z-0">
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="w-4 h-4 rounded-full border-2 flex-shrink-0 z-10"
                style={{
                  background: i < filledDots ? "var(--jm-violet)" : "rgba(13,13,26,0.8)",
                  borderColor: i < filledDots ? "var(--jm-violet)" : "rgba(255,255,255,0.2)"
                }}
              />
            ))}
            <div className="absolute top-1/2 left-6 right-6 h-0.5 -mt-[1px] -z-10" style={{ background: "rgba(255,255,255,0.1)" }} />
            <div
              className="absolute top-1/2 left-6 h-0.5 -mt-[1px] -z-10 transition-all"
              style={{ width: `calc(${level.progressToNext}% - 3rem)`, background: "var(--jm-violet)" }}
            />
          </div>

          <div className={`flex flex-col items-center ${isMaxLevel ? '' : 'opacity-50'}`}>
            <div className="w-10 h-10 rounded-full flex items-center justify-center relative z-10" style={{ background: "rgba(255,255,255,0.1)", border: "2px solid rgba(255,255,255,0.2)" }}>
              {isMaxLevel ? <Zap className="w-5 h-5 text-yellow-400" /> : <ChevronRight className="w-5 h-5 text-white" />}
            </div>
            <span className="text-[12px] font-bold mt-2" style={{ color: isMaxLevel ? "#FBBF24" : "rgba(255,255,255,0.6)" }}>{nextLabel}</span>
          </div>
        </div>

        {isMaxLevel && (
          <div className="text-center mt-2">
            <span className="text-[13px] font-bold" style={{ color: "#FBBF24" }}>🏆 You are a Top Rated Seller!</span>
          </div>
        )}
      </div>
    </div>
  );
}

