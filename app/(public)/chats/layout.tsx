"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { getMe } from "@/app/(public)/req-res";
import { getSellerConversations } from "./req-res";
import type { SellerConversationListItem } from "./interfaces";
import { Search, MessageCircle, ShieldAlert, PenSquare } from "lucide-react";
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
  const [myPfp, setMyPfp] = useState("");
  const [myName, setMyName] = useState("");

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const savedMode = window.localStorage.getItem("jobme.mode") as "buyer" | "seller" | null;
        if (savedMode && mounted) setMode(savedMode);
        const me = await getMe();
        if (!mounted) return;
        if (!me.logged) { router.push("/login"); return; }
        setIdVerified(me.user.idVerified ?? false);
        setMyName(me.user.name || "");
        setMyPfp((me.user as any).pfp || "");
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

  useEffect(() => {
    if (!search.trim()) { setFiltered(items); return; }
    const q = search.toLowerCase();
    setFiltered(items.filter(i => i.otherUser.name?.toLowerCase().includes(q)));
  }, [search, items]);

  const isSeller = mode === "seller";
  const myInitial = (myName || "?").charAt(0).toUpperCase();

  if (idVerified === false) {
    return (
      <div className={`flex flex-col items-center justify-center h-[calc(100vh-64px)] p-6 ${isSeller ? "bg-[#0b0f1a]" : "bg-neutral-50"}`}>
        <div className={`max-w-sm w-full rounded-3xl p-10 text-center shadow-xl border ${isSeller ? "bg-[#141a28] border-white/10" : "bg-white border-neutral-100"}`}>
          <div className={`w-16 h-16 rounded-2xl mx-auto mb-6 flex items-center justify-center ${isSeller ? "bg-red-500/10 text-red-400" : "bg-red-50 text-red-400"}`}>
            <ShieldAlert className="w-8 h-8" />
          </div>
          <h1 className={`text-2xl font-bold mb-3 tracking-tight ${isSeller ? "text-white" : "text-neutral-900"}`}>Identity Required</h1>
          <p className={`text-sm mb-8 leading-relaxed ${isSeller ? "text-white/40" : "text-neutral-400"}`}>
            Verify your identity to unlock messaging and keep the platform safe.
          </p>
          <VerificationGate isLocked={true}>
            <button className={`w-full py-3.5 rounded-2xl font-semibold text-sm transition-all active:scale-[0.98] ${isSeller ? "bg-white text-neutral-900 hover:bg-neutral-100" : "bg-neutral-900 text-white hover:bg-neutral-800"}`}>
              Verify Identity →
            </button>
          </VerificationGate>
        </div>
      </div>
    );
  }

  return (
    <div className={`flex h-[calc(100vh-64px)] overflow-hidden ${isSeller ? "bg-[#0b0f1a]" : "bg-[#f0f2f5]"}`}>

      {/* ── Left Sidebar ── */}
      <aside className={`flex w-[300px] flex-shrink-0 flex-col ${isSeller ? "bg-[#141a28] border-r border-white/[0.06]" : "bg-white border-r border-neutral-200"}`}>

        {/* Profile strip + title */}
        <div className={`flex items-center justify-between px-4 py-4 ${isSeller ? "border-b border-white/[0.06]" : "border-b border-neutral-100"}`}>
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full overflow-hidden flex-shrink-0 flex items-center justify-center font-semibold text-sm"
              style={{ background: isSeller ? "rgba(99,102,241,0.25)" : "#e5e7eb", color: isSeller ? "#818cf8" : "#374151" }}>
              {myPfp
                ? <img src={myPfp} alt={myName} className="w-full h-full object-cover" />
                : myInitial}
            </div>
            <span className={`font-bold text-[16px] tracking-tight ${isSeller ? "text-white" : "text-neutral-900"}`}>
              Chats
            </span>
          </div>
          <button title="New message" className={`w-8 h-8 flex items-center justify-center rounded-full transition ${isSeller ? "text-white/40 hover:text-white hover:bg-white/[0.06]" : "text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100"}`}>
            <PenSquare className="w-4 h-4" />
          </button>
        </div>

        {/* Search */}
        <div className={`px-3 py-2.5 ${isSeller ? "border-b border-white/[0.06]" : "border-b border-neutral-100"}`}>
          <div className="relative">
            <Search className={`absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 ${isSeller ? "text-white/30" : "text-neutral-400"}`} />
            <input
              type="text"
              placeholder="Search conversations"
              value={search}
              onChange={e => setSearch(e.target.value)}
              className={`w-full rounded-full pl-8 pr-4 py-2 text-[13px] outline-none transition ${
                isSeller
                  ? "bg-white/[0.06] text-white placeholder-white/30 focus:bg-white/[0.09]"
                  : "bg-neutral-100 text-neutral-800 placeholder-neutral-400"
              }`}
            />
          </div>
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="flex flex-col px-2 pt-2">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="flex items-center gap-3 px-3 py-3 animate-pulse">
                  <div className={`h-11 w-11 rounded-full flex-shrink-0 ${isSeller ? "bg-white/10" : "bg-neutral-200"}`} />
                  <div className="flex-1 space-y-2">
                    <div className={`h-2.5 rounded-full w-3/5 ${isSeller ? "bg-white/10" : "bg-neutral-200"}`} />
                    <div className={`h-2 rounded-full w-2/5 ${isSeller ? "bg-white/5" : "bg-neutral-100"}`} />
                  </div>
                </div>
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-3 py-20 px-6 text-center">
              <MessageCircle className={`w-9 h-9 ${isSeller ? "text-white/10" : "text-neutral-200"}`} />
              <p className={`text-xs font-medium ${isSeller ? "text-white/30" : "text-neutral-400"}`}>
                {search ? "No results found" : "No conversations yet"}
              </p>
            </div>
          ) : (
            <div className="flex flex-col pt-1 pb-2">
              {filtered.map(item => {
                const href = `/chats/${item.otherUser._id}`;
                const active = pathname?.startsWith(href);
                const initial = (item.otherUser.name || "?").charAt(0).toUpperCase();

                return (
                  <Link
                    key={item.convId}
                    href={href}
                    className={`flex items-center gap-3 px-3 py-2.5 mx-2 rounded-xl transition-all ${
                      active
                        ? isSeller ? "bg-indigo-600/20" : "bg-[#0084ff]/10"
                        : isSeller ? "hover:bg-white/[0.05]" : "hover:bg-neutral-100/80"
                    }`}
                  >
                    {/* Avatar */}
                    <div className="relative h-11 w-11 flex-shrink-0 rounded-full overflow-hidden flex items-center justify-center font-semibold text-[14px]"
                      style={{
                        background: isSeller ? "rgba(99,102,241,0.2)" : "#e5e7eb",
                        color: isSeller ? "#818cf8" : "#4b5563",
                      }}>
                      {item.otherUser.pfp
                        ? <img src={item.otherUser.pfp} alt={item.otherUser.name || "User"} className="h-full w-full object-cover" />
                        : initial}
                    </div>

                    {/* Name + time */}
                    <div className="min-w-0 flex-1">
                      <div className="flex items-baseline justify-between gap-1">
                        <p className={`truncate text-[13.5px] font-semibold ${
                          active
                            ? isSeller ? "text-indigo-300" : "text-[#0084ff]"
                            : isSeller ? "text-white/90" : "text-neutral-800"
                        }`}>
                          {item.otherUser.name || "Unknown"}
                        </p>
                        {item.createdAt && (
                          <span className={`text-[10px] flex-shrink-0 ${isSeller ? "text-white/25" : "text-neutral-400"}`}>
                            {new Date(item.createdAt).toLocaleDateString([], { month: "short", day: "numeric" })}
                          </span>
                        )}
                      </div>
                      <p className={`truncate text-[12px] mt-0.5 ${isSeller ? "text-white/30" : "text-neutral-400"}`}>
                        Click to open conversation
                      </p>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </aside>

      {/* ── Main ── */}
      <main className="flex flex-1 flex-col overflow-hidden">{children}</main>
    </div>
  );
}