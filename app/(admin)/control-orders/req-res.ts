import type { GetOrdersResponse, OrdersListPayload, OrdersQuery } from "./interfaces";

const RAW_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api";

export async function getOrdersList(
  token: string,
  query: OrdersQuery = {}
): Promise<OrdersListPayload> {
  if (!token) throw new Error("Missing admin token.");

  const params = new URLSearchParams();
  if (query.status?.trim()) params.set("status", query.status.trim());
  if (typeof query.minPrice === "number") params.set("minPrice", String(query.minPrice));
  if (typeof query.maxPrice === "number") params.set("maxPrice", String(query.maxPrice));
  params.set("page", String(query.page ?? 1));
  params.set("limit", String(query.limit ?? 20));

  const res = await fetch(RAW_BASE + `/api/admin/data/orders?${params.toString()}`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    cache: "no-store",
  });

  const json = (await res.json().catch(() => null)) as GetOrdersResponse | null;

  if (!res.ok) {
    throw new Error(json?.message || "Failed to fetch orders.");
  }

  const orders = json?.orders ?? json?.data?.orders ?? [];
  console.log("Fetched orders:", orders);
  const total = json?.total ?? json?.data?.total ?? orders.length;
  const page = json?.page ?? json?.data?.page ?? query.page ?? 1;
  const limit = json?.limit ?? json?.data?.limit ?? query.limit ?? 20;

  return { orders, total, page, limit };
}