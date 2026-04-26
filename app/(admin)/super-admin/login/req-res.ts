import type { AdminLoginRequest, AdminLoginResponse } from "./interfaces";

const RAW_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001";

function buildApiUrl(path: string): string {
  const base = RAW_BASE.replace(/\/+$/, "");
  const p = path.startsWith("/") ? path : `/${path}`;

  // avoid /api/api duplication
  if (base.endsWith("/api") && p.startsWith("/api/")) {
    return `${base}${p.slice(4)}`;
  }

  return `${base}${p}`;
}

export async function superAdminLogin(payload: AdminLoginRequest): Promise<AdminLoginResponse> {
  const res = await fetch(RAW_BASE + "/api/admin/login", {
    method: "POST",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  const json = (await res.json().catch(() => null)) as AdminLoginResponse | null;

  if (!res.ok || !json?.token || !json?.admin) {
    throw new Error(json?.message || "Invalid email or password.");
  }

  /*if (json.admin.role !== "super_admin") {
    throw new Error("Access denied: Not a super admin.");
  }*/

  return json;
}