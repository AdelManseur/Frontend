export type FraudCaseStatus =
	| "pending_review"
	| "confirmed_fraud"
	| "false_positive"
	| "monitoring"
	| string;

export interface FraudCaseUser {
	_id: string;
	name?: string;
	email?: string;
	username?: string;
	createdAt?: string;
}

export interface FraudCaseFlag {
	category?: string;
	severity?: "low" | "medium" | "high" | "critical" | string;
	description?: string;
	detectedAt?: string;
}

export interface FraudCaseRiskAssessment {
	immediateRisk?: boolean;
	recommendedAction?: string;
}

export interface FraudCaseItem {
	_id: string;
	user?: FraudCaseUser;
	fraudScore: number;
	status: FraudCaseStatus;
	aiAnalysis?: {
		model?: string;
		confidence?: number;
		detectedAt?: string;
	};
	flags?: FraudCaseFlag[];
	riskAssessment?: FraudCaseRiskAssessment;
	resolved?: boolean;
	createdAt?: string;
}

export interface FraudCasesPagination {
	page: number;
	limit: number;
	total: number;
	pages: number;
}

export interface FraudCasesFilters {
	status?: FraudCaseStatus;
	minScore?: number;
	maxScore?: number;
	resolved?: boolean;
	immediateRisk?: boolean;
	page?: number;
	limit?: number;
}

export interface GetFraudCasesResponse {
	fraudUsers?: FraudCaseItem[];
	pagination?: FraudCasesPagination;
	message?: string;
	error?: string;
}

export interface FraudCasesListPayload {
	fraudUsers: FraudCaseItem[];
	pagination: FraudCasesPagination;
}

export interface FraudTopCategory {
	_id: string;
	count: number;
}

export interface FraudStatistics {
	totalCases: number;
	pendingReview: number;
	confirmedFraud: number;
	falsePositives: number;
	immediateRiskCases: number;
	averageFraudScore: number;
	recentCases: number;
	topCategories: FraudTopCategory[];
}

export interface GetFraudStatisticsResponse {
	statistics?: FraudStatistics;
	message?: string;
	error?: string;
}
