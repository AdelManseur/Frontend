import { API_BASE_URL } from "@/lib/api-config";
import type { 
  GetCategoriesResponse, 
  GetGigsResponse, 
  SendAIMessageResponse, 
  GetAIChatHistoryResponse,
  AIMessage 
} from "./interfaces";

type GetSimpleGigsParams = {
  search?: string;
  category?: string;
  tags?: string[];
  page?: number;
  limit?: number;
};

export async function sendAIMessage(payload: {
  from: string;
  to: string;
  content: string;
}): Promise<AIMessage[]> {

  const response = await fetch(`${API_BASE_URL}/api/chatbot/message`, {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  const data = (await response.json()) as SendAIMessageResponse;

  if (!response.ok) {
    throw new Error(data?.message || `Failed to send AI message (${response.status})`);
  }

  // Return both user message and AI response
  const messages: AIMessage[] = [
    {
      _id: data.data._id,
      from: data.data.from,
      to: data.data.to,
      role: "user",
      content: data.data.content,
      createdAt: data.data.createdAt,
    },
    {
      _id: `${data.data._id}-reply`,
      from: data.data.to,
      to: data.data.from,
      role: "assistant",
      content: data.data.aireply,
      createdAt: data.data.createdAt,
    },
  ];

  console.log("AI message sent, response:", messages);

  return messages;
}

export async function getAIChatHistory(userId1: string, userId2: string): Promise<AIMessage[]> {
  const query = new URLSearchParams({
    userId1,
    userId2,
  });

  const response = await fetch(`${API_BASE_URL}/api/chatbot/message?${query.toString()}`, {
    method: "GET",
    credentials: "include",
  });

  const data = (await response.json()) as GetAIChatHistoryResponse;

  if (!response.ok) return [];

  const messages = (data?.messages ?? []) as Array<{
    _id: string;
    from: string;
    to: string;
    content: string;
    aireply?: string;
    createdAt: string;
  }>;

  // Flatten: each message object has user message + optional AI reply
  const flattened: AIMessage[] = [];

  messages.forEach((msg) => {
    // User message
    const role = msg.to === 'ai-bot' ? 'user' : 'assistant';
    flattened.push({
      _id: msg._id,
      from: msg.from,
      to: msg.to,
      role: role,
      content: msg.content,
      createdAt: msg.createdAt,
    });
  });

  return flattened.sort(
    (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
  );
}

export async function getGigs(params: {
  search?: string;
  category?: string;
  subcategory?: string;
  minPrice?: number;
  maxPrice?: number;
  page?: number;
  limit?: number;
} = {}): Promise<GetGigsResponse> {
  const query = new URLSearchParams();

  if (params.search?.trim()) query.set("search", params.search.trim());
  if (params.category?.trim()) query.set("category", params.category.trim());
  if (params.subcategory?.trim()) query.set("subcategory", params.subcategory.trim());
  if (params.minPrice) query.set("minPrice", String(params.minPrice));
  if (params.maxPrice) query.set("maxPrice", String(params.maxPrice));
  query.set("page", String(params.page ?? 1));
  query.set("limit", String(params.limit ?? 50));

  const response = await fetch(`${API_BASE_URL}/api/gigs?${query.toString()}`, {
    method: "GET",
    credentials: "include",
  });

  const raw = await response.text();
  const isJson = (response.headers.get("content-type") || "").includes("application/json");
  const data = isJson && raw ? JSON.parse(raw) : null;

  if (!response.ok) {
    throw new Error(data?.message || `Failed to load gigs (${response.status})`);
  }

  return data as GetGigsResponse;
}

export async function getGigCategories(): Promise<string[]> {
  const response = await fetch(`${API_BASE_URL}/api/gigs/categories`, {
    method: "GET",
    credentials: "include",
  });

  const raw = await response.text();
  const isJson = (response.headers.get("content-type") || "").includes("application/json");
  const data = isJson && raw ? (JSON.parse(raw) as GetCategoriesResponse) : null;

  if (!response.ok) return [];
  return data?.categories ?? [];
}

export async function getRecommendations(): Promise<{
  gigs: any[];
  source: "personalized" | "interests" | "trending";
  count: number;
} | null> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/recommendations`, {
      method: "GET",
      credentials: "include",
    });

    if (!response.ok) return null; // 401 = not logged in → silently return null

    const raw = await response.text();
    const isJson = (response.headers.get("content-type") || "").includes("application/json");
    const data = isJson && raw ? JSON.parse(raw) : null;
    return data ?? null;
  } catch {
    return null;
  }
}