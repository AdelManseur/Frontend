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