"use client";

import { useState } from "react";
import { useAuth } from "@/contexts/auth-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { UserSearch } from "./user-search";
import { LogOut, MessageCircle, Search, Plus } from "lucide-react";

export function Header() {
  const { user, logout } = useAuth();
  const [showUserSearch, setShowUserSearch] = useState(false);

  return (
    <header className="bg-gradient-to-r from-white to-blue-50 border-b border-blue-100 shadow-sm">
      <div className="px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-6">
            {/* Logo and Brand */}
            <div className="flex items-center space-x-3">
              <div className="flex items-center space-x-2">
                <img src="/logo.svg" alt="Messenger Logo" />
              </div>
            </div>

            {/* Search Bar */}
            <div className="relative">
              <div className="relative group">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 group-hover:text-blue-500 transition-colors" />
                <Input
                  type="text"
                  placeholder="Search users to start a conversation..."
                  className="w-96 pl-11 pr-12 py-3 bg-white/80 backdrop-blur-sm border-gray-200 rounded-2xl focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-all duration-200 hover:bg-white"
                  onFocus={() => setShowUserSearch(true)}
                  readOnly
                />
                <Button
                  size="sm"
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 h-7 w-7 p-0 bg-blue-500 hover:bg-blue-600 rounded-lg"
                  onClick={() => setShowUserSearch(true)}
                >
                  <Plus className="h-3 w-3" />
                </Button>
              </div>
              {showUserSearch && (
                <UserSearch onClose={() => setShowUserSearch(false)} />
              )}
            </div>
          </div>

          {/* User Info and Actions */}
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-3 bg-white/60 backdrop-blur-sm rounded-2xl px-4 py-2 border border-gray-100">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                {user?.username?.charAt(0).toUpperCase()}
              </div>
              <div className="text-right">
                <p className="text-sm font-semibold text-gray-800">
                  {user?.username}
                </p>
                <p className="text-xs text-gray-500">Online</p>
              </div>
            </div>

            <Button
              onClick={logout}
              variant="outline"
              size="sm"
              className="border-gray-200 text-gray-600 hover:bg-red-50 hover:border-red-200 hover:text-red-600 bg-white/60 backdrop-blur-sm rounded-xl transition-all duration-200"
            >
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}
