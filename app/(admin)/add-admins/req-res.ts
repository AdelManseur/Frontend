import { API_BASE_URL } from "@/lib/api-config";
import type { CreateAdminPayload, CreateAdminResponse } from "./interfaces";

export async function createAdmin(
  payload: CreateAdminPayload,
  token: string
): Promise<CreateAdminResponse> {
  const res = await fetch(API_BASE_URL + "/api/admin/create", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });

  const data = (await res.json().catch(() => null)) as CreateAdminResponse | null;

  if (!res.ok) {
    console.error("Create admin error response:", res.status, data);
    throw new Error(data?.message || "Failed to create admin.");
  }
  console.log("Create admin success response:", data);

  return data || { message: "Admin created successfully" };
}