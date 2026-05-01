import type { MeResponse } from "./interfaces";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:3000";

export async function getMe(): Promise<MeResponse> {
  console.log("Fetching current user info from API...");
  const response = await fetch(`${API_BASE_URL}/api/users/me`, {
    method: "GET",
    credentials: "include",
  });

  const raw = await response.text();
  const isJson = (response.headers.get("content-type") || "").includes("application/json");
  const data = isJson && raw ? JSON.parse(raw) : null;

  console.log("Received response for getMe:", { status: response.status, data });

  if (!response.ok) {
    return {
      logged: false,
      message: data?.message || `Not logged in (${response.status})`,
    };
  }

  return data as MeResponse;
}

export async function logoutUser(): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/api/users/logout`, {
    method: "POST",
    credentials: "include",
  });

  const raw = await response.text();
  const isJson = (response.headers.get("content-type") || "").includes("application/json");
  const data = isJson && raw ? JSON.parse(raw) : null;

  if (!response.ok) {
    throw new Error(data?.message || `Logout failed (${response.status})`);
  }

  // Redirect to root on successful logout
  if (typeof window !== "undefined") {
    window.location.assign("/");
  }
}