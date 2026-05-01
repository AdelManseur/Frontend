export interface UserAddress {
  street?: string;
  city?: string;
  postalCode?: string;
  country?: string;
}

export interface UserProfile {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  bday?: string;
  pfp?: string;
  address?: UserAddress;
  role: "admin" | "super_admin";
  createdAt?: string;
  updatedAt?: string;
}

export interface MeSuccessResponse {
  logged: true;
  user: UserProfile;
}

export interface MeErrorResponse {
  logged: false;
  message?: string;
}

export type MeResponse = MeSuccessResponse | MeErrorResponse;