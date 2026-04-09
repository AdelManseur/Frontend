export type OrderStatus =
  | "pending"
  | "in_progress"
  | "completed"
  | "cancelled"
  | "refunded"
  | string;

export interface OrderItem {
  id?: string;
  _id?: string;
  orderNumber?: string;
  title?: string;
  buyerName?: string;
  sellerName?: string;
  status: OrderStatus;
  price: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface OrdersQuery {
  status?: string;
  minPrice?: number;
  maxPrice?: number;
  page?: number;
  limit?: number;
}

export interface OrdersListPayload {
  orders: OrderItem[];
  total: number;
  page: number;
  limit: number;
}

export interface GetOrdersResponse {
  message?: string;
  orders?: OrderItem[];
  total?: number;
  page?: number;
  limit?: number;
  data?: {
    orders?: OrderItem[];
    total?: number;
    page?: number;
    limit?: number;
  };
}