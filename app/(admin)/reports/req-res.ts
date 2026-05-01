import type {
  AdminReportsFilters,
  GetAllReportsResponse,
  GetSellerReportsResponse,
} from "./interfaces";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:5001";

function buildQuery(params: Record<string, string | number | undefined>) {
  const searchParams = new URLSearchParams();

  for (const [key, value] of Object.entries(params)) {
    if (value === undefined || value === "") continue;
    searchParams.set(key, String(value));
  }

  const query = searchParams.toString();
  return query ? `?${query}` : "";
}

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

export async function getAllReports(filters: AdminReportsFilters): Promise<GetAllReportsResponse> {
  const url = `${API_BASE_URL}/api/reports/all${buildQuery(filters as Record<string, string | number | undefined>)}`;

  const response = await fetch(url, {
    method: "GET",
    credentials: "include",
  });

  const data = await parseJsonResponse<GetAllReportsResponse>(response);

  if (!response.ok) {
    throw new Error(getErrorMessage(data as { message?: string; error?: string } | null, response.status));
  }

  if (!data?.reports || !data?.pagination) {
    throw new Error("Reports response missing expected data.");
  }

  return data;
}

export async function getSellerReports(sellerId: string): Promise<GetSellerReportsResponse> {
  const url = `${API_BASE_URL}/api/reports/seller/${encodeURIComponent(sellerId)}`;

  const response = await fetch(url, {
    method: "GET",
    credentials: "include",
  });

  const data = await parseJsonResponse<GetSellerReportsResponse>(response);

  if (!response.ok) {
    throw new Error(getErrorMessage(data as { message?: string; error?: string } | null, response.status));
  }

  if (!data?.reports || !data?.stats) {
    throw new Error("Seller reports response missing expected data.");
  }

  return data;
}