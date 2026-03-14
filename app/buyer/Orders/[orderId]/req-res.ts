import type { GetSellerOrderByIdResponse, SellerExpandedOrder } from "./interfaces";

const RAW_BASE = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:5000";
const API_BASE = RAW_BASE.endsWith("/api") ? RAW_BASE : `${RAW_BASE}/api`;

export async function getSellerOrderById(orderId: string): Promise<SellerExpandedOrder> {
  const url = `${API_BASE}/simpleorders/${encodeURIComponent(orderId)}`;

  const res = await fetch(url, {
    method: "GET",
    credentials: "include",
  });

  const data = (await res.json().catch(() => null)) as GetSellerOrderByIdResponse | null;

  if (!res.ok) {
    throw new Error((data as any)?.message || (data as any)?.error || `Failed to fetch order (${res.status})`);
  }

  if (!data?.order) {
    throw new Error("Order not found in response.");
  }
  
  if (!data.order.accessLevel) {
    throw new Error("Access level not provided in response.");
  } else if (data.order.accessLevel !== "buyer") {
    throw new Error("Access denied: User is not the buyer of this order.");
  }

  return data.order;
}