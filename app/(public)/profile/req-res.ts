import { API_BASE_URL } from "@/lib/api-config";
import type { MeResponse } from "./interfaces";

export async function getMyProfile(): Promise<MeResponse> {
  const response = await fetch(`${API_BASE_URL}/api/users/me`, {
    method: "GET",
    credentials: "include",
  });

  const raw = await response.text();
  const isJson = (response.headers.get("content-type") || "").includes("application/json");
  const data = (isJson && raw ? JSON.parse(raw) : null) as MeResponse | null;

  if (!response.ok || !data) {
    throw new Error(data?.message || `Failed to load profile (${response.status})`);
  }

  return data;
}