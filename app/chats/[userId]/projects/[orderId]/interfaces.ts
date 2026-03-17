export interface SimpleOrderMessage {
  _id: string;
  from: string;
  to: string;
  role?: "buyer" | "seller" | string;
  content: string;
  createdAt: string;
  read: boolean;
  orderId?: string;
}

export interface GetSimpleOrderMessageResponse {
  message: any;
}