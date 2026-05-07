import { API_BASE_URL } from "@/lib/api-config";
import { Notification } from "./interfaces";

export const getMyNotifications = async (): Promise<Notification[]> => {
  const response = await fetch(`${API_BASE_URL}/api/notifications`, {
    method: "GET",
    credentials: "include",
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch notifications: ${response.status}`);
  }

  return response.json();
};

export const markAllNotificationsRead = async (): Promise<void> => {
  const response = await fetch(`${API_BASE_URL}/api/notifications/read-all`, {
    method: "POST",
    credentials: "include",
  });

  if (!response.ok) {
    throw new Error(`Failed to mark all as read: ${response.status}`);
  }
};

export const markNotificationRead = async (id: string): Promise<void> => {
  const response = await fetch(`${API_BASE_URL}/api/notifications/${id}/read`, {
    method: "POST",
    credentials: "include",
  });

  if (!response.ok) {
    throw new Error(`Failed to mark notification as read: ${response.status}`);
  }
};
