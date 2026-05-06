import React from "react";
import { Star, Shield, Award, Zap } from "lucide-react";

export type SellerLevel = "new-seller" | "level-1" | "level-2" | "top-rated";

interface BadgeProps {
  level: SellerLevel;
  className?: string;
}

export default function Badge({ level, className = "" }: BadgeProps) {
  const levelConfig = {
    "new-seller": {
      label: "New Seller",
      icon: <Star className="w-3.5 h-3.5 text-white" />,
      bg: "bg-gradient-to-r from-pink-400 to-rose-400"
    },
    "level-1": {
      label: "Level 1",
      icon: <Shield className="w-3.5 h-3.5 text-white" />,
      bg: "bg-gradient-to-r from-pink-500 to-purple-500"
    },
    "level-2": {
      label: "Level 2",
      icon: <Award className="w-3.5 h-3.5 text-white" />,
      bg: "bg-gradient-to-r from-purple-500 to-indigo-500"
    },
    "top-rated": {
      label: "Top Rated",
      icon: <Zap className="w-3.5 h-3.5 text-white" />,
      bg: "bg-gradient-to-r from-amber-400 to-orange-500"
    }
  };

  const config = levelConfig[level];

  return (
    <div className={`inline-flex items-center gap-1.5 ${className}`}>
      <div className={`w-5 h-5 rounded-sm flex items-center justify-center ${config.bg} shadow-sm`}>
        {config.icon}
      </div>
      <span className="text-[13px] font-semibold text-[#171717]">{config.label}</span>
    </div>
  );
}
