export type ReportStatus = "pending" | "under_review" | "accepted" | "rejected";

export type ReportPriority = "low" | "medium" | "high" | "urgent";

export type ReportCategory =
  | "non_delivery"
  | "fake_service"
  | "poor_quality"
  | "scam"
  | "overcharge"
  | "harassment"
  | "other";

export interface ReportPersonSummary {
  _id?: string;
  name?: string;
  email?: string;
  username?: string;
  createdAt?: string;
}

export interface ReportOrderSummary {
  _id?: string;
  price?: number;
  status?: string;
}

export interface ReportCredibilitySummary {
  credibilityScore?: number;
  fraudScore?: number;
  totalOrders?: number;
  accountAge?: number;
  verifiedAccount?: boolean;
  priorReports?: number;
  priorReportsAccepted?: number;
}

export interface AdminReportItem {
  _id: string;
  reporter?: ReportPersonSummary;
  reportedUser?: ReportPersonSummary;
  order?: ReportOrderSummary;
  category: ReportCategory;
  severity?: "low" | "medium" | "high" | "critical" | string;
  reporterCredibility?: ReportCredibilitySummary;
  status?: ReportStatus | string;
  priority?: ReportPriority | string;
  createdAt?: string;
}

export interface ReportsPagination {
  page: number;
  limit: number;
  total: number;
  pages: number;
}

export interface GetAllReportsResponse {
  reports: AdminReportItem[];
  pagination: ReportsPagination;
}

export interface GetSellerReportsResponse {
  reports: AdminReportItem[];
  stats: {
    total: number;
    pending: number;
    accepted: number;
    rejected: number;
    byCategory: Partial<Record<ReportCategory, number>>;
  };
}

export interface AdminReportsFilters {
  status?: ReportStatus;
  priority?: ReportPriority;
  category?: ReportCategory;
  reportedUserId?: string;
  minCredibility?: number;
  page?: number;
  limit?: number;
}