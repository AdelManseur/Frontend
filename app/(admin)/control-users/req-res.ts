import type {
  GetUsersResponse,
  UsersListPayload,
  UsersQuery,
  UpdateUserStatusPayload,
  UpdateUserStatusResponse,
  UserDetailsResponse,
} from "./interfaces";

const RAW_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api";

function buildApiUrl(path: string): string {
  const base = RAW_BASE.replace(/\/+$/, "");
  const p = path.startsWith("/") ? path : `/${path}`;

  // avoid /api/api duplication
  if (base.endsWith("/api") && p.startsWith("/api/")) {
    return `${base}${p.slice(4)}`;
  }

  return `${base}${p}`;
}

export async function getUsersList(token: string, query: UsersQuery = {}): Promise<UsersListPayload> {
  //if (!token) throw new Error("Missing admin token.");

  const params = new URLSearchParams();
  if (query.search?.trim()) params.set("search", query.search.trim());
  if (typeof query.status === "boolean") params.set("status", String(query.status));
  params.set("page", String(query.page ?? 1));
  params.set("limit", String(query.limit ?? 20));

  const res = await fetch(RAW_BASE + `/api/admin/data/users?${params.toString()}`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    cache: "no-store",
  });

  const json = (await res.json().catch(() => null)) as GetUsersResponse | null;

  if (!res.ok) {
    throw new Error(json?.message || "Failed to fetch users.");
  }

  const users = json?.users ?? json?.data?.users ?? [];
  const total = json?.total ?? json?.data?.total ?? users.length;
  const page = json?.page ?? json?.data?.page ?? query.page ?? 1;
  const limit = json?.limit ?? json?.data?.limit ?? query.limit ?? 20;

  return { users, total, page, limit };
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
    throw new Error("Failed to fetch user details.");
  }

  return json;
}