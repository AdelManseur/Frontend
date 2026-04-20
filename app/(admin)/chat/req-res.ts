import type { GetSimpleUserDetailsResponse, SimpleUserDetails } from "./interfaces";

const RAW_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api";

export async function getSimpleUserDetails(
  userId: string,
  token?: string
): Promise<SimpleUserDetails> {
    console.log("Requesting user details for userId:", userId);
  if (!userId.trim()) {
    throw new Error("User ID is required.");
  }
  console.log("Using API base URL:", RAW_BASE);
  const headers: HeadersInit = {};
  if (token) headers.Authorization = `Bearer ${token}`;

  const res = await fetch(
    `${RAW_BASE}/api/users/get-details?userId=${encodeURIComponent(userId.trim())}`,
    {
      method: "GET",
      headers,
      credentials: "include",
      cache: "no-store",
    }
  );

  const json = (await res.json().catch(() => null)) as GetSimpleUserDetailsResponse | null;
  console.log("Received response for user details:", { status: res.status, json });
  if (!res.ok || !json?.user?.userId) {
    throw new Error(json?.message || "User not found.");
  }

  console.log("Fetched user details:", { url: res.url, status: res.status, response: json });

  return {
    userId: json.userId,
    name: json.name,
    email: json.email,
    phone: json.phone,
    pfp: json.pfp,
  };
}