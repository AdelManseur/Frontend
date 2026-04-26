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

export type ReviewDecision = "pending" | "valid" | "invalid" | "needs_investigation";

export type ReviewActionType =
  | "warning_issued"
  | "seller_flagged"
  | "seller_suspended"
  | "no_action"
  | "refund_issued";

export interface ReportPersonDetails {
  _id?: string;
  name?: string;
  email?: string;
  username?: string;
  createdAt?: string;
  verifiedEmail?: boolean;
}

export interface ReportOrderDetails {
  _id?: string;
  buyer?: string;
  seller?: string;
  price?: number;
  status?: string;
  deliveryTime?: number;
  createdAt?: string;
}

export interface ReportEvidenceDetails {
  screenshots?: string[];
  messages?: string[];
  files?: string[];
  additionalInfo?: Record<string, unknown>;
}

export interface ReportCredibilityDetails {
  fraudScore?: number;
  totalOrders?: number;
  accountAge?: number;
  verifiedAccount?: boolean;
  credibilityScore?: number;
  priorReports?: number;
  priorReportsAccepted?: number;
}

export interface ReportDecisionDetails {
  reviewedBy?: {
    _id?: string;
    name?: string;
    email?: string;
  };
  reviewedAt?: string;
  decision?: string;
  notes?: string;
  actionTaken?: {
    type?: ReviewActionType | string;
    appliedAt?: string;
    details?: string;
  };
}

export interface ReportImpactDetails {
  similarReports?: number;
  [key: string]: unknown;
}

export interface ReportDetails {
  _id: string;
  reporter?: ReportPersonDetails;
  reportedUser?: ReportPersonDetails;
  order?: ReportOrderDetails;
  category: ReportCategory;
  severity?: "low" | "medium" | "high" | "critical" | string;
  description?: string;
  evidence?: ReportEvidenceDetails;
  reporterCredibility?: ReportCredibilityDetails;
  status?: ReportStatus | string;
  priority?: ReportPriority | string;
  review?: ReportDecisionDetails;
  impact?: ReportImpactDetails;
  createdAt?: string;
  updatedAt?: string;
}

export interface GetReportDetailsResponse {
  report: ReportDetails;
}

export interface ReviewReportPayload {
  decision: ReviewDecision;
  notes: string;
  actionTaken: {
    type: ReviewActionType;
    details: string;
  };
}

export interface ReviewReportResponse {
  message: string;
  report: {
    _id: string;
    status?: string;
    review?: ReportDecisionDetails;
    updatedAt?: string;
  };
}