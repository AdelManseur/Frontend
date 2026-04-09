export interface SignupAddress {
  street: string;
  city: string;
  postalCode: string;
  country: string;
}

export interface SignupMetadata {
  name: string;
  email: string;
  phone: string;
  bday: string;
  password: string;
  address: SignupAddress;
}

export interface SignupRequest {
  metadata: SignupMetadata;
  pfp?: File | null;
  folder?: string;
}

export interface SignupSuccessResponse {
  message: string;
  email: string;
  redirect: string;
}

export interface ApiErrorResponse {
  message: string;
}

export type SignupApiResponse = SignupSuccessResponse | ApiErrorResponse;
