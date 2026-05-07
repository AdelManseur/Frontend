import { API_BASE_URL } from "@/lib/api-config";
import type { 
  ApiMessageResponse, 
  BuyerGigDetails, 
  CreateOrderPayload, 
  CreateOrderResponse, 
  GigDetailsResponse, 
  SendMessagePayload, 
  SendMessageResponse 
} from "./interfaces";

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
  const res = await fetch(`${API_BASE_URL}/api/gigs/${encodeURIComponent(gigId)}`, {
    method: "GET",
    credentials: "include",
  });

  const data = await parseJson<GigDetailsResponse | BuyerGigDetails>(res);
  const errorMessage =
    data && "message" in data && typeof data.message === "string"
      ? data.message
      : `Failed to load gig (${res.status})`;

  if (!res.ok || !data) throw new Error(errorMessage);
  return pickGig(data);
}

export async function createOrder(payload: CreateOrderPayload): Promise<CreateOrderResponse> {
  const res = await fetch(`${API_BASE_URL}/api/orders`, {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  const raw = await res.text();
  const isJson = (res.headers.get("content-type") || "").includes("application/json");
  const data = (isJson && raw ? JSON.parse(raw) : null) as CreateOrderResponse | null;

  if (!res.ok) {
    throw new Error(data?.message || `Failed to create order (${res.status})`);
  }

  return data ?? { message: "Order created successfully" };
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

type ConversationResponse = {
  conversation?: {
    _id: string;
    user1Id: string;
    user2Id: string;
    createdAt: string;
  };
  status?: string;
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

  return createData?.conversation?._id ?? null;
}

import type { AIRequestStepPayload, AIRequestStepResponse } from "../../interfaces";

export async function sendAIRequestStep(
  payload: AIRequestStepPayload
): Promise<AIRequestStepResponse> {
  const res = await fetch(`${API_BASE_URL}/api/chatbot/request-builder`, {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  const raw = await res.text();
  const isJson = (res.headers.get("content-type") || "").includes("application/json");
  const data = isJson && raw ? JSON.parse(raw) : null;

  if (!res.ok) {
    throw new Error(data?.error || `Failed to generate AI response (${res.status})`);
  }

  return data as AIRequestStepResponse;
}