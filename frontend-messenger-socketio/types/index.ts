export interface User {
  id: number;
  username: string;
  email: string;
}

export interface Message {
  id: number;
  content: string;
  createdAt: string;
  sender: {
    id: number;
    username: string;
  };
  conversationId: string;
}

export interface Conversation {
  id: string;
  isGroup: boolean;
  createdAt: string;
  updatedAt: string;
  participants: ConversationParticipant[];
  messages: Message[];
}

export interface ConversationParticipant {
  id: number;
  userId: number;
  conversationId: string;
  joinedAt: string;
  user: User;
  conversation: Conversation;
}
export interface ConversationWithLastMessage {
  id: number;
  conversationId: string;
  conversation: {
    updatedAt: string;
    isGroup: boolean;
    message: {
      id: number;
      content: string;
      sender: {
        id: number;
        username: string;
      };
    };
    participants: {
      conversationParticipantId: number;
      username: string;
    }[];
  };
}
