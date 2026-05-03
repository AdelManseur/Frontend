"use client";

import Link from "next/link";
import { useParams, usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { getMe } from "@/app/(public)/req-res";
import { getOrdersBetweenSellerBuyer, getSimpleUserDetails } from "./req-res";
import type { ProjectOrderSummary, SimpleUserDetails } from "./interfaces";

const STATUS_COLORS: Record<string, string> = {
  pending:    "bg-yellow-500/20 text-yellow-400",
  active:     "bg-blue-500/20 text-blue-400",
  delivered:  "bg-purple-500/20 text-purple-400",
  completed:  "bg-emerald-500/20 text-emerald-400",
  cancelled:  "bg-red-500/20 text-red-400",
  in_revision:"bg-orange-500/20 text-orange-400",
};

export default function UserChatLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const params = useParams<{ userId: string }>();
  const otherId = params?.userId ?? "";

  const [otherUser, setOtherUser] = useState<SimpleUserDetails | null>(null);
  const [orders, setOrders] = useState<ProjectOrderSummary[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(true);

  useEffect(() => {
    let mounted = true;

    (async () => {
      if (!otherId) return;

      try {
        const me = await getMe();
        if (!me.logged) return;

        const [userInfo, sharedOrders] = await Promise.all([
          getSimpleUserDetails(otherId),
          getOrdersBetweenSellerBuyer(me.user._id, otherId).catch(() => []),
        ]);

        if (!mounted) return;
        setOtherUser(userInfo);
        setOrders(sharedOrders);
      } finally {
        if (mounted) setLoadingOrders(false);
      }
    })();

    return () => { mounted = false; };
  }, [otherId]);

  const generalHref = `/chats/${otherId}`;
  const initial = (otherUser?.name || "?").charAt(0).toUpperCase();

  return (
    <div className="flex flex-1 overflow-hidden">
      {/* Inner sidebar: user info + orders */}
      <aside className="flex w-64 flex-shrink-0 flex-col border-r border-white/10 bg-white/[0.02]">
        {/* User header */}
        <div className="border-b border-white/10 p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-indigo-500/20 text-sm font-bold text-indigo-300">
              {otherUser?.pfp ? (
                <img src={otherUser.pfp} alt={otherUser.name} className="h-full w-full rounded-full object-cover" />
              ) : (
                initial
              )}
            </div>
            <div className="min-w-0">
              <p className="truncate font-semibold text-white">{otherUser?.name || otherId}</p>
              {otherUser?.email && (
                <p className="truncate text-xs text-gray-500">{otherUser.email}</p>
              )}
            </div>
          </div>
        </div>

        {/* General chat link */}
        <div className="px-3 py-2">
          <Link
            href={generalHref}
            className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition hover:bg-white/5 ${
              pathname === generalHref
                ? "bg-indigo-500/10 text-indigo-300 font-medium"
                : "text-gray-400"
            }`}
          >
            <span>💬</span> General Chat
          </Link>
        </div>

        {/* Shared orders */}
        <div className="flex-1 overflow-y-auto px-3 pb-4">
          <p className="mb-2 px-2 text-[10px] font-semibold uppercase tracking-widest text-gray-600">
            Shared Orders
          </p>

          {loadingOrders ? (
            <div className="space-y-2">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="animate-pulse rounded-lg bg-white/5 p-3">
                  <div className="h-2 w-3/4 rounded bg-white/10" />
                  <div className="mt-2 h-2 w-1/2 rounded bg-white/10" />
                </div>
              ))}
            </div>
          ) : orders.length === 0 ? (
            <p className="px-2 text-xs text-gray-600">No shared orders.</p>
          ) : (
            <div className="space-y-1">
              {orders.map((order) => {
                const href = `/chats/${otherId}/projects/${order._id}`;
                const active = pathname === href;
                const statusClass = STATUS_COLORS[order.status ?? ""] ?? "bg-gray-500/20 text-gray-400";

                return (
                  <Link
                    key={order._id}
                    href={href}
                    className={`flex flex-col gap-1 rounded-lg px-3 py-2.5 text-xs transition hover:bg-white/5 ${
                      active ? "bg-indigo-500/10 border border-indigo-500/30" : ""
                    }`}
                  >
                    <p className={`truncate font-medium ${active ? "text-white" : "text-gray-300"}`}>
                      {order.gig?.title || "Untitled Gig"}
                    </p>
                    <div className="flex items-center gap-2">
                      {order.status && (
                        <span className={`rounded-full px-2 py-0.5 text-[10px] font-medium capitalize ${statusClass}`}>
                          {order.status.replace("_", " ")}
                        </span>
                      )}
                      {order.package && (
                        <span className="capitalize text-gray-600">{order.package}</span>
                      )}
                    </div>
                    {order.price !== undefined && (
                      <p className="text-indigo-400">${order.price}</p>
                    )}
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </aside>

      {/* Content */}
      <section className="flex flex-1 flex-col overflow-hidden">{children}</section>
    </div>
  );
}