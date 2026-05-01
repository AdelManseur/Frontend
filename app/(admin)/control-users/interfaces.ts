export interface UserItem {
  id?: string;
  _id?: string;
  name: string;
  email: string;
  status: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface UsersQuery {
  search?: string;
  status?: boolean;
  page?: number;
  limit?: number;
}

export interface UsersListPayload {
  users: UserItem[];
  total: number;
  page: number;
  limit: number;
}

export interface GetUsersResponse {
  message?: string;
  users?: UserItem[];
  total?: number;
  page?: number;
  limit?: number;
  data?: {
    users?: UserItem[];
    total?: number;
    page?: number;
    limit?: number;
  };
}

export interface UpdateUserStatusPayload {
  status: boolean;
}

export interface UpdateUserStatusResponse {
  message?: string;
  user?: UserItem;
}

export interface UserDetailsResponse {
  user: {
    id?: string;
    _id?: string;
    name: string;
    email: string;
    status: boolean;
    createdAt?: string;
    updatedAt?: string;
  };
  orders: number;
  fraudCases: number;
  reportsBy: number;
  reportsAgainst: number;
}