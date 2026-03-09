import type { ApiMessageResponse, BuyerGigDetails, GigDetailsResponse } from "./interfaces";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:5000";

function pickGig(payload: GigDetailsResponse | BuyerGigDetails): BuyerGigDetails {
  if ("_id" in payload) return payload;
  if (payload.gig) return payload.gig;
  if (payload.data) return payload.data;
  throw new Error("Gig details not found.");
}

async function parseJson<T>(res: Response): Promise<T | null> {
  const raw = await res.text();
  const isJson = (res.headers.get("content-type") || "").includes("application/json");
  return isJson && raw ? (JSON.parse(raw) as T) : null;
}

export async function getGigDetails(gigId: string): Promise<BuyerGigDetails> {
  const res = await fetch(`${API_BASE_URL}/api/simple-gigs/${encodeURIComponent(gigId)}`, {
    method: "GET",
    credentials: "include",
  });

  const data = await parseJson<GigDetailsResponse | BuyerGigDetails>(res);
  if (!res.ok || !data) throw new Error((data as any)?.message || `Failed to load gig (${res.status})`);
  return pickGig(data);
}

export async function createOrder(gigId: string): Promise<ApiMessageResponse> {
  const res = await fetch(`${API_BASE_URL}/api/orders`, {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ gigId }),
  });

  const data = await parseJson<ApiMessageResponse>(res);
  if (!res.ok) throw new Error(data?.message || `Failed to create order (${res.status})`);
  return data ?? { message: "Order created" };
}

export async function startChat(sellerId: string, gigId: string): Promise<ApiMessageResponse> {
  const res = await fetch(`${API_BASE_URL}/api/chats/start`, {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ sellerId, gigId }),
  });

  const data = await parseJson<ApiMessageResponse>(res);
  if (!res.ok) throw new Error(data?.message || `Failed to start chat (${res.status})`);
  return data ?? { message: "Chat started" };
}