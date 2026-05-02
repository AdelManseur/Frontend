import { API_BASE_URL } from "@/lib/api-config";
import type { SignupRequest, SignupSuccessResponse, ApiErrorResponse } from "./interfaces";

export async function signupUser(payload: SignupRequest): Promise<SignupSuccessResponse> {
  console.log("Signing up user with payload:", payload);
  const formData = new FormData();
  formData.append("metadata", JSON.stringify(payload.metadata));

  if (payload.pfp) formData.append("pfp", payload.pfp);
  if (payload.folder) formData.append("folder", payload.folder);

  console.log("url is", `${API_BASE_URL}/api/users/signin`);
  const response = await fetch(`${API_BASE_URL}/api/users/signin`, {
    method: "POST",
    credentials: "include",
    body: formData,
  });

  const contentType = response.headers.get("content-type") || "";
  const raw = await response.text();

  let data: SignupSuccessResponse | ApiErrorResponse | null = null;
  if (contentType.includes("application/json") && raw) {
    data = JSON.parse(raw);
  }

  if (!response.ok) {
    throw new Error(
      data?.message || `Signup failed (${response.status}): ${raw.slice(0, 200)}`
    );
  }

  if (!data) {
    throw new Error("Signup succeeded but response was not JSON.");
  }

  return data as SignupSuccessResponse;
}
