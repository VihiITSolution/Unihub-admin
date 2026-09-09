import { apiClient, ApiResponse } from "@/lib/api";

export type AdminNotificationType =
  | "tutor_approved"
  | "tutor_rejected"
  | "course_approved"
  | "course_rejected"
  | "enrollment"
  | "payment"
  | "general"
  | "follow"
  | "post_like"
  | "post_comment";

export interface AdminNotification {
  id: number;
  userId: number;
  type: AdminNotificationType;
  title: string;
  message: string;
  isRead: boolean;
  link?: string | null;
  metadata?: Record<string, unknown> | null;
  readAt?: string | null;
  createdAt: string;
}

export interface NotificationPage {
  notifications: AdminNotification[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export const notificationService = {
  async getNotifications(options: { page?: number; limit?: number; unreadOnly?: boolean } = {}): Promise<ApiResponse<NotificationPage>> {
    try {
      const params = new URLSearchParams();
      if (options.page) params.set("page", String(options.page));
      if (options.limit) params.set("limit", String(options.limit));
      if (options.unreadOnly) params.set("unreadOnly", "true");
      const response = await apiClient.get<ApiResponse<NotificationPage>>(`/notifications${params.size ? `?${params}` : ""}`);
      return response.data;
    } catch (error: any) {
      return { success: false, message: error.response?.data?.message || "Failed to load notifications." };
    }
  },

  async getUnreadCount(): Promise<ApiResponse<{ count: number }>> {
    try {
      const response = await apiClient.get<ApiResponse<{ count: number }>>("/notifications/unread-count");
      return response.data;
    } catch (error: any) {
      return { success: false, message: error.response?.data?.message || "Failed to load unread notifications." };
    }
  },

  async markAsRead(id: number): Promise<ApiResponse<{ notification: AdminNotification }>> {
    try {
      const response = await apiClient.put<ApiResponse<{ notification: AdminNotification }>>(`/notifications/${id}/read`, {});
      return response.data;
    } catch (error: any) {
      return { success: false, message: error.response?.data?.message || "Failed to mark notification as read." };
    }
  },

  async markAllAsRead(): Promise<ApiResponse<null>> {
    try {
      const response = await apiClient.put<ApiResponse<null>>("/notifications/mark-all-read", {});
      return response.data;
    } catch (error: any) {
      return { success: false, message: error.response?.data?.message || "Failed to mark all notifications as read." };
    }
  },

  async deleteNotification(id: number): Promise<ApiResponse<null>> {
    try {
      const response = await apiClient.delete<ApiResponse<null>>(`/notifications/${id}`);
      return response.data;
    } catch (error: any) {
      return { success: false, message: error.response?.data?.message || "Failed to delete notification." };
    }
  },
};
