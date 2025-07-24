"use client";

import { useEffect, useState } from "react";
import { conversationApi } from "@/lib/api";
import { socketService } from "@/lib/socket";
import type { ConversationWithLastMessage } from "@/types";
import { Card } from "@/components/ui/card";
import { formatDistanceToNow } from "date-fns";
import { useAuth } from "@/contexts/auth-context";
import { Users, Clock, MessageSquare, X } from "lucide-react";

interface ConversationListProps {
  selectedConversationId: string | null;
  onSelectConversation: (conversationId: string) => void;
  onToggleView: () => void; //to close conversation list on mobile
}

export function ConversationList({
  selectedConversationId,
  onSelectConversation,
  onToggleView,
}: ConversationListProps) {
  const [conversations, setConversations] = useState<
    ConversationWithLastMessage[]
  >([]);
  const [isLoading, setIsLoading] = useState(true);
  const { user: currentUser } = useAuth();

  useEffect(() => {
    loadConversations();

    socketService.onConversationUpdated((updatedConversations) => {
      setConversations(updatedConversations);
    });

    // socketService.onConversationDeleted((data) => {
    //   // Aktualizuj listę rozmów po usunięciu
    //   setConversations(prev =>
    //     prev.filter(conv => conv.conversationId !== data.conversationId)
    //   );
    // });

    return () => {
      socketService.off("conversation_updated");
      //socketService.off("conversation_deleted");
    };
  }, []);

  const loadConversations = async () => {
    try {
      const response = await conversationApi.getUserConversations();
      setConversations(response.data);
    } catch (error) {
      console.error("Error loading conversations:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const getConversationName = (conversation: ConversationWithLastMessage) => {
    if (conversation.conversation.isGroup) {
      const participantNames = conversation.conversation.participants
        ?.map((p) => p.username)
        .join(", ");
      return participantNames || "Group Chat";
    } else {
      const otherParticipant = conversation.conversation.participants?.find(
        (p) => p.username !== currentUser?.username
      );
      return otherParticipant?.username || "Direct Message";
    }
  };

  const getLastMessagePreview = (conversation: ConversationWithLastMessage) => {
    const lastMessage = conversation.conversation.message;
    if (!lastMessage) return "No messages yet";

    return lastMessage.content.length > 50
      ? `${lastMessage.content.substring(0, 50)}...`
      : lastMessage.content;
  };

  const getLastMessageTime = (conversation: ConversationWithLastMessage) => {
    const updatedAt = conversation.conversation.updatedAt;
    if (!updatedAt) return "";

    return formatDistanceToNow(new Date(updatedAt), {
      addSuffix: true,
    });
  };

  const getConversationAvatar = (conversation: ConversationWithLastMessage) => {
    if (conversation.conversation.isGroup) {
      return (
        <div className="w-12 h-12 bg-gradient-to-br from-purple-400 to-purple-600 rounded-2xl flex items-center justify-center shadow-md">
          <Users className="h-6 w-6 text-white" />
        </div>
      );
    } else {
      const otherParticipant = conversation.conversation.participants?.find(
        (p) => p.username !== currentUser?.username
      );
      const initial =
        otherParticipant?.username?.charAt(0).toUpperCase() || "?";

      return (
        <div className="relative">
          <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-blue-600 rounded-2xl flex items-center justify-center text-white font-semibold text-lg shadow-md">
            {initial}
          </div>
          <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-400 rounded-full border-2 border-white"></div>
        </div>
      );
    }
  };

  if (isLoading) {
    return (
      <div className="w-80 bg-gradient-to-b from-gray-50 to-white border-r border-gray-100 p-6">
        <div className="space-y-4">
          {[...Array<number>(5)].map((_, i) => (
            <div key={i} className="flex items-center space-x-3 animate-pulse">
              <div className="w-12 h-12 bg-gray-200 rounded-2xl"></div>
              <div className="flex-1">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="w-full md:w-80 bg-gradient-to-b from-gray-50 to-white border-r border-gray-100 flex flex-col">
      {/* Header */}
      <div className="p-6 border-b border-gray-100">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-gray-800">Chats</h2>
            <p className="text-sm text-gray-500">
              {conversations.length} conversations
            </p>
          </div>
          <div className="flex items-center space-x-2">
            {/* Close button for mobile */}
            <button
              className="md:hidden p-2 rounded-lg hover:bg-gray-100"
              onClick={onToggleView}
            >
              <X className="h-5 w-5 text-gray-600" />
            </button>
            <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
              <MessageSquare className="h-5 w-5 text-blue-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Conversations */}
      <div className="flex flex-1 overflow-y-hidden">
        {conversations.length === 0 ? (
          <div className="flex flex-col justify-center w-full p-6 text-center ">
            <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <MessageSquare className="h-8 w-8 text-gray-400" />
            </div>
            <p className="text-gray-500 font-medium">No conversations yet</p>
            <p className="text-sm text-gray-400 mt-1">
              Start a new chat to get started!
            </p>
          </div>
        ) : (
          <div className="w-full p-3 space-y-2 overflow-y-auto">
            {conversations.map((conversation) => (
              <Card
                key={conversation.conversationId}
                className={`p-4 cursor-pointer transition-all duration-200 hover:shadow-md border-0 ${
                  selectedConversationId === conversation.conversationId
                    ? "bg-gradient-to-r from-blue-50 to-blue-100 shadow-md scale-[1.02] border-l-4 border-l-blue-500"
                    : "bg-white hover:bg-gray-50"
                } rounded-2xl`}
                onClick={() =>
                  onSelectConversation(conversation.conversationId)
                }
              >
                <div className="flex items-center space-x-3">
                  {getConversationAvatar(conversation)}

                  <div className="flex-1 min-w-0">
                    <div className="flex flex-col mb-1">
                      <h3 className="font-semibold text-gray-800 truncate">
                        {getConversationName(conversation)}
                      </h3>
                      <div className="flex items-center space-x-1 text-xs text-gray-400">
                        <Clock className="h-3 w-3" />
                        <span>{getLastMessageTime(conversation)}</span>
                      </div>
                    </div>

                    <p className="text-sm text-gray-600 truncate">
                      {getLastMessagePreview(conversation)}
                    </p>

                    {conversation.conversation.isGroup && (
                      <div className="flex items-center mt-2 space-x-1">
                        <Users className="h-3 w-3 text-gray-400" />
                        <span className="text-xs text-gray-400">
                          {conversation.conversation.participants.length}{" "}
                          members
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
