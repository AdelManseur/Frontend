export type ReportCategory =
  | "non_delivery"
  | "fake_service"
  | "poor_quality"
  | "scam"
  | "overcharge"
  | "harassment"
  | "other";

export interface ReportUser {
  _id?: string;
  name?: string;
  email?: string;
  username?: string;
  createdAt?: string;
  verifiedEmail?: boolean;
}

export interface ReportOrder {
  _id?: string;
  buyer?: string;
  seller?: string;
  price?: number;
  status?: string;
  deliveryTime?: number;
  createdAt?: string;
}

export interface ReportEvidence {
  screenshots?: string[];
  messages?: string[];
  additionalInfo?: Record<string, unknown>;
}

export interface ReporterCredibility {
  fraudScore?: number;
  totalOrders?: number;
  accountAge?: number;
  verifiedAccount?: boolean;
  credibilityScore?: number;
  priorReports?: number;
  priorReportsAccepted?: number;
}

export interface ReportReview {
  decision?: string;
  notes?: string;
}

export interface ReportImpact {
  similarReports?: number;
}

export interface SellerReportDetails {
  _id: string;
  reporter?: ReportUser;
  reportedUser?: ReportUser;
  order?: ReportOrder;
  category: ReportCategory;
  severity?: "low" | "medium" | "high" | "critical" | string;
  description?: string;
  evidence?: ReportEvidence;
  reporterCredibility?: ReporterCredibility;
  status?: string;
  priority?: string;
  review?: ReportReview;
  impact?: ReportImpact;
  createdAt?: string;
  updatedAt?: string;
}

export interface GetSellerReportDetailsResponse {
  report: SellerReportDetails;
}