import type {
  ApiErrorResponse,
  CreateGigRequest,
  CreateGigSuccessResponse,
} from "./interfaces";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:5000";
const CREATE_GIG_PATH = "/api/simple-gigs";

export async function createGig(payload: CreateGigRequest): Promise<CreateGigSuccessResponse> {
  const response = await fetch(`${API_BASE_URL}${CREATE_GIG_PATH}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({
      title: payload.metadata.title,
      description: payload.metadata.description,
      category: payload.metadata.category,
      tags: payload.metadata.tags ?? [],
      price: payload.metadata.price,
      deliveryTime: payload.metadata.deliveryTime, // must match backend
      revisions: payload.metadata.revisions ?? 0,
      features: payload.metadata.features ?? [],
      images: payload.metadata.images ?? [], // URLs only
    }),
  });

  const raw = await response.text();
  const isJson = (response.headers.get("content-type") || "").includes("application/json");
  const data = (isJson && raw ? JSON.parse(raw) : null) as
    | CreateGigSuccessResponse
    | ApiErrorResponse
    | null;

  if (!response.ok) throw new Error(data?.message || `Create gig failed (${response.status})`);
  if (!data) throw new Error("Invalid server response.");
  return data as CreateGigSuccessResponse;
}