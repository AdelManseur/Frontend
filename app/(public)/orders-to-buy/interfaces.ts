export type BuyerOrderStatus =
  | "pending"
  | "active"
  | "delivered"
  | "completed"
  | "cancelled"
  | "in_revision";

export interface BuyerOrderGig {
  title: string;
  images: string[];
  price: number;
  category: string;
}

export interface BuyerOrderSeller {
  name: string;
  pfp?: string;
}

export interface BuyerOrder {
  _id: string;
  reportId?: string;
  gig: BuyerOrderGig;
  seller: BuyerOrderSeller;
  price: number;
  status: BuyerOrderStatus;
  reported?: boolean;
  expectedDelivery: string;
  createdAt: string;
}

export interface BuyerOrdersPagination {
  currentPage: number;
  totalPages: number;
  totalCount: number;
}

export interface BuyerOrdersResponse {
  orders: BuyerOrder[];
  pagination: BuyerOrdersPagination;
}