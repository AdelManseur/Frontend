"use client";

import { MessageSquare } from "lucide-react";
import { useEffect, useState } from "react";

export default function SellerChatsPage() {
  const [mode, setMode] = useState<"buyer" | "seller">("buyer");

  useEffect(() => {
    const savedMode = window.localStorage.getItem("jobme.mode") as "buyer" | "seller" | null;
    if (savedMode) setMode(savedMode);
  }, []);

  return (
    <div className={`flex flex-1 flex-col items-center justify-center gap-4 text-center p-6 ${mode === 'seller' ? '' : 'bg-white'}`}>
      <div className={`w-20 h-20 rounded-3xl flex items-center justify-center border shadow-sm mb-2 ${mode === 'seller' ? 'bg-white/5 border-white/10 text-white/20' : 'bg-neutral-50 border-neutral-100 text-neutral-300'}`}>
        <MessageSquare className="w-10 h-10" />
      </div>
      <div>
        <h3 className={`text-xl font-bold mb-1 ${mode === 'seller' ? 'text-white' : 'text-neutral-900'}`}>Your Messages</h3>
        <p className={`text-sm ${mode === 'seller' ? 'text-white/40' : 'text-neutral-500'}`}>Select a conversation from the left to start chatting.</p>
      </div>
    </div>
  );
}