"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { getMe } from "@/app/(public)/req-res";
import { getSellerConversations } from "./req-res";
import type { SellerConversationListItem } from "./interfaces";
import { MessageSquare, Search, Loader2, ShieldCheck } from "lucide-react";
import VerificationGate from "../components/ui/VerificationGate";

export default function ChatsLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [items, setItems] = useState<SellerConversationListItem[]>([]);
  const [filtered, setFiltered] = useState<SellerConversationListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [idVerified, setIdVerified] = useState<boolean | null>(null);
  const [mode, setMode] = useState<"buyer" | "seller">("buyer");

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const savedMode = window.localStorage.getItem("jobme.mode") as "buyer" | "seller" | null;
        if (savedMode) setMode(savedMode);

        const me = await getMe();
        if (!mounted) return;
        if (!me.logged) { router.push("/login"); return; }
        setIdVerified(me.user.idVerified ?? false);
        if (me.user.idVerified) {
          const rows = await getSellerConversations(me.user._id);
          if (mounted) { setItems(rows); setFiltered(rows); }
        }
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, [router]);

  // Filter conversations by search
  useEffect(() => {
    if (!search.trim()) { setFiltered(items); return; }
    const q = search.toLowerCase();
    setFiltered(items.filter(i => i.otherUser.name?.toLowerCase().includes(q)));
  }, [search, items]);

  if (idVerified === false) {
    return (
      <div 
        className="flex flex-col items-center justify-center h-[calc(100vh-64px)] p-6"
        style={{ background: mode === 'seller' ? "var(--jm-seller-bg)" : "white" }}
      >
        <div className={`max-w-md w-full rounded-[2.5rem] p-10 text-center shadow-2xl border ${mode === 'seller' ? 'bg-white/5 border-white/10 shadow-black/20' : 'bg-white border-neutral-100 shadow-neutral-200/50'}`}>
          <div className={`w-20 h-20 rounded-2xl mx-auto mb-8 flex items-center justify-center border shadow-sm ${mode === 'seller' ? 'bg-white/5 border-white/10 text-white' : 'bg-neutral-50 border-neutral-200 text-neutral-900'}`}>
            <MessageSquare className="w-10 h-10" />
          </div>
          <h1 className={`text-3xl font-bold mb-4 tracking-tight ${mode === 'seller' ? 'text-white' : 'text-neutral-900'}`}>Messages Locked</h1>
          <p className={`text-[15px] mb-10 leading-relaxed ${mode === 'seller' ? 'text-white/60' : 'text-neutral-500'}`}>
            You must verify your identity before you can access your conversations. 
            This helps maintain a secure environment for everyone.
          </p>
          
          <VerificationGate isLocked={true}>
            <button className={`w-full py-4 rounded-full font-bold text-[16px] transition-all active:scale-[0.98] shadow-lg ${mode === 'seller' ? 'bg-white text-neutral-900 hover:bg-neutral-200' : 'bg-neutral-900 text-white hover:bg-neutral-800 shadow-neutral-900/10'}`}>
              Verify Identity
            </button>
          </VerificationGate>
        </div>
      </div>
    );
  }

  return (
    <div 
      className={`flex h-[calc(100vh-64px)] overflow-hidden ${mode === 'seller' ? 'text-white' : 'text-neutral-900'}`} 
      style={{ background: mode === 'seller' ? "var(--jm-seller-bg)" : "white" }}
    >
      {/* ── Sidebar ── */}
      <aside
        className="flex w-72 flex-shrink-0 flex-col"
        style={{ 
          background: mode === 'seller' ? "rgba(13,13,26,0.7)" : "#f9fafb", 
          borderRight: mode === 'seller' ? "1px solid rgba(255,255,255,0.07)" : "1px solid #e5e7eb" 
        }}
      >
        {/* Header */}
        <div className="px-5 py-4" style={{ borderBottom: mode === 'seller' ? "1px solid rgba(255,255,255,0.07)" : "1px solid #e5e7eb" }}>
          <div className="flex items-center justify-between mb-3">
            <h2 className={`text-[16px] font-bold ${mode === 'seller' ? 'text-white' : 'text-neutral-900'}`}>Messages</h2>
            {!loading && (
              <span
                className="rounded-full px-2.5 py-0.5 text-[11px] font-bold"
                style={{ background: "rgba(124,58,237,0.2)", color: "var(--jm-violet)" }}
              >
                {items.length}
              </span>
            )}
          </div>

          {/* Search */}
          <div className="relative">
            <Search 
              className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5" 
              style={{ color: mode === 'seller' ? "rgba(255,255,255,0.3)" : "#9ca3af" }} 
            />
            <input
              type="text"
              placeholder="Search conversations…"
              value={search}
              onChange={e => setSearch(e.target.value)}
              className={`w-full rounded-xl pl-8 pr-3 py-2 text-[13px] outline-none ${mode === 'seller' ? 'placeholder:text-white/30 border border-white/10' : 'placeholder:text-neutral-400 border border-neutral-200 text-neutral-900'}`}
              style={{
                background: mode === 'seller' ? "rgba(255,255,255,0.05)" : "white",
                color: mode === 'seller' ? "white" : "#171717",
              }}
            />
          </div>
        </div>

        {/* Conversation list */}
        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="flex flex-col gap-4 p-4">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="flex items-center gap-3 animate-pulse">
                  <div className="h-10 w-10 rounded-full flex-shrink-0" style={{ background: "rgba(255,255,255,0.07)" }} />
                  <div className="flex-1 space-y-2">
                    <div className="h-3 rounded w-3/4" style={{ background: "rgba(255,255,255,0.07)" }} />
                    <div className="h-2 rounded w-1/2" style={{ background: "rgba(255,255,255,0.05)" }} />
                  </div>
                </div>
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-3 py-16 px-4 text-center">
              <div className={`w-14 h-14 rounded-2xl flex items-center justify-center border shadow-sm mb-1 ${mode === 'seller' ? 'bg-white/5 border-white/10 text-white/10' : 'bg-neutral-50 border-neutral-200/60 text-neutral-200'}`}>
                <MessageSquare className="w-7 h-7" />
              </div>
              <p className={`text-[13px] font-medium ${mode === 'seller' ? 'text-white/30' : 'text-neutral-400'}`}>
                {search ? "No results found." : "No conversations yet."}
              </p>
            </div>
          ) : (
            <div className="flex flex-col py-1">
              {filtered.map((item) => {
                const href = `/chats/${item.otherUser._id}`;
                const active = pathname?.startsWith(href);
                const initial = (item.otherUser.name || "?").charAt(0).toUpperCase();

                return (
                  <Link
                    key={item.convId}
                    href={href}
                    className="flex items-center gap-3 px-4 py-3 transition-all"
                    style={{
                      background: active 
                        ? (mode === 'seller' ? "rgba(124,58,237,0.1)" : "rgba(0,0,0,0.03)") 
                        : "transparent",
                      borderRight: active 
                        ? (mode === 'seller' ? "2px solid var(--jm-violet)" : "2px solid #171717") 
                        : "2px solid transparent",
                    }}
                  >
                    {/* Avatar */}
                    <div
                      className="relative h-10 w-10 flex-shrink-0 rounded-full overflow-hidden flex items-center justify-center text-sm font-bold"
                      style={{ background: "rgba(124,58,237,0.2)", color: "var(--jm-violet)" }}
                    >
                      {item.otherUser.pfp ? (
                        <img src={item.otherUser.pfp} alt={item.otherUser.name || "User"} className="h-full w-full object-cover" />
                      ) : initial}
                    </div>

                    {/* Info */}
                    <div className="min-w-0 flex-1">
                      <p className={`truncate text-[14px] font-semibold ${active ? (mode === 'seller' ? 'text-white' : 'text-neutral-900') : (mode === 'seller' ? 'text-white/80' : 'text-neutral-600')}`}>
                        {item.otherUser.name || "Unknown user"}
                      </p>
                      <p className={`truncate text-[11px] ${mode === 'seller' ? 'text-white/30' : 'text-neutral-400'}`}>
                        Click to open chat
                      </p>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </aside>

      {/* ── Main area ── */}
      <main className="flex flex-1 flex-col overflow-hidden">{children}</main>
    </div>
  );
}