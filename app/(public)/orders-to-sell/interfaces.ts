export type SellerOrderStatus =
  | "pending"
  | "active"
  | "delivered"
  | "completed"
  | "cancelled"
  | "in_revision";

export interface SellerOrderGig {
  title: string;
  images: string[];
  price: number;
  category: string;
}

export interface SellerOrderBuyer {
  name: string;
  pfp?: string;
}

export interface SellerOrder {
  _id: string;
  reportId?: string;
  gig: SellerOrderGig;
  buyer: SellerOrderBuyer;
  price: number;
  status: SellerOrderStatus;
  reported?: boolean;
  expectedDelivery: string;
  createdAt: string;
}

export interface SellerOrdersPagination {
  currentPage: number;
  totalPages: number;
  totalCount: number;
}

export interface SellerOrdersResponse {
  orders: SellerOrder[];
  pagination: SellerOrdersPagination;
}