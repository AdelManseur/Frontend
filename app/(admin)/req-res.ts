import { API_BASE_URL } from "@/lib/api-config";
import type { MeResponse } from "./interfaces";

export async function getMe(): Promise<MeResponse> {
  const response = await fetch(`${API_BASE_URL}/api/admin/me`, {
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

  /*if (data.user.role !== "super_admin") {
    return data.user
  }*/
  console.log("Me response:", data);
  console.log(`User role: ${data?.user?.role}`);
  console.log(`Me response as MeResponse:`, data as MeResponse);
  return data as MeResponse;
}

export async function logoutUser(): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/api/admin/logout`, {
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