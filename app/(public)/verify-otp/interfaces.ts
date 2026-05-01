export interface VerifyOtpRequest {
  otp: string;
}

export interface VerifyOtpSuccessResponse {
  message: string;
}

export interface ApiErrorResponse {
  message: string;
  error?: string;
}

export type VerifyOtpApiResponse = VerifyOtpSuccessResponse | ApiErrorResponse;