export interface GigPackage {
  price: number;
  description: string;
  deliveryTime: number;
  revisions: number;
  features: string[];
}

export interface SellerGig {
  _id: string;
  title: string;
  description?: string;
  category: string;
  subcategory?: string;
  price: {
    basic: GigPackage;
    standard?: GigPackage;
    premium?: GigPackage;
  };
  status?: "active" | "paused";
  isActive?: boolean;
  totalOrders?: number;
  rating?: { average: number; count: number };
  tags?: string[];
  images?: string[];
  faqs?: { question: string; answer: string }[];
  requirements?: string[];
  createdAt?: string;
  updatedAt?: string;
}

export interface GigsSuccessResponse {
  message?: string;
  gigs?: SellerGig[];
  data?: SellerGig[];
}

export interface GigsErrorResponse {
  message: string;
}

export type GigsApiResponse = GigsSuccessResponse | GigsErrorResponse;