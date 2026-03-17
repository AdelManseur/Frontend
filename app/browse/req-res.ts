import type { GetCategoriesResponse, GetSimpleGigsResponse } from "./interfaces";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:5000";

type GetSimpleGigsParams = {
  search?: string;
  category?: string;
  page?: number;
  limit?: number;
};

export async function getSimpleGigs(params: GetSimpleGigsParams = {}): Promise<GetSimpleGigsResponse> {
  const query = new URLSearchParams();

  if (params.search?.trim()) query.set("search", params.search.trim());
  if (params.category?.trim()) query.set("category", params.category.trim());
  query.set("page", String(params.page ?? 1));
  query.set("limit", String(params.limit ?? 50));

  const response = await fetch(`${API_BASE_URL}/api/simple-gigs?${query.toString()}`, {
    method: "GET",
    credentials: "include",
  });

  const raw = await response.text();
  const isJson = (response.headers.get("content-type") || "").includes("application/json");
  const data = isJson && raw ? JSON.parse(raw) : null;

  if (!response.ok) {
    throw new Error(data?.message || `Failed to load gigs (${response.status})`);
  }

  return data as GetSimpleGigsResponse;
}

export async function getGigCategories(): Promise<string[]> {
  const response = await fetch(`${API_BASE_URL}/api/simple-gigs/categories`, {
    method: "GET",
    credentials: "include",
  });

  const raw = await response.text();
  const isJson = (response.headers.get("content-type") || "").includes("application/json");
  const data = isJson && raw ? (JSON.parse(raw) as GetCategoriesResponse) : null;

  if (!response.ok) return [];
  return data?.categories ?? [];
}