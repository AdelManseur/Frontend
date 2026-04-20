import type { SendMessagePayload, SendMessageResponse, ChatMessage } from "./interfaces";

const RAW_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api";

export async function sendChatMessage(payload: SendMessagePayload): Promise<ChatMessage> {
  const res = await fetch(RAW_BASE + "/api/chat/message", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(payload),
  });

  const json = (await res.json().catch(() => null)) as SendMessageResponse | null;

  if (!res.ok || !json?.data) {
    throw new Error(json?.message || "Failed to send message.");
  }

  return json.data;
}