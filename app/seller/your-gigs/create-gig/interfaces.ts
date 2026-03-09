export interface CreateGigMetadata {
  title: string;
  description: string;
  category: string;
  tags: string[];
  price: number;
  deliveryTime: number; // matches backend controller
  revisions: number;
  features: string[];
  images: string[]; // image URLs (not File objects)
}

export interface CreateGigRequest {
  metadata: CreateGigMetadata;
}

export interface CreatedGig {
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
  seller?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateGigSuccessResponse {
  message: string;
  gig?: CreatedGig;
  data?: CreatedGig; // supports common backend response variants
}

export interface ApiErrorResponse {
  message: string;
  error?: string;
}

export type CreateGigApiResponse = CreateGigSuccessResponse | ApiErrorResponse;