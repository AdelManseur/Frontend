export type SimpleOrderStatus =
  | "pending"
  | "active"
  | "delivered"
  | "completed"
  | "cancelled"
  | "in_revision";

export interface OrderUser {
  _id: string;
  name: string;
  email?: string;
  pfp?: string;
}

export interface OrderGig {
  _id: string;
  title: string;
  images: string[];
  price: number;
  category: string;
}

export interface OrderRequirement {
  question: string;
  answer: string;
}

export interface OrderDeliverable {
  files?: string[];
  description?: string;
  deliveredAt?: string;
}

export interface OrderRevisionRequest {
  description?: string;
  requestedAt?: string;
  status?: string;
}

export interface OrderPayment {
  amount: number;
  currency: string;
  status: "pending" | "paid" | "refunded" | string;
  paidAt?: string;
}

export interface OrderTimeline {
  ordered?: string;
  started?: string;
  delivered?: string;
  completed?: string;
  cancelled?: string;
}

export interface OrderReview {
  rating: number;
  comment?: string;
  reviewedAt?: string;
}

export interface AddReviewPayload {
  rating: number;
  comment?: string;
}

export interface AddReviewResponse {
  message: string;
  review: OrderReview;
}

export interface BuyerExpandedOrder {
  _id: string;
  gig: OrderGig;
  buyer: OrderUser;
  seller: OrderUser;
  price: number;
  deliveryTime: number;
  revisions: number;
  status: SimpleOrderStatus;
  requirements: OrderRequirement[];
  deliverables: OrderDeliverable[];
  revisionRequests: OrderRevisionRequest[];
  payment: OrderPayment;
  timeline: OrderTimeline;
  expectedDelivery: string;
  review: OrderReview | null;
  createdAt: string;
  updatedAt: string;
  accessLevel: string;
}

export interface GetBuyerOrderByIdResponse {
  order: BuyerExpandedOrder;
}

export interface RevisionRequest {
  description: string;
  requestedAt?: string;
  status?: string;
}

export interface RequestRevisionPayload {
  description: string;
}

export interface RequestRevisionResponse {
  message: string;
  revisionRequest: RevisionRequest;
}

export type ReportCategory =
  | "non_delivery"
  | "fake_service"
  | "poor_quality"
  | "scam"
  | "overcharge"
  | "harassment"
  | "other";

export type ReportSeverity = "low" | "medium" | "high" | "critical" | string;

export interface ReportEvidenceAdditionalInfo {
  orderCompletedDate?: string;
  lastSellerResponse?: string;
  [key: string]: unknown;
}

export interface ReportEvidencePayload {
  screenshots?: string[];
  messages?: string[];
  files?: string[];
  additionalInfo?: ReportEvidenceAdditionalInfo;
}

export interface SubmitOrderReportPayload {
  reportedUserId: string;
  orderId: string;
  category: ReportCategory;
  severity: ReportSeverity;
  description: string;
  evidence?: ReportEvidencePayload;
}

export interface ReportedUserSummary {
  _id: string;
  name: string;
  email?: string;
  username?: string;
}

export interface ReportedOrderSummary {
  _id: string;
  price?: number;
  status?: string;
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

export interface SubmittedOrderReport {
  _id: string;
  reporter?: string;
  reportedUser?: ReportedUserSummary;
  order?: ReportedOrderSummary;
  category: ReportCategory;
  severity: ReportSeverity;
  description: string;
  evidence?: ReportEvidencePayload;
  reporterCredibility?: ReporterCredibility;
  status?: string;
  priority?: string;
  createdAt?: string;
}

export interface SubmitOrderReportResponse {
  message: string;
  report: SubmittedOrderReport;
  credibilityScore?: number;
  priority?: string;
  uploadedScreenshots?: number;
}

export interface SubmitOrderReportError {
  message?: string;
  error?: string;
  reason?: string;
  existingReport?: string;
  requirements?: Record<string, string>;
}