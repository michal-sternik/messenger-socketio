"use client";

import { useState, useEffect, useRef } from "react";
import { userApi } from "@/lib/api";
import { socketService } from "@/lib/socket";
import type { User } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { X, Plus, Send, Search, Users, UserIcon } from "lucide-react";

interface UserSearchProps {
  onClose: () => void;
}

export function UserSearch({ onClose }: UserSearchProps) {
  const [query, setQuery] = useState("");
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUsers, setSelectedUsers] = useState<User[]>([]);
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        searchRef.current &&
        !searchRef.current.contains(event.target as Node)
      ) {
        onClose();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [onClose]);

  useEffect(() => {
    const searchUsers = async () => {
      if (query.trim().length < 2) {
        setUsers([]);
        return;
      }

      setIsLoading(true);
      try {
        const response = await userApi.searchUsers(query.trim());
        setUsers(response.data);
      } catch (error) {
        console.error("Error searching users:", error);
        setUsers([]);
      } finally {
        setIsLoading(false);
      }
    };

    const debounceTimer = setTimeout(searchUsers, 300);
    return () => clearTimeout(debounceTimer);
  }, [query]);

  const addUser = (user: User) => {
    if (!selectedUsers.find((u) => u.id === user.id)) {
      setSelectedUsers([...selectedUsers, user]);
    }
    setQuery("");
    setUsers([]);
  };

  const removeUser = (userId: number) => {
    setSelectedUsers(selectedUsers.filter((u) => u.id !== userId));
  };

  const startConversation = () => {
    if (selectedUsers.length === 0 || !message.trim()) return;

    const participantIds = selectedUsers.map((u) => u.id);
    socketService.startConversation(participantIds, message.trim());

    setSelectedUsers([]);
    setMessage("");
    onClose();
  };

  return (
    <div ref={searchRef} className="absolute top-full left-0 right-0 mt-3 z-50">
      <Card className="shadow-2xl border-0 rounded-3xl overflow-hidden bg-white/95 backdrop-blur-xl">
        <CardContent className="p-0">
          <div className="bg-gradient-to-r from-blue-50 to-white p-6 border-b border-gray-100">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center">
                <Search className="h-5 w-5 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-800">
                  Start New Conversation
                </h3>
                <p className="text-sm text-gray-500">
                  Search and select users to chat with
                </p>
              </div>
            </div>

            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                type="text"
                placeholder="Search users..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="pl-11 py-3 rounded-2xl border-gray-200 focus:border-blue-400 focus:ring-2 focus:ring-blue-100 bg-white"
                autoFocus
              />
            </div>
          </div>

          <div className="p-6 space-y-6">
            {/* Selected Users */}
            {selectedUsers.length > 0 && (
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <Users className="h-4 w-4 text-blue-600" />
                  <span className="text-sm font-medium text-gray-700">
                    Selected ({selectedUsers.length})
                  </span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {selectedUsers.map((user) => (
                    <div
                      key={user.id}
                      className="flex items-center space-x-2 bg-gradient-to-r from-blue-50 to-blue-100 text-blue-700 px-4 py-2 rounded-2xl border border-blue-200 shadow-sm"
                    >
                      <div className="w-6 h-6 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center text-white text-xs font-semibold">
                        {user.username.charAt(0).toUpperCase()}
                      </div>
                      <span className="text-sm font-medium">
                        {user.username}
                      </span>
                      <button
                        onClick={() => removeUser(user.id)}
                        className="hover:bg-blue-200 rounded-full p-1 transition-colors"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Search Results */}
            {query.length >= 2 && (
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <UserIcon className="h-4 w-4 text-gray-600" />
                  <span className="text-sm font-medium text-gray-700">
                    Search Results
                  </span>
                </div>

                {isLoading ? (
                  <div className="text-center py-8">
                    <div className="inline-flex items-center space-x-2 text-gray-500">
                      <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                      <span>Searching...</span>
                    </div>
                  </div>
                ) : users.length > 0 ? (
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {users.map((user) => (
                      <div
                        key={user.id}
                        className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-2xl cursor-pointer transition-colors group"
                        onClick={() => addUser(user)}
                      >
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-gradient-to-br from-gray-400 to-gray-600 rounded-2xl flex items-center justify-center text-white font-semibold">
                            {user.username.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <div className="font-medium text-gray-800">
                              {user.username}
                            </div>
                            <div className="text-sm text-gray-500">
                              {user.email}
                            </div>
                          </div>
                        </div>
                        <div className="w-8 h-8 bg-blue-100 rounded-xl flex items-center justify-center group-hover:bg-blue-200 transition-colors">
                          <Plus className="h-4 w-4 text-blue-600" />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-3">
                      <UserIcon className="h-8 w-8 text-gray-400" />
                    </div>
                    <p className="text-gray-500">No users found</p>
                    <p className="text-sm text-gray-400 mt-1">
                      Try a different search term
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Message Input and Send Button */}
            {selectedUsers.length > 0 && (
              <div className="space-y-4 pt-4 border-t border-gray-100">
                <div className="flex items-center space-x-2">
                  <Send className="h-4 w-4 text-blue-600" />
                  <span className="text-sm font-medium text-gray-700">
                    First Message
                  </span>
                </div>
                <Input
                  type="text"
                  placeholder="Type your first message..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="py-3 rounded-2xl border-gray-200 focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
                  onKeyPress={(e) => e.key === "Enter" && startConversation()}
                />
                <div className="flex justify-end">
                  <Button
                    onClick={startConversation}
                    disabled={!message.trim()}
                    className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white rounded-2xl px-6 py-3 shadow-md hover:shadow-lg transition-all duration-200"
                  >
                    <Send className="h-4 w-4 mr-2" />
                    Start Conversation
                  </Button>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
