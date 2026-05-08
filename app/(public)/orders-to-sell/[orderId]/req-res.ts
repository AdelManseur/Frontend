import { API_BASE_URL } from "@/lib/api-config";
import type {
  GetSellerOrderByIdResponse,
  SellerExpandedOrder,
  SimpleOrderStatus,
  UpdateSellerOrderStatusResponse,
} from "./interfaces";

const API_BASE = API_BASE_URL.endsWith("/api") ? API_BASE_URL : `${API_BASE_URL}/api`;

export async function getSellerOrderById(orderId: string): Promise<SellerExpandedOrder> {
  // Try simple orders first
  let res = await fetch(`${API_BASE}/simpleorders/${encodeURIComponent(orderId)}`, {
    method: "GET",
    credentials: "include",
  });

  let data = (await res.json().catch(() => null)) as GetSellerOrderByIdResponse | null;

  // If not found in simple orders, try regular orders
  if (!res.ok || !data?.order) {
    res = await fetch(`${API_BASE}/orders/${encodeURIComponent(orderId)}`, {
      method: "GET",
      credentials: "include",
    });
    data = (await res.json().catch(() => null)) as GetSellerOrderByIdResponse | null;
    if (data?.order) {
      (data.order as any).isRegular = true;
      (data.order as any).accessLevel = "seller";
    }
  }

  if (!res.ok) {
    throw new Error((data as any)?.message || (data as any)?.error || `Failed to fetch order (${res.status})`);
  }

  if (!data?.order) {
    throw new Error("Order not found in response.");
  }

  return data.order;
}

export async function updateSellerOrderStatus(
  orderId: string,
  status: SimpleOrderStatus,
  isRegular?: boolean
): Promise<UpdateSellerOrderStatusResponse> {
  const endpoint = isRegular ? "orders" : "simpleorders";
  const url = `${API_BASE}/${endpoint}/${encodeURIComponent(orderId)}/status`;

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

  return data!;
}

export async function submitDelivery(
  orderId: string,
  description: string,
  files: File[],
  links: string[],
  isRegular?: boolean
): Promise<{ message: string; order: SellerExpandedOrder }> {
  const endpoint = isRegular ? "orders" : "simpleorders";
  const url = `${API_BASE}/${endpoint}/${encodeURIComponent(orderId)}/deliverables`;

  const form = new FormData();
  form.append("description", description);
  files.forEach((f) => form.append("files", f));
  links.filter((l) => l.trim()).forEach((l) => form.append("links", l.trim()));

  const res = await fetch(url, {
    method: "POST",
    credentials: "include",
    body: form,
    // Do NOT set Content-Type — browser sets multipart boundary automatically
  });

  const data = (await res.json().catch(() => null)) as { message: string; order: SellerExpandedOrder } | null;

  if (!res.ok) {
    throw new Error((data as any)?.message || (data as any)?.error || `Delivery failed (${res.status})`);
  }

  return data!;
}