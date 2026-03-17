import type {
  ConversationRaw,
  GetConversationsResponse,
  SellerConversationListItem,
  SimpleUserDetails,
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

function getConvId(raw: ConversationRaw): string {
  if (typeof raw === "string") return raw;
  return String(raw.convId ?? raw._id ?? raw.id ?? "");
}

function getOtherUserId(raw: ConversationRaw, sellerId: string): string {
  if(typeof raw === "string") return "";
  const user1Id = typeof raw.user1Id === "string" ? raw.user1Id : raw.user1Id?._id ?? "";
  const user2Id = typeof raw.user2Id === "string" ? raw.user2Id : raw.user2Id?._id ?? "";
  return user1Id === sellerId ? user2Id : user1Id;
}

export async function getSimpleUserDetails(userId: string): Promise<SimpleUserDetails> {
  const url = `${API_BASE}/users/get-details?userId=${encodeURIComponent(userId)}`;

  const res = await fetch(url, {
    method: "GET",
    credentials: "include",
  });

  const data = await parseJson<any>(res);
  console.log("Fetched user details:", { url, resStatus: res.status, data });

  if (!res.ok) {
    throw new Error(`Failed to get user details (${res.status})`);
  }

  // Supports both shapes:
  // 1) { user: { userId, name, ... } }   (your backend controller)
  // 2) { userId, name, ... }             (docs)
  const src = data?.user ?? data ?? {};

  return {
    _id: String(src.userId ?? src._id ?? userId),
    name: String(src.name ?? "Unknown user"),
    email: src.email ? String(src.email) : undefined,
    phone: src.phone ? String(src.phone) : undefined,
    pfp: src.pfp ? String(src.pfp) : undefined,
  };
}

export async function getSellerConversations(userId: string): Promise<SellerConversationListItem[]> {
  const url = `${API_BASE}/chat/conv?userId=${encodeURIComponent(userId)}`;

  const res = await fetch(url, {
    method: "GET",
    credentials: "include",
  });

  const data = await parseJson<GetConversationsResponse>(res);
  console.log("Fetched conversations:", { url, resStatus: res.status, data });
  
  if (!res.ok) {
    throw new Error(`Failed to fetch conversations (${res.status})`);
  }

  const conversations = data?.conversations ?? [];
  console.log(`Processing ${conversations.length} conversations for userId=${userId}`);

  const mapped = await Promise.all(
    conversations.map(async (conversation) => {
        const convId = getConvId(conversation);
        if (!convId) return null;

        const otherUserId = getOtherUserId(conversation, userId);
        if (!otherUserId) return null;
        const otherUser = await getSimpleUserDetails(otherUserId as string);

        return {
            convId,
            otherUser,
            createdAt: typeof conversation === "string" ? undefined : conversation.createdAt,
        } as SellerConversationListItem;
    })
  );

  const clean = mapped.filter((x): x is SellerConversationListItem => !!x);

  // dedupe
  const dedup = new Map<string, SellerConversationListItem>();
  for (const item of clean) dedup.set(item.convId, item);

  return [...dedup.values()];
}