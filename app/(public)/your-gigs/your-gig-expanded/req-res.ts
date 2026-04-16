import type {
  ApiMessageResponse,
  GigSingleResponse,
  SellerGigExpanded,
  UpdateGigPayload,
} from "./interfaces";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:3000";

function extractGig(payload: GigSingleResponse | SellerGigExpanded): SellerGigExpanded {
  if ("_id" in payload) return payload;
  if (payload.gig) return payload.gig;
  if (payload.data) return payload.data;
  throw new Error("Gig not found in response.");
}

async function parseResponse<T>(response: Response): Promise<T | null> {
  const raw = await response.text();
  const isJson = (response.headers.get("content-type") || "").includes("application/json");
  return (isJson && raw ? JSON.parse(raw) : null) as T | null;
}

export async function getGigById(gigId: string): Promise<SellerGigExpanded> {
  const response = await fetch(`${API_BASE_URL}/api/simple-gigs/${encodeURIComponent(gigId)}`, {
    method: "GET",
    credentials: "include",
  });

  const data = await parseResponse<GigSingleResponse | SellerGigExpanded>(response);

  if (!response.ok) throw new Error((data as any)?.message || `Failed to load gig (${response.status})`);
  if (!data) throw new Error("Invalid server response.");

  return extractGig(data);
}

export async function updateGig(gigId: string, payload: UpdateGigPayload): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/api/simple-gigs/${encodeURIComponent(gigId)}`, {
    method: "PUT",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  const data = await parseResponse<ApiMessageResponse>(response);
  if (!response.ok) throw new Error(data?.message || `Failed to update gig (${response.status})`);
}

export async function updateGigStatus(gigId: string, isActive: boolean): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/api/simple-gigs/${encodeURIComponent(gigId)}/status`, {
    method: "PATCH",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ isActive }),
  });

  if (response.status === 404) {
    // fallback if /status endpoint does not exist
    await updateGig(gigId, {
      title: "",
      description: "",
      category: "",
      tags: [],
      price: 0,
      deliveryTime: 1,
      revisions: 0,
      features: [],
      images: [],
      isActive,
    });
    return;
  }

  const data = await parseResponse<ApiMessageResponse>(response);
  if (!response.ok) throw new Error(data?.message || `Failed to update status (${response.status})`);
}

export async function deleteGig(gigId: string): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/api/simple-gigs/${encodeURIComponent(gigId)}`, {
    method: "DELETE",
    credentials: "include",
  });

  const data = await parseResponse<ApiMessageResponse>(response);
  if (!response.ok) throw new Error(data?.message || `Failed to delete gig (${response.status})`);
}