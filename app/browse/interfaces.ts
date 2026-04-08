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
  price: number;
  deliveryTime: number;
  images?: string[];
  tags?: string[];
  rating?: {
    average: number;
    count: number;
  };
  seller?: {
    _id: string;
    name: string;
    email: string;
    pfp?: string;
  };
  isActive?: boolean;
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
  total: number;
  page: number;
  limit: number;
}

export interface GetCategoriesResponse {
  categories: string[];
}

export interface AIMessage {
  _id: string;
  from: string;
  to: string;
  role: "user" | "assistant";
  content: string;
  createdAt: string;
}

export interface SendAIMessageResponse {
  message: string;
  data: {
    _id: string;
    from: string;
    to: string;
    content: string;
    aireply: string;
    createdAt: string;
  };
}

export interface GetAIChatHistoryResponse {
  messages: Array<{
    _id: string;
    from: string;
    to: string;
    content: string;
    aireply?: string;
    createdAt: string;
  }>;
}