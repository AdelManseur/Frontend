// filepath: c:\Users\Lenovo\Downloads\JobMe-main\Frontend\frontend\app\super-admin\interfaces.ts

export type AdminTab = "fraud" | "analytics";

export interface FraudCheckItem {
  _id: string;
  userId: string;
  reason: string;
  riskScore: number; // 0..100
  status: "pending" | "reviewed" | "blocked";
  createdAt: string;
}

export interface AnalyticsSummary {
  period: string;
  totalUsers: number;
  totalGigs: number;
  totalOrders: number;
  flaggedUsers: number;
  revenue: number;
}

export interface FraudChecksResponse {
  data: FraudCheckItem[];
}

export interface AnalyticsResponse {
  data: AnalyticsSummary;
}