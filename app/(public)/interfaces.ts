export interface UserAddress {
  street?: string;
  city?: string;
  postalCode?: string;
  country?: string;
}

export interface UserProfile {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  bday?: string;
  pfp?: string;
  address?: UserAddress;
  createdAt?: string;
  updatedAt?: string;
  isSeller?: boolean;
  idVerified?: boolean;
  fieldsOfInterest?: string[];
}

export interface MeSuccessResponse {
  logged: true;
  user: UserProfile;
}

export interface MeErrorResponse {
  logged: false;
  message?: string;
}

export type MeResponse = MeSuccessResponse | MeErrorResponse;

export type AIRequestStep = "intent" | "timeline" | "budget" | "extras" | "compose";

export interface AIRequestDraft {
  intent: string;
  timeline: string;
  budget: string;
  extras: string;
  composed: string;
}

export interface AIRequestStepPayload {
  from: string;
  step: AIRequestStep;
  userInput: string;
  gigContext: {
    gigId: string;
    gigTitle: string;
    sellerName: string;
    requirements: string[]; // from BuyerGigDetails.requirements
  };
  previousDrafts: Partial<AIRequestDraft>;
}

export interface AIRequestStepResponse {
  step: AIRequestStep;
  aiReply: string;  // conversational message shown as AI bubble
  draft: string;    // the paragraph / composed message
}