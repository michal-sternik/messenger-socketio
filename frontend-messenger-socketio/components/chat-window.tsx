"use client";

import type React from "react";

import { useEffect, useState, useRef } from "react";
import { conversationApi } from "@/lib/api";
import { socketService } from "@/lib/socket";
import { useAuth } from "@/contexts/auth-context";
import type { Message } from "@/types";
import { toast } from "sonner";

import { Input } from "@/components/ui/input";
import {
  Send,
  MoreVertical,
  Phone,
  Video,
  Info,
  Smile,
  Paperclip,
  ArrowDown,
  Menu,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { getConversationName, getConversationAvatar } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { Button } from "./ui/button";

interface ChatWindowProps {
  conversationId: string | null;
  onToggleConversationList: () => void;
  setConversationId: (id: string | null) => void;
}

export function ChatWindow({
  conversationId,
  onToggleConversationList,
  setConversationId,
}: ChatWindowProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [showScrollButton, setShowScrollButton] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [conversationInfo, setConversationInfo] = useState<{
    isGroup: boolean;
    conversationParticipants: { id: number; username: string }[];
  } | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const { user } = useAuth();
  const isLoadingMoreRef = useRef(false);
  useEffect(() => {
    if (conversationId) {
      loadMessages();
      joinConversation();

      socketService.onNewMessage((message) => {
        if (message.conversationId === conversationId) {
          setMessages((prev) => [...prev, message]);
        }
      });

      socketService.onConversationDeleted((data) => {
        if (data.conversationId === conversationId) {
          toast("Conversation has been deleted, redirecting in 1 second...");
          setTimeout(() => setConversationId(null), 1000);
        }
      });

      return () => {
        socketService.off("new_message");
        socketService.off("conversation_deleted");
      };
    }
  }, [conversationId]);

  useEffect(() => {
    const container = messagesContainerRef.current;
    if (container) {
      const handleScroll = () => {
        const { scrollTop, scrollHeight, clientHeight } = container;
        setShowScrollButton(scrollHeight - scrollTop - clientHeight > 100);
      };

      container.addEventListener("scroll", handleScroll);
      return () => container.removeEventListener("scroll", handleScroll);
    }
  }, []);

  const loadMessages = async () => {
    if (!conversationId) return;

    setIsLoading(true);
    try {
      const response = await conversationApi.getMessages(conversationId);
      setMessages(response.data.messages);
      setHasMore(response.data.hasMore);
      setNextCursor(response.data.nextCursor);
      setConversationInfo({
        isGroup: response.data.isGroup,
        conversationParticipants: response.data.conversationParticipants,
      });
    } catch (error) {
      console.error("Error loading messages:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadMoreMessages = async () => {
    if (!conversationId || !hasMore || !nextCursor || isLoading) return;

    setIsLoading(true);
    setIsLoadingMore(true);
    isLoadingMoreRef.current = true;
    try {
      const response = await conversationApi.getMessages(
        conversationId,
        nextCursor
      );
      setMessages((prev) => [...response.data.messages, ...prev]);
      setHasMore(response.data.hasMore);
      setNextCursor(response.data.nextCursor);
    } catch (error) {
      console.error("Error loading more messages:", error);
    } finally {
      setIsLoading(false);
      setIsLoadingMore(false);
    }
  };

  const joinConversation = () => {
    if (conversationId) {
      socketService.joinConversation(conversationId);
    }
  };

  const sendMessage = () => {
    if (!conversationId || !newMessage.trim()) return;

    socketService.sendMessage(conversationId, newMessage.trim());
    setNewMessage("");
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  useEffect(() => {
    if (isLoadingMoreRef.current) {
      isLoadingMoreRef.current = false;
      return; //do not scroll to bottom when loading more
    }
    scrollToBottom();
  }, [messages]);

  if (!conversationId) {
    return (
      <div className="flex-1 p-10 flex flex-col items-center justify-center bg-gradient-to-br from-blue-50 to-white">
        {/* Welcome content */}
        <div className="text-center max-w-md mt-16 md:mt-0">
          <div className="w-24 h-24 bg-gradient-to-br from-blue-100 to-blue-200 rounded-3xl flex items-center justify-center mx-auto mb-6">
            <Send className="h-12 w-12 text-blue-500" />
          </div>
          <h3 className="text-2xl font-bold text-gray-800 mb-2">
            Welcome to Messenger
          </h3>
          <p className="text-gray-600 mb-6">
            Select a conversation or start a new one to begin chatting
          </p>

          {/* Button to open conversationList on mobile initial screen (when no conversation is selected) */}
          <button
            className="md:hidden bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white px-6 py-3 rounded-2xl font-medium transition-all duration-200 shadow-md hover:shadow-lg mb-6"
            onClick={onToggleConversationList}
          >
            View Conversations
          </button>

          <div className="flex items-center justify-center space-x-2 text-sm text-gray-500">
            <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
            <span>Ready to connect</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col bg-white relative">
      {/* Chat Header */}
      <div className="bg-white border-b border-gray-100 px-6 py-4 shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <button
              className="md:hidden p-2 rounded-lg hover:bg-gray-100"
              onClick={onToggleConversationList}
            >
              <Menu className="h-6 w-6 text-gray-600" />
            </button>

            {conversationInfo &&
              user &&
              getConversationAvatar(
                conversationInfo.isGroup,
                conversationInfo.conversationParticipants,
                { username: user.username }
              )}
            <div>
              <h3
                title={conversationInfo?.conversationParticipants
                  .map((p) => p.username)
                  .join(", ")}
                className="font-semibold text-gray-800 w-40 whitespace-nowrap overflow-hidden md:w-auto"
              >
                {conversationInfo &&
                  user &&
                  getConversationName(
                    conversationInfo.isGroup,
                    conversationInfo.conversationParticipants,
                    { username: user.username }
                  )}
              </h3>
              <p className="text-sm text-green-500 flex items-center">
                <span className="w-2 h-2 bg-green-400 rounded-full mr-2"></span>
                Online
              </p>
            </div>
          </div>

          {/* Dropdown Menu */}
          <div className="flex items-center space-x-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className=" rounded-xl hover:bg-blue-50"
                >
                  <MoreVertical className="h-4 w-4 text-gray-600" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem
                  className="cursor-pointer text-red-600 focus:bg-red-50"
                  onClick={() => {
                    if (!conversationId) return;
                    socketService.deleteConversation(conversationId);
                  }}
                >
                  Delete conversation
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>

      {/* Messages Container */}
      <div
        ref={messagesContainerRef}
        className="flex-1 overflow-y-auto p-6 space-y-4 bg-gradient-to-b from-gray-50/30 to-white"
        onScroll={(e) => {
          const { scrollTop } = e.currentTarget;
          if (scrollTop === 0 && hasMore) {
            void loadMoreMessages();
          }
        }}
      >
        {isLoading && messages.length === 0 && (
          <div className="text-center py-8">
            <div className="inline-flex items-center space-x-2 text-gray-500">
              <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
              <span>Loading messages...</span>
            </div>
          </div>
        )}

        {hasMore && messages.length > 0 && (
          <div className="text-center py-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                void loadMoreMessages();
              }}
              disabled={isLoading}
              className="text-blue-600 hover:bg-blue-50 rounded-xl"
            >
              {isLoading ? (
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                  <span>Loading...</span>
                </div>
              ) : (
                "Load more messages"
              )}
            </Button>
          </div>
        )}

        {messages.map((message, index) => {
          const isOwn = message.sender.id === user?.id;
          const showAvatar =
            index === 0 || messages[index - 1]?.sender.id !== message.sender.id;
          const showTime =
            index === messages.length - 1 ||
            messages[index + 1]?.sender.id !== message.sender.id ||
            new Date(messages[index + 1]?.createdAt).getTime() -
              new Date(message.createdAt).getTime() >
              300000;

          return (
            <div
              key={message.id}
              className={`flex ${isOwn ? "justify-end" : "justify-start"} ${showAvatar ? "mt-4" : "mt-1"}`}
            >
              <div
                className={`flex items-end space-x-2 max-w-xs lg:max-w-md ${isOwn ? "flex-row-reverse space-x-reverse" : ""}`}
              >
                {!isOwn && showAvatar && (
                  <div className="min-w-8 h-8 bg-gradient-to-br from-gray-400 to-gray-600 rounded-full flex items-center justify-center text-white text-sm font-semibold">
                    {message.sender.username.charAt(0).toUpperCase()}
                  </div>
                )}
                {!isOwn && !showAvatar && <div className="w-8"></div>}

                <div className={`relative group ${isOwn ? "ml-auto" : ""}`}>
                  {!isOwn && showAvatar && (
                    <div className="text-xs text-gray-500 mb-1 px-3">
                      {message.sender.username}
                    </div>
                  )}

                  <div
                    className={`px-4 py-3 rounded-2xl shadow-sm transition-all duration-200 hover:shadow-md ${
                      isOwn
                        ? "bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-br-md"
                        : "bg-white text-gray-800 border border-gray-100 rounded-bl-md"
                    }`}
                  >
                    <div className="break-words break-all">
                      {message.content}
                    </div>
                  </div>

                  {showTime && (
                    <div
                      className={`text-xs text-gray-400 mt-1 px-3 ${isOwn ? "text-right" : "text-left"}`}
                    >
                      {formatDistanceToNow(new Date(message.createdAt), {
                        addSuffix: true,
                      })}
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* Scroll to bottom button */}
      {showScrollButton && (
        <Button
          onClick={scrollToBottom}
          className="absolute bottom-24 right-6 w-12 h-12 rounded-full bg-blue-500 hover:bg-blue-600 shadow-lg z-10"
          size="sm"
        >
          <ArrowDown className="h-4 w-4" />
        </Button>
      )}

      {/* Message Input */}
      <div className="border-t border-gray-100 bg-white p-4">
        <div className="flex items-end space-x-3">
          <div className="flex-1 relative">
            <Input
              type="text"
              placeholder="Type a message..."
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyDown={handleKeyPress}
              className="pr-12 py-3 rounded-2xl border-gray-200 focus:border-blue-400 focus:ring-2 focus:ring-blue-100 resize-none"
            />
          </div>

          <Button
            onClick={sendMessage}
            disabled={!newMessage.trim()}
            className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white rounded-2xl px-6 py-3 shadow-md hover:shadow-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
