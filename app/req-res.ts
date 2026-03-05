import type { MeResponse } from "./interfaces";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:5000";

export async function getMe(): Promise<MeResponse> {
  const response = await fetch(`${API_BASE_URL}/api/users/me`, {
    method: "GET",
    credentials: "include",
  });

  const raw = await response.text();
  const isJson = (response.headers.get("content-type") || "").includes("application/json");
  const data = isJson && raw ? JSON.parse(raw) : null;

  if (!response.ok) {
    return {
      logged: false,
      message: data?.message || `Not logged in (${response.status})`,
    };
  }

  return data as MeResponse;
}