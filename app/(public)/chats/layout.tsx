"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { getMe } from "@/app/(public)/req-res";
import { getSellerConversations } from "./req-res";
import type { SellerConversationListItem } from "./interfaces";

export default function ChatsLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [items, setItems] = useState<SellerConversationListItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const me = await getMe();
        if (!me.logged) return;
        const rows = await getSellerConversations(me.user._id);
        if (mounted) setItems(rows);
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, []);

  return (
    <div className="flex h-[calc(100vh-64px)] overflow-hidden">
      {/* Sidebar */}
      <aside className="flex w-72 flex-shrink-0 flex-col border-r border-white/10 bg-white/[0.03]">
        <div className="flex items-center justify-between border-b border-white/10 px-5 py-4">
          <h2 className="text-lg font-semibold text-white">Messages</h2>
          <span className="rounded-full bg-indigo-500/20 px-2 py-0.5 text-xs text-indigo-300">
            {items.length}
          </span>
        </div>

        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="flex flex-col gap-3 p-4">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="flex items-center gap-3 animate-pulse">
                  <div className="h-10 w-10 rounded-full bg-white/10" />
                  <div className="flex-1 space-y-2">
                    <div className="h-3 w-3/4 rounded bg-white/10" />
                    <div className="h-2 w-1/2 rounded bg-white/10" />
                  </div>
                </div>
              ))}
            </div>
          ) : items.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-2 py-16 text-center">
              <span className="text-3xl">💬</span>
              <p className="text-sm text-gray-500">No conversations yet.</p>
            </div>
          ) : (
            <div className="flex flex-col py-2">
              {items.map((item) => {
                const href = `/chats/${item.otherUser._id}`;
                const active = pathname?.startsWith(href);
                const initial = (item.otherUser.name || "?").charAt(0).toUpperCase();

                return (
                  <Link
                    key={item.convId}
                    href={href}
                    className={`flex items-center gap-3 px-4 py-3 transition hover:bg-white/5 ${
                      active ? "bg-indigo-500/10 border-r-2 border-indigo-500" : ""
                    }`}
                  >
                    <div className="relative flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-indigo-500/20 text-sm font-bold text-indigo-300">
                      {item.otherUser.pfp ? (
                        <img
                          src={item.otherUser.pfp}
                          alt={item.otherUser.name || "User"}
                          className="h-full w-full rounded-full object-cover"
                        />
                      ) : (
                        initial
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className={`truncate text-sm font-medium ${active ? "text-white" : "text-gray-300"}`}>
                        {item.otherUser.name || "Unknown user"}
                      </p>
                      <p className="truncate text-xs text-gray-600">{item.otherUser._id}</p>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </aside>

      {/* Main area */}
      <main className="flex flex-1 flex-col overflow-hidden">{children}</main>
    </div>
  );
}