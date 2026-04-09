export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginUserAddress {
  street: string;
  city: string;
  postalCode: string;
  country: string;
}

export interface LoginUser {
  _id: string;
  name: string;
  email: string;
  phone: string;
  address: LoginUserAddress;
  pfp: string;
  lastOnline: string;
}

export interface LoginSuccessResponse {
  message: string;
  user: LoginUser;
}

export interface ApiErrorResponse {
  message: string;
}

export type LoginApiResponse = LoginSuccessResponse | ApiErrorResponse;
