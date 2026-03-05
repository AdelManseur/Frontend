import type { SignupRequest, SignupSuccessResponse, ApiErrorResponse } from "./interfaces";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:5000";

export async function signupUser(payload: SignupRequest): Promise<SignupSuccessResponse> {
  const formData = new FormData();
  formData.append("metadata", JSON.stringify(payload.metadata));

  if (payload.pfp) {
    formData.append("pfp", payload.pfp);
  }

  if (payload.folder) {
    formData.append("folder", payload.folder);
  }

  const response = await fetch(`${API_BASE_URL}/api/users/signup`, {
    method: "POST",
    credentials: "include",
    body: formData,
  });

  const data = (await response.json()) as SignupSuccessResponse | ApiErrorResponse;

  if (!response.ok) {
    throw new Error(data.message || "Signup request failed");
  }

  return data as SignupSuccessResponse;
}
