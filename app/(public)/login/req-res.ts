import { API_BASE_URL } from "@/lib/api-config";
import type { LoginRequest, LoginSuccessResponse, ApiErrorResponse } from "./interfaces";

export async function loginUser(payload: LoginRequest): Promise<LoginSuccessResponse> {
  console.log("Attempting to log in user with email:", payload.email);
  const response = await fetch(`${API_BASE_URL}/api/users/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
    body: JSON.stringify(payload),
  });

  const data = (await response.json()) as LoginSuccessResponse | ApiErrorResponse;

  if (!response.ok) {
    throw new Error(data.message || "Login request failed");
  }

  return data as LoginSuccessResponse;
}
