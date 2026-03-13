export interface GigSeller {
  _id: string;
  name: string;
  pfp?: string;
}

export interface BuyerGigDetails {
  _id: string;
  title: string;
  description: string;
  category: string;
  tags: string[];
  price: number;
  deliveryTime: number;
  revisions: number;
  features: string[];
  images: string[];
  seller: GigSeller;
  rating: { average: number; count: number };
  totalOrders: number;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface GigDetailsResponse {
  gig?: BuyerGigDetails;
  data?: BuyerGigDetails;
  message?: string;
}

export interface ApiMessageResponse {
  message: string;
  conversationId?: string;
  chatId?: string;
}

export interface SendMessagePayload {
  from: string;
  to: string;
  content: string;
}

export interface SendMessageResponse {
  message: string;
  data?: {
    _id: string;
    from: string;
    to: string;
    content: string;
    createdAt: string;
    read?: boolean;
  };
}

export interface SimpleOrderRequirement {
  question: string;
  answer: string;
}

export interface CreateSimpleOrderPayload {
  gigId: string;
  requirements: SimpleOrderRequirement[];

  // richer request fields
  price: number;
  currency: string; // default "USD" for now
  deliveryTime: number;
  revisions?: number;
  status: "pending";
  payment: {
    amount: number;
    currency: string;
    status: "pending";
  };
  timeline: {
    started: string;
  };
}

export interface CreateSimpleOrderResponse {
  message: string;
  order: {
    _id: string;
    status: string;
    payment?: { amount: number; currency: string; status: string };
    timeline?: {
      started?: string;
      delivered?: string;
      completed?: string;
      cancelled?: string;
    };
    [key: string]: unknown;
  };
}