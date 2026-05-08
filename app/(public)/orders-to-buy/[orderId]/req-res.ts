import type {
  AddReviewPayload,
  AddReviewResponse,
  BuyerExpandedOrder,
  GetBuyerOrderByIdResponse,
  RequestRevisionPayload,
  RequestRevisionResponse,
  SubmitOrderReportError,
  SubmitOrderReportPayload,
  SubmitOrderReportResponse,
} from "./interfaces";

import type { SimpleOrderStatus } from "./interfaces";

const RAW_BASE = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:5001";
const API_BASE = RAW_BASE.endsWith("/api") ? RAW_BASE : `${RAW_BASE}/api`;

export async function getBuyerOrderById(orderId: string): Promise<BuyerExpandedOrder> {
  // Try simple orders first
  let res = await fetch(`${API_BASE}/simpleorders/${encodeURIComponent(orderId)}`, {
    method: "GET",
    credentials: "include",
  });

  let data = (await res.json().catch(() => null)) as GetBuyerOrderByIdResponse | null;

  // If not found in simple orders, try regular orders
  if (!res.ok || !data?.order) {
    res = await fetch(`${API_BASE}/orders/${encodeURIComponent(orderId)}`, {
      method: "GET",
      credentials: "include",
    });
    data = (await res.json().catch(() => null)) as GetBuyerOrderByIdResponse | null;
    if (data?.order) {
      (data.order as any).isRegular = true;
      // regular orders might not have accessLevel in the same way, let's assume if it returned it's allowed for now
      // or check the buyer id if needed.
      (data.order as any).accessLevel = "buyer"; 
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

export async function addBuyerOrderReview(
  orderId: string,
  payload: AddReviewPayload,
  isRegular?: boolean
): Promise<AddReviewResponse> {
  const endpoint = isRegular ? "orders" : "simpleorders";
  const url = `${API_BASE}/${endpoint}/${encodeURIComponent(orderId)}/review`;

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

  return data!;
}

export async function requestBuyerRevision(
  orderId: string,
  payload: RequestRevisionPayload,
  isRegular?: boolean
): Promise<RequestRevisionResponse> {
  const endpoint = isRegular ? "orders" : "simpleorders";
  const url = `${API_BASE}/${endpoint}/${encodeURIComponent(orderId)}/revisions`;

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

  return data!;
}

function buildSubmitReportErrorMessage(data: SubmitOrderReportError | null, status: number) {
  const base = data?.message || data?.error || `Failed to submit report (${status})`;
  const reason = data?.reason ? ` Reason: ${data.reason}` : "";
  return `${base}${reason}`.trim();
}

export async function submitBuyerOrderReport(
  payload: SubmitOrderReportPayload,
  screenshots?: File[]
): Promise<SubmitOrderReportResponse> {
  const url = `${API_BASE}/reports/submit`;
  const hasFiles = Boolean(screenshots?.length);

  const init: RequestInit = {
    method: "POST",
    credentials: "include",
  };

  if (hasFiles) {
    const formData = new FormData();
    formData.append("data", JSON.stringify(payload));

    for (const file of screenshots ?? []) {
      formData.append("screenshots", file);
    }

    init.body = formData;
  } else {
    init.headers = { "Content-Type": "application/json" };
    init.body = JSON.stringify(payload);
  }

  const res = await fetch(url, init);

  const rawData = (await res.json().catch(() => null)) as SubmitOrderReportResponse | SubmitOrderReportError | null;

  if (!res.ok) {
    throw new Error(buildSubmitReportErrorMessage(rawData as SubmitOrderReportError | null, res.status));
  }

  const data = rawData as SubmitOrderReportResponse | null;

  if (!data?.report) {
    throw new Error("Report missing in response.");
  }

  return data;
}

export async function updateBuyerOrderStatus(
  orderId: string,
  status: SimpleOrderStatus,
  isRegular?: boolean
): Promise<{ order: BuyerExpandedOrder; message: string }> {
  const endpoint = isRegular ? "orders" : "simpleorders";
  const url = `${API_BASE}/${endpoint}/${encodeURIComponent(orderId)}/status`;

  const res = await fetch(url, {
    method: "PATCH",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ status }),
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data.message || data.error || "Failed to update order status");
  
  if (data.order && isRegular) {
    data.order.isRegular = true;
    data.order.accessLevel = "buyer";
  }
  
  return data;
}
