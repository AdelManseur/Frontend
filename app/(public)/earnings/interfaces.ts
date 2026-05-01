export interface EarningsSummary {
  lastMonth: number;
  lastYear: number;
  totalOrdersEver: number;
}

export interface CompletedOrderItem {
  id?: string;
  _id?: string;
  orderNumber?: string;
  title?: string;
  buyerName?: string;
  price: number;
  status: string;
  completedAt?: string;
  createdAt?: string;
}

export interface EarningsSummaryResponse {
  message?: string;
  summary?: Partial<EarningsSummary>;
  data?: {
    summary?: Partial<EarningsSummary>;
    lastMonth?: number;
    lastYear?: number;
    totalOrdersEver?: number;
  };
  lastMonth?: number;
  lastYear?: number;
  totalOrdersEver?: number;
}

export interface CompletedOrdersResponse {
  message?: string;
  orders?: CompletedOrderItem[];
  data?: {
    orders?: CompletedOrderItem[];
  };
  total?: number;
  page?: number;
  limit?: number;
}