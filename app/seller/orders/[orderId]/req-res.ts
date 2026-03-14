import type {
  GetSellerOrderByIdResponse,
  SellerExpandedOrder,
  SimpleOrderStatus,
  UpdateSellerOrderStatusResponse,
} from "./interfaces";

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
  } else if (data.order.accessLevel !== "seller") {
    throw new Error("Access denied: User is not the seller of this order.");
  }

  return data.order;
}

export async function updateSellerOrderStatus(
  orderId: string,
  status: SimpleOrderStatus
): Promise<UpdateSellerOrderStatusResponse> {
  const url = `${API_BASE}/simpleorders/${encodeURIComponent(orderId)}/status`;

  const res = await fetch(url, {
    method: "PATCH",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ status }),
  });

  const data = (await res.json().catch(() => null)) as UpdateSellerOrderStatusResponse | null;

  if (!res.ok) {
    throw new Error((data as any)?.message || (data as any)?.error || `Failed to update status (${res.status})`);
  }

  if (!data?.order) {
    throw new Error("Updated order not found in response.");
  }

  return data;
}