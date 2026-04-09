export type AdminRole = "super_admin" | "admin" | "moderator";

export interface AdminPermissions {
  canManageFraud: boolean;
  canManageReports: boolean;
  canManageUsers: boolean;
  canViewAnalytics: boolean;
  canDeleteData: boolean;
  canManageAdmins: boolean;
}

export interface CreateAdminPayload {
  name: string;
  email: string;
  password: string;
  role: AdminRole;
  permissions: AdminPermissions;
}

export interface CreateAdminResponse {
  message: string;
  admin?: {
    id: string;
    name: string;
    email: string;
    role: AdminRole;
    permissions: AdminPermissions;
  };
}import type { CreateAdminPayload, CreateAdminResponse } from "./interfaces";

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

export async function createAdmin(
  payload: CreateAdminPayload,
  token: string
): Promise<CreateAdminResponse> {
  const res = await fetch(buildApiUrl("/admin/create"), {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });

  const data = (await res.json().catch(() => null)) as CreateAdminResponse | null;

  if (!res.ok) {
    throw new Error(data?.message || "Failed to create admin.");
  }

  return data || { message: "Admin created successfully" };
}