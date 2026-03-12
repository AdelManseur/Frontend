import { io, Socket } from "socket.io-client";
import type { ChatMessage, PublicUser } from "./interfaces";

const RAW_BASE = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:3000";
const API_BASE = RAW_BASE.endsWith("/api") ? RAW_BASE : `${RAW_BASE}/api`;

// Use explicit socket envs (do NOT fallback to Next origin in production)
const SOCKET_URL =
  process.env.NEXT_PUBLIC_SOCKET_URL ??
  API_BASE.replace(/\/api\/?$/, ""); // e.g. http://localhost:5000
const SOCKET_PATH = process.env.NEXT_PUBLIC_SOCKET_PATH ?? "/socket.io";

async function parseJson<T>(res: Response): Promise<T | null> {
  const text = await res.text();
  if (!text) return null;
  try {
    return JSON.parse(text) as T;
  } catch {
    return null;
  }
}

function normalizeMessage(m: any): ChatMessage {
  return {
    _id: String(m?._id ?? ""),
    from: String(m?.from ?? ""),
    to: String(m?.to ?? ""),
    content: String(m?.content ?? ""),
    createdAt: String(m?.createdAt ?? new Date().toISOString()),
    read: Boolean(m?.read),
  };
}

function normalizeUser(u: any): PublicUser {
  return {
    _id: String(u?._id ?? ""),
    name: String(u?.name ?? "Unknown"),
    email: u?.email ? String(u.email) : undefined,
    pfp: u?.pfp ? String(u.pfp) : undefined,
  };
}

// CHAT DOCS endpoint
export async function getMessagesBetween(userId1: string, userId2: string): Promise<ChatMessage[]> {
  const res = await fetch(
    `${API_BASE}/chat/messages?userId1=${encodeURIComponent(userId1)}&userId2=${encodeURIComponent(userId2)}`,
    { method: "GET", credentials: "include" }
  );

  const data = await parseJson<{ messages: ChatMessage[] }>(res);
  if (!res.ok) throw new Error(`Failed to fetch messages (${res.status})`);

  return (data?.messages ?? [])
    .map(normalizeMessage)
    .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
}

// CHAT DOCS endpoint
export async function sendMessage(payload: {
  from: string;
  to: string;
  content: string;
}): Promise<ChatMessage> {
  const res = await fetch(`${API_BASE}/chat/message`, {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  const data = await parseJson<{ message: string; data: ChatMessage }>(res);
  if (!res.ok) throw new Error(data?.message || `Failed to send message (${res.status})`);

  return normalizeMessage(data?.data ?? payload);
}

// Needed only to discover candidate users to test /chat/messages against
export async function getAllUsers(): Promise<PublicUser[]> {
  const candidates = [
    `${API_BASE}/user/all`,
    `${API_BASE}/user/users`,
    `${API_BASE}/user/list`,
    `${API_BASE}/auth/users`,
  ];

  for (const url of candidates) {
    try {
      const res = await fetch(url, { method: "GET", credentials: "include" });
      console.log(`Tried ${url}:`, res.status); // DEBUG
      if (!res.ok) continue;

      const data = await parseJson<any>(res);
      const arr = Array.isArray(data) ? data : data?.users ?? data?.data ?? [];
      console.log(`Got users from ${url}:`, arr.length); // DEBUG
      if (Array.isArray(arr)) return arr.map(normalizeUser).filter((u) => !!u._id);
    } catch (e) {
      console.error(`Error fetching ${url}:`, e); // DEBUG
    }
  }

  console.warn("No user endpoint worked!"); // DEBUG
  return [];
}

export function connectChatSocket(userId: string): Socket {
  return io(SOCKET_URL, {
    path: SOCKET_PATH,
    withCredentials: true,
    query: { userId },
    transports: ["websocket", "polling"],
  });
}