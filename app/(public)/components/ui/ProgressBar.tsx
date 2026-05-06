import React from "react";

interface ProgressBarProps {
  progress: number; // 0 to 100
  height?: "thin" | "normal" | "thick";
  color?: string;
  className?: string;
}

export function ProgressBar({ progress, height = "normal", color = "bg-[#1DBF73]", className = "" }: ProgressBarProps) {
  const heights = {
    thin: "h-1",
    normal: "h-2",
    thick: "h-3"
  };

  const safeProgress = Math.min(100, Math.max(0, progress));

  return (
    <div className={`w-full bg-[#e5e7eb] rounded-full overflow-hidden ${heights[height]} ${className}`}>
      <div 
        className={`${color} h-full rounded-full transition-all duration-1000 ease-out`}
        style={{ width: `${safeProgress}%` }}
      />
    </div>
  );
}

interface TagProps {
  label: string;
  count?: number;
  selected?: boolean;
  onClick?: () => void;
  className?: string;
}

export function Tag({ label, count, selected = false, onClick, className = "" }: TagProps) {
  return (
    <button
      onClick={onClick}
      className={`inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-sm font-semibold transition-colors ${
        selected 
          ? "bg-[#171717] text-white" 
          : "bg-white text-[#737373] border border-[#e5e7eb] hover:bg-[#fafafa] hover:text-[#171717]"
      } ${className}`}
    >
      <span>{label}</span>
      {count !== undefined && (
        <span className={selected ? "text-gray-300" : "text-[#737373]"}>
          ({count})
        </span>
      )}
    </button>
  );
}
