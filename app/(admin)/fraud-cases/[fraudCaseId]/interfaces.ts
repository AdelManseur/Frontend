export type FraudCaseSeverity = "low" | "medium" | "high" | "critical" | string;

export interface FraudCaseDetailUser {
	_id?: string;
	name?: string;
	email?: string;
	username?: string;
	createdAt?: string;
	verifiedEmail?: boolean;
	verifiedPhone?: boolean;
}

export interface FraudCaseDetailFlag {
	category?: string;
	severity?: FraudCaseSeverity;
	description?: string;
	evidence?: Record<string, unknown>;
	detectedAt?: string;
}

export interface FraudCaseDetailTriggeringEvent {
	type?: string;
	referenceId?: string;
	details?: Record<string, unknown>;
	timestamp?: string;
}

export interface FraudCaseDetailUserSnapshot {
	accountAge?: number;
	totalOrders?: number;
	cancelledOrders?: number;
	completedOrders?: number;
	averageOrderValue?: number;
	totalSpent?: number;
	totalEarned?: number;
	verificationStatus?: {
		email?: boolean;
		phone?: boolean;
		identity?: boolean;
	};
	recentActivity?: {
		ordersLast24h?: number;
		ordersLast7days?: number;
		messagesLast24h?: number;
	};
}

export interface FraudCaseDetailPattern {
	pattern?: string;
	occurrences?: number;
	severity?: FraudCaseSeverity;
	examples?: unknown[];
}

export interface FraudCaseDetailPriorFlag {
	flaggedAt?: string;
	reason?: string;
	resolved?: boolean;
	resolution?: string;
}

export interface FraudCaseDetails {
	_id: string;
	user?: FraudCaseDetailUser;
	fraudScore?: number;
	status?: string;
	aiAnalysis?: {
		model?: string;
		confidence?: number;
		detectedAt?: string;
		analysisVersion?: string;
	};
	flags?: FraudCaseDetailFlag[];
	triggeringEvent?: FraudCaseDetailTriggeringEvent;
	userSnapshot?: FraudCaseDetailUserSnapshot;
	suspiciousPatterns?: FraudCaseDetailPattern[];
	review?: {
		reviewedBy?: {
			_id?: string;
			name?: string;
			email?: string;
		};
		reviewedAt?: string;
		decision?: string;
		notes?: string;
		actionTaken?: {
			type?: string;
			appliedAt?: string;
			appliedBy?: string;
			details?: string;
		};
	};
	priorFlags?: FraudCaseDetailPriorFlag[];
	riskAssessment?: {
		immediateRisk?: boolean;
		potentialLoss?: number;
		affectedUsers?: number;
		recommendedAction?: string;
	};
	resolved?: boolean;
	resolvedAt?: string;
	resolution?: {
		outcome?: string;
		details?: string;
		resolvedBy?: {
			_id?: string;
			name?: string;
		};
	};
	createdAt?: string;
	updatedAt?: string;
}

export interface GetFraudCaseDetailsResponse {
	fraudCase?: FraudCaseDetails;
	message?: string;
	error?: string;
}

export type FraudCaseReviewDecision = "pending" | "confirmed" | "dismissed" | "needs_more_info";

export type FraudCaseReviewActionType =
	| "account_suspended"
	| "account_banned"
	| "funds_held"
	| "warning_issued"
	| "no_action";

export interface ReviewFraudCasePayload {
	decision: FraudCaseReviewDecision;
	notes: string;
	actionTaken: {
		type: FraudCaseReviewActionType;
		details: string;
	};
}

export interface ReviewFraudCaseResponse {
	message: string;
	fraudCase: {
		_id: string;
		status?: string;
		review?: FraudCaseDetails["review"];
		updatedAt?: string;
	};
}

export type ResolveFraudCaseOutcome = "fraud_confirmed" | "false_alarm" | "preventive_action_taken";

export interface ResolveFraudCasePayload {
	outcome: ResolveFraudCaseOutcome;
	details: string;
}

export interface ResolveFraudCaseResponse {
	message: string;
	fraudCase: {
		_id: string;
		resolved?: boolean;
		resolvedAt?: string;
		resolution?: FraudCaseDetails["resolution"];
		updatedAt?: string;
	};
}
