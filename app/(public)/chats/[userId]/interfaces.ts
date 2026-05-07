export type MessageType = "text" | "custom_offer";

export interface ICustomOffer {
  title: string;
  description: string;
  price: number;
  deliveryTime: number;   // days
  revisions: number;
  status: "pending" | "accepted" | "rejected" | "expired";
}

export interface ChatMessage {
  _id: string;
  from: string;
  to: string;
  content: string;
  type?: MessageType;
  offer?: ICustomOffer;
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