import type { LoginRequest, LoginSuccessResponse, ApiErrorResponse } from "./interfaces";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:3000";

export async function loginUser(payload: LoginRequest): Promise<LoginSuccessResponse> {
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
