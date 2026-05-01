import type {
	FraudCasesFilters,
	FraudCasesListPayload,
	FraudStatistics,
	GetFraudCasesResponse,
	GetFraudStatisticsResponse,
} from "./interfaces";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:5001";

function buildQuery(filters: FraudCasesFilters) {
	const params = new URLSearchParams();

	if (filters.status) params.set("status", String(filters.status));
	if (typeof filters.minScore === "number") params.set("minScore", String(filters.minScore));
	if (typeof filters.maxScore === "number") params.set("maxScore", String(filters.maxScore));
	if (typeof filters.resolved === "boolean") params.set("resolved", String(filters.resolved));
	if (typeof filters.immediateRisk === "boolean") params.set("immediateRisk", String(filters.immediateRisk));
	params.set("page", String(filters.page ?? 1));
	params.set("limit", String(filters.limit ?? 20));

	const query = params.toString();
	return query ? `?${query}` : "";
}

async function parseJson<T>(response: Response): Promise<T | null> {
	const raw = await response.text();
	if (!raw) return null;

	try {
		return JSON.parse(raw) as T;
	} catch {
		return null;
	}
}

export async function getFraudCases(
	filters: FraudCasesFilters = {}
): Promise<FraudCasesListPayload> {
	const query = buildQuery(filters);
	const response = await fetch(`${API_BASE_URL}/api/fraud/cases${query}`, {
		method: "GET",
		credentials: "include",
		cache: "no-store",
	});

	const data = await parseJson<GetFraudCasesResponse>(response);

	if (!response.ok) {
		throw new Error(data?.message || data?.error || `Failed to fetch fraud cases (${response.status})`);
	}

	return {
		fraudUsers: data?.fraudUsers ?? [],
		pagination: data?.pagination ?? {
			page: filters.page ?? 1,
			limit: filters.limit ?? 20,
			total: 0,
			pages: 1,
		},
	};
}

export async function getFraudStatistics(): Promise<FraudStatistics> {
	const response = await fetch(`${API_BASE_URL}/api/fraud/statistics`, {
		method: "GET",
		credentials: "include",
		cache: "no-store",
	});

	const data = await parseJson<GetFraudStatisticsResponse>(response);

	if (!response.ok) {
		throw new Error(data?.message || data?.error || `Failed to fetch fraud statistics (${response.status})`);
	}

	return (
		data?.statistics ?? {
			totalCases: 0,
			pendingReview: 0,
			confirmedFraud: 0,
			falsePositives: 0,
			immediateRiskCases: 0,
			averageFraudScore: 0,
			recentCases: 0,
			topCategories: [],
		}
	);
}
