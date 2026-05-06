import { API_BASE_URL } from "@/lib/api-config";
import type { MeResponse } from "./interfaces";

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
  console.log("User is logged in:", data.user);
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

export async function becomeASeller(): Promise<{ message: string }> {
  const res = await fetch(`${API_BASE_URL}/api/users/become-seller`, {
    method: "POST", credentials: "include"
  });
  if (!res.ok) throw new Error("Failed to become a seller");
  return res.json();
}

export async function updateMe(data: { metadata: any; pfp: File | null; folder?: string }): Promise<{ message: string }> {
  const formData = new FormData();
  formData.append("metadata", JSON.stringify(data.metadata));
  if (data.pfp) {
    formData.append("pfp", data.pfp);
  }
  if (data.folder) {
    formData.append("folder", data.folder);
  }

  const res = await fetch(`${API_BASE_URL}/api/users/update-profile`, {
    method: "PUT",
    credentials: "include",
    body: formData,
  });

  const resData = await res.json();
  if (!res.ok) throw new Error(resData.message || "Failed to update profile");
  return resData;
}

export async function getSellerDashboardStats(): Promise<any> {
  const res = await fetch(`${API_BASE_URL}/api/users/seller-dashboard`, {
    method: "GET",
    credentials: "include",
  });
  
  const raw = await res.text();
  const isJson = (res.headers.get("content-type") || "").includes("application/json");
  const data = isJson && raw ? JSON.parse(raw) : null;
  
  if (!res.ok) {
    throw new Error(data?.message || `Failed to load dashboard stats (${res.status})`);
  }
  
  return data.data;
}

export async function submitFeedback(message: string): Promise<{ success: boolean; message: string }> {
  const res = await fetch(`${API_BASE_URL}/api/users/feedback`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
    body: JSON.stringify({ message }),
  });
  
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data?.message || `Failed to submit feedback`);
  }
  return data;
}

export async function getEarningsData(): Promise<any> {
  const res = await fetch(`${API_BASE_URL}/api/users/earnings`, {
    method: "GET",
    credentials: "include",
  });
  
  const raw = await res.text();
  const isJson = (res.headers.get("content-type") || "").includes("application/json");
  const data = isJson && raw ? JSON.parse(raw) : null;
  
  if (!res.ok) {
    throw new Error(data?.message || `Failed to load earnings (${res.status})`);
  }
  
  return data.data;
}