import type {
  UpdateUserStatusPayload,
  UpdateUserStatusResponse,
  UserDetailsResponse,
} from "./interfaces";

const RAW_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api";

function buildApiUrl(path: string): string {
  const base = RAW_BASE.replace(/\/+$/, "");
  const p = path.startsWith("/") ? path : `/${path}`;

  if (base.endsWith("/api") && p.startsWith("/api/")) {
    return `${base}${p.slice(4)}`;
  }

  return `${base}${p}`;
}

export async function getUserDetails(token: string, userId: string): Promise<UserDetailsResponse> {
  //if (!token) throw new Error("Missing admin token.");
  if (!userId) throw new Error("Missing user ID.");

  const res = await fetch(RAW_BASE + `/api/admin/data/users/${userId}`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    cache: "no-store",
  });

  const json = (await res.json().catch(() => null)) as UserDetailsResponse | null;

  if (!res.ok || !json?.user) {
    throw new Error(json?.message || "Failed to fetch user details.");
  }

  return json;
}

export async function updateUserStatus(
  token: string,
  userId: string,
  payload: UpdateUserStatusPayload
): Promise<UpdateUserStatusResponse> {
  //if (!token) throw new Error("Missing admin token.");
  if (!userId) throw new Error("Missing user ID.");

  const res = await fetch(RAW_BASE + `/api/admin/data/users/${userId}/status`, {
    method: "PATCH",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  const json = (await res.json().catch(() => null)) as UpdateUserStatusResponse | null;

  if (!res.ok) {
    throw new Error(json?.message || "Failed to update user status.");
  }

  return json || { message: "User status updated." };
}