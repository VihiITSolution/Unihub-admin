import { apiClient, ApiResponse } from "@/lib/api";
import type {
  BlockedMessageLog,
  ChatMessage,
  Conversation,
  ConversationContextType,
} from "@/types/chat";

export interface ConversationListResponse {
  conversations: Conversation[];
  pagination: { total: number; page: number; limit: number; totalPages: number };
}

export interface MessageListResponse {
  messages: ChatMessage[];
  pagination: { total: number; page: number; limit: number; totalPages: number };
}

export interface BlockedMessageListResponse {
  blockedMessages: BlockedMessageLog[];
  pagination: { total: number; page: number; limit: number; totalPages: number };
}

export const chatService = {
  // Admin's own inbox (participant-scoped, same endpoints regular users hit)
  async getConversations(options?: { page?: number; limit?: number }) {
    const { data } = await apiClient.get<ApiResponse<ConversationListResponse>>(
      "/chat/conversations",
      { params: options },
    );
    return data;
  },

  async getConversation(conversationId: number) {
    const { data } = await apiClient.get<ApiResponse<{ conversation: Conversation }>>(
      `/chat/conversations/${conversationId}`,
    );
    return data;
  },

  async createConversation(
    recipientId: number,
    options?: { contextType?: ConversationContextType; contextId?: number },
  ) {
    const { data } = await apiClient.post<ApiResponse<{ conversation: Conversation }>>(
      "/chat/conversations",
      { recipientId, ...options },
    );
    return data;
  },

  async getMessages(conversationId: number, options?: { page?: number; limit?: number }) {
    const { data } = await apiClient.get<ApiResponse<MessageListResponse>>(
      `/chat/conversations/${conversationId}/messages`,
      { params: options },
    );
    return data;
  },

  async sendMessage(conversationId: number, body: string) {
    const formData = new FormData();
    formData.append("body", body);
    const { data } = await apiClient.post<ApiResponse<{ message: ChatMessage }>>(
      `/chat/conversations/${conversationId}/messages`,
      formData,
      { headers: { "Content-Type": "multipart/form-data" } },
    );
    return data;
  },

  async markRead(conversationId: number) {
    const { data } = await apiClient.put<ApiResponse<null>>(
      `/chat/conversations/${conversationId}/read`,
      {},
    );
    return data;
  },

  // Platform-wide moderation/oversight endpoints (admin-only)
  async getAllConversations(options?: {
    page?: number;
    limit?: number;
    contextType?: string;
    isFlagged?: boolean;
    email?: string;
    userId?: number;
  }) {
    const { data } = await apiClient.get<ApiResponse<ConversationListResponse>>(
      "/admin/chat/conversations",
      { params: options },
    );
    return data;
  },

  async getConversationMessages(conversationId: number) {
    const { data } = await apiClient.get<
      ApiResponse<{ conversation: Conversation; messages: ChatMessage[] }>
    >(`/admin/chat/conversations/${conversationId}/messages`);
    return data;
  },

  async flagConversation(conversationId: number, isFlagged: boolean, flagReason?: string) {
    const { data } = await apiClient.put<ApiResponse<{ conversation: Conversation }>>(
      `/admin/chat/conversations/${conversationId}/flag`,
      { isFlagged, flagReason },
    );
    return data;
  },

  async getBlockedMessages(options?: { page?: number; limit?: number; senderId?: number }) {
    const { data } = await apiClient.get<ApiResponse<BlockedMessageListResponse>>(
      "/admin/chat/blocked-messages",
      { params: options },
    );
    return data;
  },
};
