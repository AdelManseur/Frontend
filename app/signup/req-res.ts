import type { SignupRequest, SignupSuccessResponse, ApiErrorResponse } from "./interfaces";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:5000";

export async function signupUser(payload: SignupRequest): Promise<SignupSuccessResponse> {
  const formData = new FormData();
  formData.append("metadata", JSON.stringify(payload.metadata));

  if (payload.pfp) formData.append("pfp", payload.pfp);
  if (payload.folder) formData.append("folder", payload.folder);

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
