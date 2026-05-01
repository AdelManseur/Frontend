export interface SellerGig {
  _id: string;
  title: string;
  description?: string;
  category: string;
  price: number;
  status?: "active" | "paused";
  orders?: number;
  rating?: number | { average?: number; count?: number };
  deliveryTime?: number;
  revisions?: number;
  tags?: string[];
  features?: string[];
  images?: string[];
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