import type { GetSellerReportDetailsResponse } from "./interfaces";

type ErrorResponse = {
  message?: string;
  error?: string;
};

const RAW_BASE = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:5001";
const API_BASE = RAW_BASE.endsWith("/api") ? RAW_BASE : `${RAW_BASE}/api`;

export async function getSellerReportDetails(reportId: string): Promise<GetSellerReportDetailsResponse> {
  const url = `${API_BASE}/order/${encodeURIComponent(reportId)}`;

  const res = await fetch(url, {
    method: "GET",
    credentials: "include",
  });

  const data = (await res.json().catch(() => null)) as
    | GetSellerReportDetailsResponse
    | ErrorResponse
    | null;

  if (!res.ok) {
    throw new Error(data?.message || data?.error || `Failed to fetch report (${res.status})`);
  }

  if (!data?.report) {
    throw new Error("Report not found in response.");
  }

  return data;
}