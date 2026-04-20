export interface ChatMessage {
  _id?: string;
  from: string;
  to: string;
  content: string;
  createdAt?: string;
  read?: boolean;
}

export interface SendMessagePayload {
  from: string;
  to: string;
  content: string;
}

export interface SendMessageResponse {
  message?: string;
  data?: ChatMessage;
}