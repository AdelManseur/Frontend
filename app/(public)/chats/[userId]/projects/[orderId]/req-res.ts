//import { console } from "inspector";
import type { GetSimpleOrderMessageResponse, SimpleOrderMessage } from "./interfaces";

const RAW_BASE = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:3000";
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
): Promise<SimpleOrderMessage | null> {
  const url =
    `${API_BASE}/simpleorders/messages` +
    `?me=${encodeURIComponent(userId1)}` +
    `&orderId=${encodeURIComponent(orderId)}`;

  const res = await fetch(url, { method: "GET", credentials: "include" });
  const data = await parseJson<GetSimpleOrderMessageResponse>(res);

  if (!res.ok) throw new Error(`Failed to fetch simple order messages (${res.status})`);

  // response shape: { message: { ... } }
  const raw = (data as any)?.message;
  if (!raw || Array.isArray(raw)) return null;

  return normalizeMessage(raw);
}