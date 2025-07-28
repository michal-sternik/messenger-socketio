import { io, type Socket } from "socket.io-client";

class SocketService {
  private socket: Socket | null = null;

  connect(token: string) {
    if (this.socket?.connected) return this.socket;

    this.socket = io(
      process.env.NEXT_PUBLIC_SOCKET_URL || "http://localhost:3000",
      {
        auth: {
          token,
        },
        transports: ["websocket"],
      }
    );

    this.socket.on("connect", () => {
      console.log("Connected to server");
    });

    this.socket.on("disconnect", () => {
      console.log("Disconnected from server");
    });

    this.socket.on("error", (error) => {
      console.error("Socket error:", error);
    });

    return this.socket;
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  getSocket() {
    return this.socket;
  }

  //socket event methods
  joinConversation(conversationId: string) {
    this.socket?.emit("join_conversation", { conversationId });
  }

  sendMessage(conversationId: string, content: string) {
    this.socket?.emit("send_message", { conversationId, content });
  }

  startConversation(participantsIds: number[], content: string) {
    this.socket?.emit("start_conversation", { participantsIds, content });
  }

  deleteConversation(conversationId: string) {
    this.socket?.emit("delete_conversation", { conversationId });
  }

  addToConversation(conversationId: string, userId: number) {
    this.socket?.emit("add_to_conversation", { conversationId, userId });
  }

  //event listeners
  onNewMessage(callback: (message: any) => void) {
    this.socket?.on("new_message", callback);
  }

  onConversationUpdated(callback: (conversations: any[]) => void) {
    this.socket?.on("conversation_updated", callback);
  }

  onJoinedConversation(callback: (data: any) => void) {
    this.socket?.on("joined_conversation", callback);
  }

  onUserAddedToConversation(callback: (data: any) => void) {
    this.socket?.on("user_added_to_conversation", callback);
  }
  onConversationStarted(callback: (data: { conversationId: string }) => void) {
    this.socket?.on("conversation_started", callback);
  }

  onConversationDeleted(callback: (data: { conversationId: string }) => void) {
    this.socket?.on("conversation_deleted", callback);
  }

  //remove listeners
  off(event: string, callback?: any) {
    this.socket?.off(event, callback);
  }
}

export const socketService = new SocketService();
