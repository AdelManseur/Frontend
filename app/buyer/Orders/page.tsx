"use client";

import { useEffect, useMemo, useState } from "react";
import { getBuyerOrders } from "./req-res";
import type { BuyerOrder, BuyerOrderStatus } from "./interfaces";
import Link from "next/link";

const STATUS_OPTIONS: Array<{ label: string; value: "all" | BuyerOrderStatus }> = [
  { label: "All", value: "all" },
  { label: "Pending", value: "pending" },
  { label: "Active", value: "active" },
  { label: "Delivered", value: "delivered" },
  { label: "Completed", value: "completed" },
  { label: "Cancelled", value: "cancelled" },
  { label: "In Revision", value: "in_revision" },
];

function formatDate(value?: string) {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleString();
}

function getStatusClasses(status: BuyerOrderStatus) {
  switch (status) {
    case "pending":
      return "bg-amber-500/15 text-amber-300";
    case "active":
      return "bg-blue-500/15 text-blue-300";
    case "delivered":
      return "bg-violet-500/15 text-violet-300";
    case "completed":
      return "bg-emerald-500/15 text-emerald-300";
    case "cancelled":
      return "bg-red-500/15 text-red-300";
    case "in_revision":
      return "bg-orange-500/15 text-orange-300";
    default:
      return "bg-white/10 text-gray-300";
  }
}

