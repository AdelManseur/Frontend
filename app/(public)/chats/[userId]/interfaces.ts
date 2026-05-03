export interface ChatMessage {
  _id: string;
  from: string;
  to: string;
  content: string;
  createdAt: string;
  read: boolean;
}

export interface GetMessagesResponse {
  messages: ChatMessage[];
}

export interface SimpleUserDetails {
  _id: string;
  name: string;
  email?: string;
  pfp?: string;
}

export interface ProjectOrderSummary {
  _id: string;
  role?: string;
  gig: {
    title: string;
    images?: string[];
    price?: number;
    category?: string;
  };
  price?: number;
  package?: string;
  status?: string;
  createdAt?: string;
}

export interface GetOrdersBetweenUsersResponse {
  orders: ProjectOrderSummary[];
  pagination?: {
    currentPage?: number;
    totalPages?: number;
    totalCount?: number;
  };
}