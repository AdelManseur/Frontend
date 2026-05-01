export interface UserDetails {
  id?: string;
  _id?: string;
  name: string;
  email: string;
  status: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface UserDetailsResponse {
  user: UserDetails;
  orders: number;
  fraudCases: number;
  reportsBy: number;
  reportsAgainst: number;
  message?: string;
}

export interface UpdateUserStatusPayload {
  status: boolean;
}

export interface UpdateUserStatusResponse {
  message?: string;
  user?: UserDetails;
}