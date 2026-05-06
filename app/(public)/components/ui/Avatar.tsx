import React from "react";
import OnlineIndicator from "./OnlineIndicator";

interface AvatarProps {
  src?: string;
  initials?: string;
  size?: "sm" | "md" | "lg";
  isOnline?: boolean;
  className?: string;
}

export default function Avatar({ src, initials = "U", size = "md", isOnline, className = "" }: AvatarProps) {
  const sizeClasses = {
    sm: "w-8 h-8 text-xs",
    md: "w-10 h-10 text-sm",
    lg: "w-12 h-12 text-base"
  };

  return (
    <div className={`relative inline-block ${className}`}>
      <div className={`${sizeClasses[size]} rounded-full overflow-hidden bg-[#e5e7eb] border border-[#e5e7eb] flex items-center justify-center font-bold text-[#737373]`}>
        {src ? (
          <img src={src} alt="Avatar" className="w-full h-full object-cover" />
        ) : (
          initials
        )}
      </div>
      {isOnline !== undefined && (
        <div className="absolute bottom-0 right-0 transform translate-x-1/4 translate-y-1/4">
          <OnlineIndicator status={isOnline ? "online" : "offline"} />
        </div>
      )}
    </div>
  );
}
