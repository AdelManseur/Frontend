import type { GigsApiResponse, SellerGig } from "./interfaces";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:5000";

function normalizeGigs(payload: any): SellerGig[] {
  if (Array.isArray(payload)) return payload as SellerGig[];
  if (Array.isArray(payload?.gigs)) return payload.gigs as SellerGig[];
  if (Array.isArray(payload?.data)) return payload.data as SellerGig[];
  return [];
}

export async function getMyGigs(sellerId: string): Promise<SellerGig[]> {
  if (!sellerId.trim()) throw new Error("Missing sellerId.");

  const response = await fetch(
    `${API_BASE_URL}/api/simple-gigs/seller/${encodeURIComponent(sellerId)}`,
    {
      method: "GET",
      credentials: "include",
    }
  );

  const raw = await response.text();
  const isJson = (response.headers.get("content-type") || "").includes("application/json");
  const data = (isJson && raw ? JSON.parse(raw) : null) as GigsApiResponse | SellerGig[] | null;

  if (!response.ok) {
    throw new Error((data as any)?.message || `Failed to load gigs (${response.status})`);
  }

  return normalizeGigs(data);
}