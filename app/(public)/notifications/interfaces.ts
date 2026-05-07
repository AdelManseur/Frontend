export interface Notification {
  _id: string;
  type: 'order_placed' | 'order_status' | 'order_delivered' | 'order_completed' | 'announcement';
  recipient: string | null;
  title: string;
  body: string;
  link?: string;
  read: boolean;
  createdAt: string;
  updatedAt: string;
}
