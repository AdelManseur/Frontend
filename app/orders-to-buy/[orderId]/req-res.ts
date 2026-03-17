import type {
  AddReviewPayload,
  AddReviewResponse,
  RequestRevisionPayload,
  RequestRevisionResponse,
} from "./interfaces";

const RAW_BASE = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:5000";
const API_BASE = RAW_BASE.endsWith("/api") ? RAW_BASE : `${RAW_BASE}/api`;

export async function getBuyerOrderById(orderId: string): Promise<BuyerExpandedOrder> {
  const url = `${API_BASE}/simpleorders/${encodeURIComponent(orderId)}`;

  const res = await fetch(url, {
    method: "GET",
    credentials: "include",
  });

  const data = (await res.json().catch(() => null)) as GetBuyerOrderByIdResponse | null;

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

export async function addBuyerOrderReview(
  orderId: string,
  payload: AddReviewPayload
): Promise<AddReviewResponse> {
  const url = `${API_BASE}/simpleorders/${encodeURIComponent(orderId)}/review`;

  const res = await fetch(url, {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  const data = (await res.json().catch(() => null)) as AddReviewResponse | null;

  if (!res.ok) {
    throw new Error((data as any)?.message || (data as any)?.error || `Failed to add review (${res.status})`);
  }

  if (!data?.review) {
    throw new Error("Review missing in response.");
  }

  return data;
}

export async function requestBuyerRevision(
  orderId: string,
  payload: RequestRevisionPayload
): Promise<RequestRevisionResponse> {
  const url = `${API_BASE}/simpleorders/${encodeURIComponent(orderId)}/revisions`;

  const res = await fetch(url, {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  const data = (await res.json().catch(() => null)) as RequestRevisionResponse | null;

  if (!res.ok) {
    throw new Error(
      (data as any)?.message || (data as any)?.error || `Failed to request revision (${res.status})`
    );
  }

  if (!data?.revisionRequest) {
    throw new Error("Revision request missing in response.");
  }

  return data;
}