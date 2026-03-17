export interface GigRating {
  average: number;
  count: number;
}

export interface SellerGigExpanded {
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
  rating: GigRating;
  totalOrders: number;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface GigSingleResponse {
  gig?: SellerGigExpanded;
  data?: SellerGigExpanded;
  message?: string;
}

export interface UpdateGigPayload {
  title: string;
  description: string;
  category: string;
  tags: string[];
  price: number;
  deliveryTime: number;
  revisions: number;
  features: string[];
  images: string[];
  isActive: boolean;
}

export interface ApiMessageResponse {
  message: string;
}