//import { console } from "inspector";
import type { GetSimpleOrderMessageResponse, SimpleOrderMessage } from "./interfaces";

const RAW_BASE = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:5000";
const API_BASE = RAW_BASE.endsWith("/api") ? RAW_BASE : `${RAW_BASE}/api`;

async function parseJson<T>(res: Response): Promise<T | null> {
  try {
    return (await res.json()) as T;
  } catch {
    return null;
  }
}

function normalizeMessage(raw: any): SimpleOrderMessage {
  return {
    _id: String(raw?._id ?? ""),
    from: String(raw?.from ?? ""),
    to: String(raw?.to ?? ""),
    role: raw?.role,
    content: String(raw?.content ?? raw?.message ?? ""),
    createdAt: String(raw?.createdAt ?? raw?.timestamp ?? new Date().toISOString()),
    read: Boolean(raw?.read),
    orderId: raw?.orderId ? String(raw.orderId) : undefined,
  };
}

export async function getSimpleOrderMessagesByUsers(
  userId1: string,
  orderId: string
): Promise<SimpleOrderMessage[]> {
  const url =
    `${API_BASE}/simpleorders/messages` +
    `?me=${encodeURIComponent(userId1)}` +
    `&orderId=${encodeURIComponent(orderId)}`;

  const res = await fetch(url, { method: "GET", credentials: "include" });
  
  // Update the generic type here if you have a GetSimpleOrderMessagesResponse defined
  const data = await parseJson<any>(res);

  if (!res.ok) {
    throw new Error(`Failed to fetch simple order messages (${res.status})`);
  }

  // 1. Access the "messages" array from the response
  const rawMessages = data?.messages;
  console.log("Raw messages from API:", rawMessages);

  // 2. Return an empty array if nothing is found or if it's not an array
  if (!rawMessages || !Array.isArray(rawMessages)) {
    return [];
  }

  // 3. Map over the array to normalize every message
  return rawMessages.map((msg: any) => normalizeMessage(msg));
}

export async function sendSimpleOrderMessageByUsers(payload: {
  from: string;
  to: string;
  orderId: string;
  content: string;
}): Promise<SimpleOrderMessage> {
  const res = await fetch(RAW_BASE + "/api/simpleorders/" + payload.orderId + "/messages", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(payload),
  });

  const json = (await res.json().catch(() => null)) as
    | { message?: string; data?: SimpleOrderMessage; chat?: SimpleOrderMessage; msg?: SimpleOrderMessage }
    | SimpleOrderMessage
    | null;

  if (!res.ok) {
    throw new Error((json as any)?.message || "Failed to send message.");
  }

  const created =
    (json as any)?.data ||
    (json as any)?.chat ||
    (json as any)?.msg ||
    json;

  return created as SimpleOrderMessage;
}