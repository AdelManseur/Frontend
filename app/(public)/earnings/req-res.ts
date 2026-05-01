import type {
  CompletedOrderItem,
  CompletedOrdersResponse,
  EarningsSummary,
  EarningsSummaryResponse,
} from "./interfaces";

const RAW_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api";

function buildApiUrl(path: string): string {
  const base = RAW_BASE.replace(/\/+$/, "");
  const p = path.startsWith("/") ? path : `/${path}`;

  // avoid /api/api duplication
  if (base.endsWith("/api") && p.startsWith("/api/")) {
    return `${base}${p.slice(4)}`;
  }

  return `${base}${p}`;
}

export async function getEarningsSummary(token: string): Promise<EarningsSummary> {
  const res = await fetch(RAW_BASE + "/api/user/data/earnings/summary", {
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

  const res = await fetch(RAW_BASE + `/api/user/data/orders?${params.toString()}`, {
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