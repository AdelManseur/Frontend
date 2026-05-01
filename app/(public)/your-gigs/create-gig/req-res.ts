export interface CreateGigRequest {
  metadata: {
    title: string;
    description: string;
    category: string;
    subcategory?: string;
    tags?: string[];
    price: any; 
    deliveryTime?: number;
    revisions?: number | string;
    features?: string[];
    images?: string[];
    faqs?: { question: string; answer: string }[];
    requirements?: string[];
  };
}

export interface CreateGigSuccessResponse {
  id: string;
  message: string;
}

export interface ApiErrorResponse {
  message: string;
}

// Update this to match your actual backend port (usually 5000 based on your setup)
const API_BASE_URL = /*process.env.NEXT_PUBLIC_API_URL || */"http://localhost:3000";
const CREATE_GIG_PATH = "/api/gigs";

export async function createGig(payload: CreateGigRequest): Promise<CreateGigSuccessResponse> {
  // Retrieve the auth token. Adjust this depending on how you store your tokens 
  // (e.g., localStorage, js-cookie, NextAuth session)
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;

  try {
    const response = await fetch(`${API_BASE_URL}${CREATE_GIG_PATH}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        // The backend req.user._id validation requires this token
        "Authorization": `Bearer ${token}` 
      },
      // We send payload.metadata directly so the backend receives 
      // req.body.title, req.body.price, etc., instead of req.body.metadata.title
      body: JSON.stringify(payload.metadata), 
      credentials: "include" // Include cookies for authentication if your backend uses them
    });

    if (!response.ok) {
      // Attempt to parse the backend's error message
      const errorData: ApiErrorResponse = await response.json().catch(() => ({ 
        message: "An unknown error occurred while creating the gig." 
      }));
      throw new Error(errorData.message);
    }

    const data = await response.json();
    
    return {
      id: data.gig._id, // Maps to the MongoDB _id returned by your controller
      message: data.message
    };
    
  } catch (error: any) {
    console.error("Error creating gig:", error);
    throw new Error(error.message || "Network error occurred");
  }
}