import { API_BASE_URL } from "@/lib/api-config";
import type {
  CompletedOrderItem,
  CompletedOrdersResponse,
  EarningsSummary,
  EarningsSummaryResponse,
} from "./interfaces";

export async function getEarningsSummary(token: string): Promise<EarningsSummary> {
  const res = await fetch(API_BASE_URL + "/api/user/data/earnings/summary", {
    method: "GET",
    headers: { Authorization: `Bearer ${token}` },
    cache: "no-store",
  });

  const json = (await res.json().catch(() => null)) as EarningsSummaryResponse | null;
  if (!res.ok) throw new Error(json?.message || "Failed to fetch earnings summary.");

  const s = json?.summary || json?.data?.summary;
  return {
    lastMonth: Number(s?.lastMonth ?? json?.data?.lastMonth ?? json?.lastMonth ?? 0),
    lastYear: Number(s?.lastYear ?? json?.data?.lastYear ?? json?.lastYear ?? 0),
    totalOrdersEver: Number(
      s?.totalOrdersEver ?? json?.data?.totalOrdersEver ?? json?.totalOrdersEver ?? 0
    ),
  };
}

export async function getCompletedOrders(
  token: string,
  page = 1,
  limit = 20
): Promise<{ orders: CompletedOrderItem[]; total: number; page: number; limit: number }> {
  const params = new URLSearchParams({
    status: "completed",
    page: String(page),
    limit: String(limit),
  });

  const res = await fetch(API_BASE_URL + `/api/user/data/orders?${params.toString()}`, {
    method: "GET",
    headers: { Authorization: `Bearer ${token}` },
    cache: "no-store",
  });

  const json = (await res.json().catch(() => null)) as CompletedOrdersResponse | null;
  if (!res.ok) throw new Error(json?.message || "Failed to fetch completed orders.");

  const orders = json?.orders ?? json?.data?.orders ?? [];
  return {
    orders,
    total: Number(json?.total ?? orders.length),
    page: Number(json?.page ?? page),
    limit: Number(json?.limit ?? limit),
  };
}