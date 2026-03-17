import type {
  ChatMessage,
  GetMessagesResponse,
  SimpleUserDetails,
  GetOrdersBetweenUsersResponse,
  ProjectOrderSummary,
} from "./interfaces";

const RAW_BASE = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:5000";
const API_BASE = RAW_BASE.endsWith("/api") ? RAW_BASE : `${RAW_BASE}/api`;

async function parseJson<T>(res: Response): Promise<T | null> {
  try {
    return (await res.json()) as T;
  } catch {
    return null;
  }
}

export async function getMessagesBetween(userId1: string, userId2: string): Promise<ChatMessage[]> {
  const url = `${API_BASE}/chat/messages?userId1=${encodeURIComponent(userId1)}&userId2=${encodeURIComponent(userId2)}`;
  const res = await fetch(url, { method: "GET", credentials: "include" });
  const data = await parseJson<GetMessagesResponse>(res);

  if (!res.ok) throw new Error(`Failed to fetch messages (${res.status})`);

  return (data?.messages ?? []).map((m: any) => ({
    _id: String(m?._id ?? ""),
    from: String(m?.from ?? ""),
    to: String(m?.to ?? ""),
    content: String(m?.content ?? ""),
    createdAt: String(m?.createdAt ?? new Date().toISOString()),
    read: Boolean(m?.read),
  }));
}

export async function getSimpleUserDetails(userId: string): Promise<SimpleUserDetails> {
  const url = `${API_BASE}/users/get-details?userId=${encodeURIComponent(userId)}`;
  const res = await fetch(url, { method: "GET", credentials: "include" });
  const data = await parseJson<any>(res);

  if (!res.ok) throw new Error(`Failed to fetch user details (${res.status})`);

  const src = data?.user ?? data ?? {};
  return {
    _id: String(src.userId ?? src._id ?? userId),
    name: String(src.name ?? "Unknown user"),
    email: src.email ? String(src.email) : undefined,
    pfp: src.pfp ? String(src.pfp) : undefined,
  };
}

export async function getOrdersBetweenSellerBuyer(
  sellerId: string,
  buyerId: string
): Promise<ProjectOrderSummary[]> {
  const url = `${API_BASE}/simpleorders/byusers?me=${encodeURIComponent(sellerId)}&other=${encodeURIComponent(buyerId)}`;

  const res = await fetch(url, {
    method: "GET",
    credentials: "include",
  });

  const data = await parseJson<GetOrdersBetweenUsersResponse>(res);

  if (!res.ok) throw new Error(`Failed to fetch project chats (${res.status})`);

  return Array.isArray(data?.orders) ? data!.orders : [];
}