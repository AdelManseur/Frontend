import { API_BASE_URL } from "@/lib/api-config";
import type { ApiMessageResponse, MeResponse, UpdateProfilePayload } from "./interfaces";

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

export async function updateMyProfile(payload: UpdateProfilePayload): Promise<ApiMessageResponse> {
  const formData = new FormData();
  formData.append("metadata", JSON.stringify(payload.metadata));
  formData.append("folder", payload.folder ?? "users");

  if (payload.pfp) {
    formData.append("pfp", payload.pfp);
  }

  const response = await fetch(`${API_BASE_URL}/api/users/update-profile`, {
    method: "PUT",
    credentials: "include",
    body: formData,
  });

  const raw = await response.text();
  const isJson = (response.headers.get("content-type") || "").includes("application/json");
  const data = (isJson && raw ? JSON.parse(raw) : null) as ApiMessageResponse | null;

  if (!response.ok) {
    throw new Error(data?.message || `Profile update failed (${response.status})`);
  }

  return data ?? { message: "Profile updated successfully" };
}