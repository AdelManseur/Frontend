import React from "react";

interface OnlineIndicatorProps {
  status: "online" | "offline" | "away";
  className?: string;
}

export default function OnlineIndicator({ status, className = "" }: OnlineIndicatorProps) {
  const statusColors = {
    online: "bg-[#1DBF73]",
    offline: "bg-[#737373]",
    away: "bg-yellow-400"
  };

  return (
    <div 
      className={`w-3 h-3 rounded-full border-2 border-white ${statusColors[status]} ${className}`}
      title={status.charAt(0).toUpperCase() + status.slice(1)}
    />
  );
}
