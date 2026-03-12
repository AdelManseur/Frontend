export interface PublicUser {
  _id: string;
  name: string;
  email?: string;
  pfp?: string;
}

export interface ChatMessage {
  _id: string;
  from: string;
  to: string;
  content: string;
  createdAt: string;
  read?: boolean;
}

export interface ChatSlot {
  user: PublicUser;
  lastMessage: ChatMessage;
}

export interface GetMessagesResponse {
  messages: ChatMessage[];
}

export interface ChatUser {
  _id: string;
  name: string;
  email?: string;
  pfp?: string;
}

export interface ChatThread {
  _id: string;
  participants: ChatUser[];
  messages?: ChatMessage[];
  lastMessage?: ChatMessage | null;
  updatedAt?: string;
  createdAt?: string;
}

export interface ChatListResponse {
  message?: string;
  data?: ChatThread[];
  chats?: ChatThread[];
}

export interface ChatMessagesResponse {
  message?: string;
  data?: ChatMessage[];
  messages?: ChatMessage[];
}

export interface SendMessagePayload {
  chatId: string;
  to: string;
  content: string;
}

export interface SendMessageResponse {
  message: string;
  data?: ChatMessage;
}