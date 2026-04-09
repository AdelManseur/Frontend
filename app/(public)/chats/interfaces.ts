export interface PublicUserLite {
  _id: string;
  name?: string;
  email?: string;
  pfp?: string;
}

export interface SimpleUserDetails {
  _id: string;
  name: string;
  email?: string;
  phone?: string;
  pfp?: string;
}

export type ConversationRaw =
  | string
  | {
      convId?: string;
      _id?: string;
      id?: string;
      user1Id?: string | PublicUserLite;
      user2Id?: string | PublicUserLite;
      createdAt?: string;
    };

export interface GetConversationsResponse {
  conversations: ConversationRaw[];
}

export interface SellerConversationListItem {
  convId: string;
  otherUser: SimpleUserDetails;
  createdAt?: string;
}