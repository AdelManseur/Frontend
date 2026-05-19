import { API_BASE_URL } from "@/lib/api-config";

export async function getGigOwner(gigId: string): Promise<string | null> {
  try {
    const base = API_BASE_URL.endsWith("/api") ? API_BASE_URL : `${API_BASE_URL}/api`;
    const res = await fetch(`${base}/gigs/${encodeURIComponent(gigId)}`, {
      method: "GET",
      credentials: "include",
    });
    if (!res.ok) return null;
    const data = await res.json().catch(() => null);
    // Handle both { seller: { _id } } and { gig: { seller: { _id } } } shapes
    const gig = data?.gig ?? data?.data ?? data;
    return String(gig?.seller?._id ?? "") || null;
  } catch {
    return null;
  }
}
import type {
  ChatMessage,
  GetMessagesResponse,
  SimpleUserDetails,
  GetOrdersBetweenUsersResponse,
  ProjectOrderSummary,
} from "./interfaces";

const API_BASE = API_BASE_URL.endsWith("/api") ? API_BASE_URL : `${API_BASE_URL}/api`;

async function parseJson<T>(res: Response): Promise<T | null> {
  try {
    return (await res.json()) as T;
  } catch {
    return null;
  }
}

export async function getMessagesBetween(userId1: string, userId2: string, gigId?: string, orderId?: string): Promise<ChatMessage[]> {
  let url = `${API_BASE}/chat/messages?userId1=${encodeURIComponent(userId1)}&userId2=${encodeURIComponent(userId2)}`;
  if (orderId) url += `&orderId=${encodeURIComponent(orderId)}`;
  else if (gigId) url += `&gigId=${encodeURIComponent(gigId)}`;

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
    gigId: m?.gigId,
    orderId: m?.orderId,
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
  meId: string,
  otherId: string
): Promise<ProjectOrderSummary[]> {
  // Fetch all orders where I am the buyer OR the seller, then filter to those involving the other user.
  const [buyerRes, sellerRes] = await Promise.all([
    fetch(`${API_BASE}/orders/buyer`, { method: "GET", credentials: "include" }),
    fetch(`${API_BASE}/orders/seller`, { method: "GET", credentials: "include" }),
  ]);

  const buyerData = await parseJson<{ orders: any[] }>(buyerRes);
  const sellerData = await parseJson<{ orders: any[] }>(sellerRes);

  const buyerOrders: ProjectOrderSummary[] = (buyerData?.orders ?? [])
    .filter((o: any) => {
      const sellerId = String(o?.seller?._id ?? o?.seller ?? "");
      return sellerId === otherId;
    })
    .map(mapOrder);

  const sellerOrders: ProjectOrderSummary[] = (sellerData?.orders ?? [])
    .filter((o: any) => {
      const buyerId = String(o?.buyer?._id ?? o?.buyer ?? "");
      return buyerId === otherId;
    })
    .map(mapOrder);

  // Return combined and deduplicated list
  const seen = new Set<string>();
  const all: ProjectOrderSummary[] = [];
  for (const o of [...buyerOrders, ...sellerOrders]) {
    if (!seen.has(o._id)) {
      seen.add(o._id);
      all.push(o);
    }
  }
  return all;
}

function mapOrder(o: any): ProjectOrderSummary {
  return {
    _id: String(o._id ?? ""),
    role: o.buyer?._id === o.seller?._id ? "buyer" : undefined,
    gig: {
      title: o.gig?.title ?? "Untitled Gig",
      images: o.gig?.images ?? [],
      category: o.gig?.category ?? "",
      price: o.gig?.price?.basic?.price ?? o.price ?? 0,
    },
    price: o.totalAmount ?? o.price ?? 0,
    status: o.status,
    package: o.package,
    createdAt: o.createdAt,
  };
}

type SendMessagePayload = {
  from: string;
  to: string;
  content: string;
  gigId?: string;
  orderId?: string;
};

type SendMessageResponse = {
  message: string;
  data: {
    _id: string;
    from: string;
    to: string;
    content: string;
    createdAt: string;
    read: boolean;
  };
};

export async function sendChatMessage(payload: SendMessagePayload) {
  const url = `${API_BASE}/chat/message`;

  const res = await fetch(url, {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  const data = (await res.json().catch(() => null)) as SendMessageResponse | null;

  if (!res.ok || !data?.data) {
    throw new Error(data?.message || `Failed to send message (${res.status})`);
  }

  return data.data;
}

type MarkMessageReadResponse = {
  messageId: string;
  status: string;
};

export async function markMessageAsRead(messageId: string): Promise<MarkMessageReadResponse> {
  const res = await fetch(`${API_BASE}/chat/messageread`, {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ messageId }),
  });

  const data = (await res.json().catch(() => null)) as MarkMessageReadResponse | null;

  if (!res.ok) {
    throw new Error(`Failed to mark message as read (${res.status})`);
  }

  return data as MarkMessageReadResponse;
}

export async function getSpecificConversation(
  userId1: string,
  userId2: string,
  gigId?: string,
  orderId?: string
): Promise<any> {
  let url = `${API_BASE}/chat/specific-conv?userId1=${encodeURIComponent(userId1)}&userId2=${encodeURIComponent(userId2)}`;
  if (orderId) url += `&orderId=${encodeURIComponent(orderId)}`;
  else if (gigId) url += `&gigId=${encodeURIComponent(gigId)}`;

  const res = await fetch(url, { method: "GET", credentials: "include" });
  const data = await parseJson<any>(res);
  if (!res.ok) throw new Error(data?.error || `Failed to fetch conversation (${res.status})`);
  return data.conversation;
}

export async function ensureConversation(user1Id: string, user2Id: string, gigId?: string, orderId?: string): Promise<any> {
  const url = `${API_BASE}/chat/conv`;
  const res = await fetch(url, {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ user1Id, user2Id, gigId, orderId }),
  });
  const data = await parseJson<any>(res);
  if (!res.ok) throw new Error(data?.error || `Failed to ensure conversation (${res.status})`);
  return data.conversation;
}