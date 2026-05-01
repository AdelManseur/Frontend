import type { GetBuyerReportDetailsResponse } from "./interfaces";

const RAW_BASE = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:5001";
const API_BASE = RAW_BASE.endsWith("/api") ? RAW_BASE : `${RAW_BASE}/api`;

export async function getBuyerReportDetails(reportId: string): Promise<GetBuyerReportDetailsResponse> {
  const url = `${API_BASE}/reports/order/${encodeURIComponent(reportId)}`;

  const res = await fetch(url, {
    method: "GET",
    credentials: "include",
  });

  const data = (await res.json().catch(() => null)) as GetBuyerReportDetailsResponse | null;

  if (!res.ok) {
    throw new Error((data as any)?.message || (data as any)?.error || `Failed to fetch report (${res.status})`);
  }

  if (!data?.report) {
    throw new Error("Report not found in response.");
  }

  return data;
}