export type ConversationContextType =
  | "general"
  | "course"
  | "marketplace_item"
  | "boarding_place"
  | "support";

export interface ChatParticipant {
  id: number;
  firstName: string;
  lastName: string;
  email?: string;
  profileImage?: string | null;
  primaryRole: string;
}

export interface Conversation {
  id: number;
  contextType: ConversationContextType;
  contextId: number | null;
  lastMessageAt: string | null;
  lastMessagePreview: string | null;
  isFlagged: boolean;
  flagReason?: string | null;
  participantOne?: ChatParticipant;
  participantTwo?: ChatParticipant;
  otherParticipant?: ChatParticipant | null;
  unreadCount?: number;
}

export interface MessageAttachment {
  id: number;
  url: string;
  fileType: "image" | "video" | "document";
  originalFilename: string | null;
}

export interface ChatMessage {
  id: number;
  conversationId: number;
  senderId: number;
  body: string | null;
  messageType: "text" | "attachment" | "system";
  isRead: boolean;
  createdAt: string;
  sender: ChatParticipant;
  attachments: MessageAttachment[];
}

export interface BlockedMessageLog {
  id: number;
  conversationId: number;
  senderId: number;
  attemptedBody: string;
  matchedPatterns: string[];
  createdAt: string;
  sender: ChatParticipant;
}
