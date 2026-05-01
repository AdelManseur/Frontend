import type {
	GetFraudCaseDetailsResponse,
	ResolveFraudCasePayload,
	ResolveFraudCaseResponse,
	ReviewFraudCasePayload,
	ReviewFraudCaseResponse,
} from "./interfaces";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:5001";

async function parseJson<T>(response: Response): Promise<T | null> {
	const raw = await response.text();
	if (!raw) return null;

	try {
		return JSON.parse(raw) as T;
	} catch {
		return null;
	}
}

export async function getFraudCaseDetails(fraudCaseId: string): Promise<GetFraudCaseDetailsResponse> {
	const response = await fetch(`${API_BASE_URL}/api/fraud/cases/${encodeURIComponent(fraudCaseId)}`, {
		method: "GET",
		credentials: "include",
		cache: "no-store",
	});

	const data = await parseJson<GetFraudCaseDetailsResponse>(response);

	if (!response.ok) {
		throw new Error(data?.message || data?.error || `Failed to fetch fraud case details (${response.status})`);
	}

	if (!data?.fraudCase) {
		throw new Error("Fraud case details missing in response.");
	}

	return data;
}

export async function reviewFraudCase(
	fraudCaseId: string,
	payload: ReviewFraudCasePayload
): Promise<ReviewFraudCaseResponse> {
	const response = await fetch(`${API_BASE_URL}/api/fraud/cases/${encodeURIComponent(fraudCaseId)}/review`, {
		method: "PUT",
		credentials: "include",
		headers: {
			"Content-Type": "application/json",
		},
		body: JSON.stringify(payload),
	});

	const data = await parseJson<ReviewFraudCaseResponse & { message?: string; error?: string }>(response);

	if (!response.ok) {
		throw new Error(data?.message || data?.error || `Failed to review fraud case (${response.status})`);
	}

	if (!data?.fraudCase) {
		throw new Error("Review response missing fraud case data.");
	}

	return data;
}

export async function resolveFraudCase(
	fraudCaseId: string,
	payload: ResolveFraudCasePayload
): Promise<ResolveFraudCaseResponse> {
	const response = await fetch(`${API_BASE_URL}/api/fraud/cases/${encodeURIComponent(fraudCaseId)}/resolve`, {
		method: "PUT",
		credentials: "include",
		headers: {
			"Content-Type": "application/json",
		},
		body: JSON.stringify(payload),
	});

	const data = await parseJson<ResolveFraudCaseResponse & { message?: string; error?: string }>(response);

	if (!response.ok) {
		throw new Error(data?.message || data?.error || `Failed to resolve fraud case (${response.status})`);
	}

	if (!data?.fraudCase) {
		throw new Error("Resolve response missing fraud case data.");
	}

	return data;
}
