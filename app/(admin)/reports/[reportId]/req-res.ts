import type {
  GetReportDetailsResponse,
  ReviewReportPayload,
  ReviewReportResponse,
} from "./interfaces";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:5001";

async function parseJsonResponse<T>(response: Response): Promise<T | null> {
  const raw = await response.text();
  if (!raw) return null;

  try {
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

function getErrorMessage(data: { message?: string; error?: string } | null, status: number) {
  return data?.message || data?.error || `Request failed (${status})`;
}

export async function getReportDetails(reportId: string): Promise<GetReportDetailsResponse> {
  const response = await fetch(`${API_BASE_URL}/api/reports/${encodeURIComponent(reportId)}`, {
    method: "GET",
    credentials: "include",
  });

  const data = await parseJsonResponse<GetReportDetailsResponse>(response);

  if (!response.ok) {
    throw new Error(getErrorMessage(data as { message?: string; error?: string } | null, response.status));
  }

  if (!data?.report) {
    throw new Error("Report details missing in response.");
  }

  return data;
}

export async function reviewReport(
  reportId: string,
  payload: ReviewReportPayload
): Promise<ReviewReportResponse> {
  const response = await fetch(`${API_BASE_URL}/api/reports/${encodeURIComponent(reportId)}/review`, {
    method: "PUT",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  const data = await parseJsonResponse<ReviewReportResponse>(response);

  if (!response.ok) {
    throw new Error(getErrorMessage(data as { message?: string; error?: string } | null, response.status));
  }

  if (!data?.report) {
    throw new Error("Review response missing report data.");
  }

  return data;
}