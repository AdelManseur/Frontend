export interface SimpleUserDetails {
  userId: string;
  name: string;
  email: string;
  phone: string;
  pfp?: string;
}

export interface GetSimpleUserDetailsResponse {
  userId: string;
  name: string;
  email: string;
  phone: string;
  pfp?: string;
  message?: string;
}