import type { BuyerOrderStatus, BuyerOrdersResponse } from "./interfaces";

const RAW_BASE = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:5001";
const API_BASE = RAW_BASE.endsWith("/api") ? RAW_BASE : `${RAW_BASE}/api`;

type GetBuyerOrdersParams = {
  status?: BuyerOrderStatus;
  page?: number;
  limit?: number;
};

export async function getBuyerOrders(
  params: GetBuyerOrdersParams = {}
): Promise<BuyerOrdersResponse> {
  const query = new URLSearchParams();

  if (params.status) query.set("status", params.status);
  if (params.page) query.set("page", String(params.page));
  if (params.limit) query.set("limit", String(params.limit));

  const url = `${API_BASE}/simpleorders/buyer${query.toString() ? `?${query}` : ""}`;

  const res = await fetch(url, {
    method: "GET",
    credentials: "include",
  });

  const data = await res.json().catch(() => null);

  if (!res.ok) {
    throw new Error(data?.message || data?.error || `Failed to load buyer orders (${res.status})`);
  }

  return {
    orders: Array.isArray(data?.orders) ? data.orders : [],
    pagination: {
      currentPage: Number(data?.pagination?.currentPage ?? 1),
      totalPages: Number(data?.pagination?.totalPages ?? 1),
      totalCount: Number(data?.pagination?.totalCount ?? 0),
    },
  };
}