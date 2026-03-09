export interface GigSeller {
  _id: string;
  name: string;
  pfp?: string;
}

export interface GigRating {
  average: number;
  count: number;
}

export interface BuyerGig {
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
  rating: GigRating;
  totalOrders: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface GigsPagination {
  currentPage: number;
  totalPages: number;
  totalCount: number;
  hasNext?: boolean;
  hasPrev?: boolean;
}

export interface GetSimpleGigsResponse {
  gigs: BuyerGig[];
  pagination?: GigsPagination;
}

export interface GetCategoriesResponse {
  categories: string[];
}