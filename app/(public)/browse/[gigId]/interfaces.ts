export interface GigSeller {
  _id: string;
  name: string;
  pfp?: string;
}

export interface GigPackage {
  price: number;
  description: string;
  deliveryTime: number;
  revisions: number;
  features: string[];
}

export type PackageType = "basic" | "standard" | "premium";

export interface BuyerGigDetails {
  _id: string;
  title: string;
  description: string;
  category: string;
  subcategory: string;
  tags: string[];
  price: {
    basic: GigPackage;
    standard?: GigPackage;
    premium?: GigPackage;
  };
  images: string[];
  seller: {
    _id: string;
    name: string;
    pfp?: string;
    rating?: number;
    email?: string;
    totalOrders?: number;
    lastOnline?: string;
  };
  rating: { average: number; count: number };
  totalOrders: number;
  isActive: boolean;
  faqs: { question: string; answer: string }[];
  requirements: string[];
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
  order?: {
    _id: string;
    status: string;
  };
  conversationId?: string;
  chatId?: string;
  suspiciousPatterns?: string[];
}

export interface SendMessagePayload {
  from: string;
  to: string;
  content: string;
  gigId?: string;
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

export interface CreateOrderPayload {
  gigId: string;
  package: PackageType;
  requirements: { question: string; answer: string }[];
  extras?: { name: string; price: number; description: string }[];
}

export interface CreateOrderResponse {
  message: string;
  order?: {
    _id: string;
    status: string;
    [key: string]: unknown;
  };
}