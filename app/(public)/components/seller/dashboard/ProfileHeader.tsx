import React, { useState } from "react";
import Avatar from "../../ui/Avatar";
import { CalendarCheck, ChevronDown, Star, Shield, Award, Zap } from "lucide-react";
import type { MeResponse } from "../../../../interfaces";

const LEVEL_CONFIG: Record<string, { label: string; icon: any; color: string; bg: string }> = {
  new_seller: { label: "New Seller", icon: Star, color: "#C4B5FD", bg: "rgba(124,58,237,0.2)" },
  level_1:    { label: "Level 1",    icon: Shield, color: "#60A5FA", bg: "rgba(59,130,246,0.2)" },
  level_2:    { label: "Level 2",    icon: Award,  color: "#34D399", bg: "rgba(52,211,153,0.2)" },
  top_rated:  { label: "Top Rated",  icon: Zap,    color: "#FBBF24", bg: "rgba(251,191,36,0.2)" },
};

interface ProfileHeaderProps {
  session: MeResponse | null;
  sellerLevel?: { id: string; label: string; completedOrders: number; nextLevelAt: number | null; progressToNext: number };
}

export default function ProfileHeader({ session, sellerLevel }: ProfileHeaderProps) {
  const user = session?.logged ? session.user : null;
  const [availability, setAvailability] = useState<"Available" | "Not Available">("Available");

  const toggleAvailability = () => {
    setAvailability(prev => prev === "Available" ? "Not Available" : "Available");
  };

  if (!user) return null;

  return (
    <div className="glass-card-dark mb-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 p-6">
      <div className="flex items-center gap-5">
        <Avatar src={user.pfp} size="lg" isOnline={true} />
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h2 className="text-xl font-bold text-white">{user.name}</h2>
            <span className="text-sm font-medium tracking-wide" style={{ color: "rgba(255,255,255,0.5)" }}>
              @{user.name.toLowerCase().replace(/\s+/g, '')}
            </span>
          </div>
          <div className="flex items-center gap-3">
            {/* Dynamic Level Badge */}
            {(() => {
              const level = sellerLevel?.id ?? "new_seller";
              const cfg = LEVEL_CONFIG[level] || LEVEL_CONFIG.new_seller;
              const Icon = cfg.icon;
              return (
                <span className="flex items-center gap-1.5 px-3 py-1 rounded-full text-[12px] font-bold" style={{ background: cfg.bg, color: cfg.color }}>
                  <Icon className="w-3 h-3" />
                  {cfg.label}
                </span>
              );
            })()}
            <span className="text-sm font-bold hover:underline cursor-pointer transition-colors" style={{ color: "var(--jm-violet)" }}>
              Upgrade to Seller Plus
            </span>
          </div>
        </div>
      </div>

      <div>
        <button
          onClick={toggleAvailability}
          className={`flex items-center gap-2 px-4 py-2 rounded-full border transition-colors ${
            availability === "Available" 
              ? "border-[var(--jm-violet)] bg-[rgba(124,58,237,0.1)] text-[#C4B5FD]" 
              : "border-[rgba(255,255,255,0.2)] bg-[rgba(13,13,26,0.5)] text-[rgba(255,255,255,0.6)]"
          }`}
        >
          <CalendarCheck className="w-4 h-4" />
          <span className="text-sm font-bold">{availability}</span>
          <ChevronDown className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