export default function BuyerOrdersPage() {
  const [orders, setOrders] = useState<BuyerOrder[]>([]);
  const [status, setStatus] = useState<"all" | BuyerOrderStatus>("all");
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let mounted = true;

    (async () => {
      setIsLoading(true);
      setError("");

      try {
        const data = await getBuyerOrders({
          status: status === "all" ? undefined : status,
          page,
          limit,
        });

        if (!mounted) return;

        setOrders(data.orders);
        setTotalPages(data.pagination.totalPages || 1);
        setTotalCount(data.pagination.totalCount || 0);
      } catch (e) {
        if (!mounted) return;
        setError(e instanceof Error ? e.message : "Failed to load orders.");
      } finally {
        if (mounted) setIsLoading(false);
      }
    })();

    return () => {
      mounted = false;
    };
  }, [status, page, limit]);

  const heading = useMemo(() => {
    if (status === "all") return "All Orders";
    return `${STATUS_OPTIONS.find((x) => x.value === status)?.label ?? "Orders"}`;
  }, [status]);

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <div className="border-b border-white/10 pb-6">
        <p className="text-xs uppercase tracking-[0.2em] text-indigo-300">Buyer</p>
        <h1 className="mt-2 text-3xl font-semibold text-white">Your Orders</h1>
        <p className="mt-2 text-sm text-gray-400">
          Track all simple orders placed from your account.
        </p>
      </div>

      <div className="mt-6 flex flex-col gap-4 rounded-2xl border border-white/10 bg-white/5 p-4 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-sm text-gray-400">Showing</p>
          <p className="text-lg font-semibold text-white">
            {heading} <span className="text-gray-400">({totalCount})</span>
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          {STATUS_OPTIONS.map((option) => {
            const active = status === option.value;
            return (
              <button
                key={option.value}
                type="button"
                onClick={() => {
                  setStatus(option.value);
                  setPage(1);
                }}
                className={`rounded-full px-4 py-2 text-sm transition ${
                  active
                    ? "bg-indigo-500 text-white"
                    : "bg-white/10 text-gray-300 hover:bg-white/15"
                }`}
              >
                {option.label}
              </button>
            );
          })}
        </div>
      </div>

      {error && <p className="mt-6 text-sm text-red-400">{error}</p>}

      {isLoading ? (
        <div className="mt-8 rounded-2xl border border-white/10 bg-white/5 p-6 text-sm text-gray-400">
          Loading orders...
        </div>
      ) : orders.length === 0 ? (
        <div className="mt-8 rounded-2xl border border-white/10 bg-white/5 p-6 text-sm text-gray-400">
          No orders found.
        </div>
      ) : (
        <div className="mt-8 space-y-5">
          {orders.map((order) => (
            <Link
              key={order._id}
              href={`/buyer/orders/${order._id}`}
              className="block rounded-2xl border border-white/10 bg-[#0b1220] p-5 shadow-sm transition hover:border-indigo-400/40 hover:bg-[#111a2d]"
            >
              <div className="flex flex-col gap-5 md:flex-row">
                <div className="h-40 w-full overflow-hidden rounded-xl bg-white/5 md:w-64">
                  {order.gig.images?.[0] ? (
                    <img
                      src={order.gig.images[0]}
                      alt={order.gig.title}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="grid h-full w-full place-items-center text-sm text-gray-500">
                      No image
                    </div>
                  )}
                </div>

                <div className="flex-1">
                  <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                    <div>
                      <p className="text-xs uppercase tracking-[0.2em] text-indigo-300">
                        Order #{order._id.slice(-8)}
                      </p>
                      <h2 className="mt-1 text-xl font-semibold text-white">{order.gig.title}</h2>
                      <p className="mt-1 text-sm text-gray-400">{order.gig.category}</p>
                    </div>

                    <span
                      className={`inline-flex w-fit rounded-full px-3 py-1 text-xs font-medium capitalize ${getStatusClasses(order.status)}`}
                    >
                      {order.status.replace("_", " ")}
                    </span>
                  </div>

                  <div className="mt-5 grid grid-cols-1 gap-4 text-sm sm:grid-cols-2 lg:grid-cols-4">
                    <div>
                      <p className="text-gray-400">Seller</p>
                      <div className="mt-2 flex items-center gap-3">
                        {order.seller.pfp ? (
                          <img
                            src={order.seller.pfp}
                            alt={order.seller.name}
                            className="h-10 w-10 rounded-full object-cover"
                          />
                        ) : (
                          <div className="grid h-10 w-10 place-items-center rounded-full bg-white/10 text-xs text-gray-300">
                            {order.seller.name?.charAt(0) || "?"}
                          </div>
                        )}
                        <p className="text-white">{order.seller.name}</p>
                      </div>
                    </div>

                    <div>
                      <p className="text-gray-400">Order Price</p>
                      <p className="mt-2 text-white">${order.price}</p>
                    </div>

                    <div>
                      <p className="text-gray-400">Expected Delivery</p>
                      <p className="mt-2 text-white">{formatDate(order.expectedDelivery)}</p>
                    </div>

                    <div>
                      <p className="text-gray-400">Ordered At</p>
                      <p className="mt-2 text-white">{formatDate(order.createdAt)}</p>
                    </div>
                  </div>

                  <div className="mt-5 rounded-xl border border-white/10 bg-white/5 p-4">
                    <p className="text-sm text-gray-400">Gig Price Snapshot</p>
                    <p className="mt-1 text-white">${order.gig.price}</p>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}

      <div className="mt-8 flex items-center justify-between">
        <button
          type="button"
          onClick={() => setPage((prev) => Math.max(1, prev - 1))}
          disabled={page <= 1 || isLoading}
          className="rounded-md bg-white/10 px-4 py-2 text-sm text-white hover:bg-white/20 disabled:cursor-not-allowed disabled:opacity-50"
        >
          Previous
        </button>

        <p className="text-sm text-gray-400">
          Page <span className="text-white">{page}</span> of{" "}
          <span className="text-white">{totalPages}</span>
        </p>

        <button
          type="button"
          onClick={() => setPage((prev) => Math.min(totalPages, prev + 1))}
          disabled={page >= totalPages || isLoading}
          className="rounded-md bg-white/10 px-4 py-2 text-sm text-white hover:bg-white/20 disabled:cursor-not-allowed disabled:opacity-50"
        >
          Next
        </button>
      </div>
    </div>
  );
}