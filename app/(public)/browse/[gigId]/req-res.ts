import type { ApiMessageResponse, BuyerGigDetails, CreateSimpleOrderPayload, CreateSimpleOrderResponse, GigDetailsResponse, SendMessagePayload, SendMessageResponse } from "./interfaces";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:5001";

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

export async function sendMessageToSeller(
  payload: SendMessagePayload
): Promise<SendMessageResponse> {
  const response = await fetch(`${API_BASE_URL}/api/chat/message`, {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  const raw = await response.text();
  const isJson = (response.headers.get("content-type") || "").includes("application/json");
  const data = (isJson && raw ? JSON.parse(raw) : null) as SendMessageResponse | null;

  if (!response.ok) {
    throw new Error(data?.message || `Failed to send message (${response.status})`);
  }

  return data ?? { message: "Message sent successfully" };
}

export async function createSimpleOrder(payload: CreateSimpleOrderPayload): Promise<CreateSimpleOrderResponse> {
  const base = API_BASE_URL.endsWith("/api") ? API_BASE_URL : `${API_BASE_URL}/api`;
  const url = `${base}/simpleorders`; // important: use documented route

  console.log("[createSimpleOrder] URL:", url);
  console.log("[createSimpleOrder] Payload:", payload);

  const res = await fetch(url, {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  const raw = await res.text();
  let data: CreateSimpleOrderResponse | { message?: string } | null = null;

  try {
    data = raw ? JSON.parse(raw) : null;
  } catch {
    data = null;
  }

  console.log("[createSimpleOrder] Status:", res.status);
  console.log("[createSimpleOrder] Raw response:", raw);
  console.log("[createSimpleOrder] Parsed response:", data);

  if (!res.ok) {
    throw new Error(
      data && "message" in data && data.message
        ? data.message
        : `Failed to create simple order (${res.status})`
    );
  }

  return data as CreateSimpleOrderResponse;
}

type CreateSimpleOrderMessagePayload = {
  simpleOrderId: string;
  from?: string;
  to?: string;
  message: string;
  attachments?: string[];
  timestamp?: string;
  read?: boolean;
};

export async function createSimpleOrderMessage(payload: CreateSimpleOrderMessagePayload): Promise<void> {
  const base = API_BASE_URL.endsWith("/api") ? API_BASE_URL : `${API_BASE_URL}/api`;
  const url = `${base}/simpleorders/${payload.simpleOrderId}/messages`;

  const body = {
    simpleOrderId: payload.simpleOrderId,
    ...(payload.from ? { from: payload.from } : {}),
    ...(payload.to ? { to: payload.to } : {}),
    message: payload.message,
    attachments: payload.attachments ?? [],
    timestamp: payload.timestamp ?? new Date().toISOString(),
    read: payload.read ?? false,
  };

  const res = await fetch(url, {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  const data = await res.json().catch(() => null);
  if (!res.ok) {
    throw new Error(data?.message || data?.error || `Failed to add order message (${res.status})`);
  }
}

type ConversationResponse = {
  conversation?: {
    convId: string;
    user1Id: string;
    user2Id: string;
    createdAt: string;
  };
  convIds?: string[];
  message?: string;
};

export async function ensureConversationExists(
  sellerId: string,
  buyerId: string
): Promise<string | null> {
  const base = API_BASE_URL.endsWith("/api") ? API_BASE_URL : `${API_BASE_URL}/api`;
  const body = { user1Id: sellerId, user2Id: buyerId };

  // create if it doesn't exist. The backend will handle the logic to prevent duplicates.
  const createRes = await fetch(`${base}/chat/conv`, {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  const createData = (await createRes.json().catch(() => null)) as ConversationResponse | null;

  if (!createRes.ok) {
    throw new Error(createData?.message || `Failed creating conversation (${createRes.status})`);
  }

  return createData?.conversation?.convId ?? null;
}