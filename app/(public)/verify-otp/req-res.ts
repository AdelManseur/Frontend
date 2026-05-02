import { API_BASE_URL } from "@/lib/api-config";
import type {
  ApiErrorResponse,
  VerifyOtpRequest,
  VerifyOtpSuccessResponse,
} from "./interfaces";

export async function verifyOtp(payload: VerifyOtpRequest): Promise<VerifyOtpSuccessResponse> {
  console.log("Verifying OTP with payload:", payload);
  const response = await fetch(`${API_BASE_URL}/api/users/verify-otp`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(payload),
  });

  const raw = await response.text();
  const isJson = (response.headers.get("content-type") || "").includes("application/json");
  const data = (isJson && raw ? JSON.parse(raw) : null) as
    | VerifyOtpSuccessResponse
    | ApiErrorResponse
    | null;

  if (!response.ok) {
    throw new Error(data?.message || `OTP verification failed (${response.status})`);
  }

  if (!data) {
    throw new Error("Server returned an invalid response.");
  }

  return data as VerifyOtpSuccessResponse;
}