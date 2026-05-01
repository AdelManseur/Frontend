import type {
  AdminItem,
  ListAdminsResponse,
  UpdateAdminPermissionsPayload,
  UpdateAdminPermissionsResponse,
  UpdateAdminStatusPayload,
  UpdateAdminStatusResponse,
} from "./interfaces";

const RAW_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api";

export async function listAdmins(token: string): Promise<AdminItem[]> {
  const res = await fetch(RAW_BASE + "/api/admin/list", {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    cache: "no-store",
  });

  const json = (await res.json().catch(() => null)) as
    | ListAdminsResponse
    | AdminItem[]
    | null;

  if (!res.ok) {
    throw new Error(json?.message || "Failed to fetch admins.");
  }

  if (Array.isArray(json)) return json;
  if (json?.admins) return json.admins;
  if (json?.data) return json.data;

  return [];
}

export async function updateAdminPermissions(
  adminId: string,
  payload: UpdateAdminPermissionsPayload,
  token: string
): Promise<UpdateAdminPermissionsResponse> {
  if (!token) throw new Error("Missing admin token.");
  if (!adminId) throw new Error("Missing admin ID.");

  const res = await fetch(RAW_BASE + `/api/admin/${adminId}/permissions`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });

  const json = (await res.json().catch(() => null)) as
    | UpdateAdminPermissionsResponse
    | null;

  if (!res.ok) {
    throw new Error(json?.message || "Failed to update admin permissions.");
  }

  return json || { message: "Admin updated successfully" };
}

export async function updateAdminStatus(
  adminId: string,
  payload: UpdateAdminStatusPayload,
  token: string
): Promise<UpdateAdminStatusResponse> {
  if (!token) throw new Error("Missing admin token.");
  if (!adminId) throw new Error("Missing admin ID.");

  const res = await fetch(RAW_BASE + `/api/admin/${adminId}/status`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });

  const json = (await res.json().catch(() => null)) as
    | UpdateAdminStatusResponse
    | null;

  if (!res.ok) {
    throw new Error(json?.message || "Failed to update admin status.");
  }

  return json || { message: "Admin status updated successfully" };
}