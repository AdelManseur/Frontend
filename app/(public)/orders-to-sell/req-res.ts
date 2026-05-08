import { API_BASE_URL } from "@/lib/api-config";
import type { SellerOrdersResponse, SellerOrderStatus } from "./interfaces";

const API_BASE = API_BASE_URL.endsWith("/api") ? API_BASE_URL : `${API_BASE_URL}/api`;

type GetSellerOrdersParams = {
  status?: SellerOrderStatus;
  page?: number;
  limit?: number;
};

export async function getSellerOrders(
  params: GetSellerOrdersParams = {}
): Promise<SellerOrdersResponse> {
  const query = new URLSearchParams();
  if (params.status) query.set("status", params.status);
  if (params.page) query.set("page", String(params.page));
  if (params.limit) query.set("limit", String(params.limit));

  const queryStr = query.toString() ? `?${query}` : "";

  // Fetch both types of orders
  const [simpleRes, regularRes] = await Promise.all([
    fetch(`${API_BASE}/simpleorders/seller${queryStr}`, { method: "GET", credentials: "include" }),
    fetch(`${API_BASE}/orders/seller${queryStr}`, { method: "GET", credentials: "include" }),
  ]);

  const simpleData = await simpleRes.json().catch(() => null);
  const regularData = await regularRes.json().catch(() => null);

  const simpleOrders = Array.isArray(simpleData?.orders) ? simpleData.orders : [];
  const regularOrders = Array.isArray(regularData?.orders) ? regularData.orders.map((o: any) => ({
    ...o,
    price: o.totalAmount ?? o.price,
    isRegular: true
  })) : [];

  // Merge and sort by date
  const allOrders = [...simpleOrders, ...regularOrders].sort((a, b) => 
    new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  const totalCount = (simpleData?.pagination?.totalCount ?? 0) + (regularData?.pagination?.totalCount ?? 0);
  const totalPages = Math.max(simpleData?.pagination?.totalPages ?? 1, regularData?.pagination?.totalPages ?? 1);

  return {
    orders: allOrders,
    pagination: {
      currentPage: Number(params.page ?? 1),
      totalPages,
      totalCount,
    },
  };
}