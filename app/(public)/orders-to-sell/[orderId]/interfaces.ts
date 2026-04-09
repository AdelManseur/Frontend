export type SimpleOrderStatus =
  | "pending"
  | "active"
  | "delivered"
  | "completed"
  | "cancelled"
  | "in_revision";

export interface OrderUser {
  _id: string;
  name: string;
  email?: string;
  pfp?: string;
}

export interface OrderGig {
  _id: string;
  title: string;
  images: string[];
  price: number;
  category: string;
}

export interface OrderRequirement {
  question: string;
  answer: string;
}

export interface OrderDeliverable {
  files?: string[];
  description?: string;
  deliveredAt?: string;
}

export interface OrderRevisionRequest {
  description?: string;
  requestedAt?: string;
  status?: string;
}

export interface OrderPayment {
  amount: number;
  currency: string;
  status: "pending" | "paid" | "refunded" | string;
  paidAt?: string;
}

export interface OrderTimeline {
  ordered?: string;
  started?: string;
  delivered?: string;
  completed?: string;
  cancelled?: string;
}

export interface OrderReview {
  rating: number;
  comment?: string;
  reviewedAt?: string;
}

export interface SellerExpandedOrder {
  _id: string;
  gig: OrderGig;
  buyer: OrderUser;
  seller: OrderUser;
  price: number;
  deliveryTime: number;
  revisions: number;
  status: SimpleOrderStatus;
  requirements: OrderRequirement[];
  deliverables: OrderDeliverable[];
  revisionRequests: OrderRevisionRequest[];
  payment: OrderPayment;
  timeline: OrderTimeline;
  expectedDelivery: string;
  review: OrderReview | null;
  createdAt: string;
  updatedAt: string;
  accessLevel: string;
}

export interface GetSellerOrderByIdResponse {
  order: SellerExpandedOrder;
}

export interface UpdateSellerOrderStatusResponse {
  message: string;
  order: SellerExpandedOrder;
}