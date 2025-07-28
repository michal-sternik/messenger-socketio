"use client";

import { useState } from "react";
import { useAuth } from "@/contexts/auth-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { UserSearch } from "./user-search";
import { LogOut, Search, Plus } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";

//SearchBar component rendered conditionally depending on screen size
function SearchBar({ onShowUserSearch }: { onShowUserSearch: () => void }) {
  return (
    <div className="relative">
      <div className="relative group">
        <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 group-hover:text-blue-500 transition-colors" />
        <Input
          type="text"
          placeholder="Search users to start a conversation..."
          className="w-full md:w-96 pl-11 pr-12 py-3 text-xs md:text-sm bg-white/80 backdrop-blur-sm border-gray-200 rounded-2xl focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-all duration-200 hover:bg-white"
          onFocus={onShowUserSearch}
          readOnly
        />
        <Button
          size="sm"
          className="absolute right-2 top-1/2 transform -translate-y-1/2 h-7 w-7 p-0 bg-blue-500 hover:bg-blue-600 rounded-lg"
          onClick={onShowUserSearch}
        >
          <Plus className="h-3 w-3" />
        </Button>
      </div>
    </div>
  );
}

export function Header({
  onConversationCreated,
}: {
  onConversationCreated?: (id: string) => void;
}) {
  const { user, logout } = useAuth();
  const [showUserSearch, setShowUserSearch] = useState(false);

  const handleShowUserSearch = () => setShowUserSearch(true);

  return (
    <header className="bg-gradient-to-r from-white to-blue-50 border-b border-blue-100 shadow-sm">
      <div className="px-6 py-4">
        <div className="flex flex-col space-y-4">
          {/* Top row - Logo, SearchBar (desktop only), User Info */}
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center space-x-6">
              {/* Logo and Brand */}
              <div className="flex items-center space-x-3">
                <div className="flex items-center space-x-2">
                  <img
                    src="/logo.svg"
                    alt="Messenger Logo"
                    className="min-h-auto min-w-24"
                  />
                </div>
              </div>

              {/* Search Bar - desktop only (md+) */}
              <div className="hidden md:block">
                <SearchBar onShowUserSearch={handleShowUserSearch} />
              </div>
            </div>

            {/* User Info and Actions */}
            <div className="flex items-center space-x-4 relative">
              {/* User Info Dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <div className="flex items-center space-x-3 bg-white/60 backdrop-blur-sm rounded-2xl px-4 py-2 border border-gray-100 cursor-pointer relative">
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
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-40">
                  <DropdownMenuItem
                    onClick={logout}
                    className="flex items-center text-gray-700 hover:bg-red-50 hover:text-red-600 transition-colors rounded-xl"
                  >
                    <LogOut className="h-4 w-4 mr-2" />
                    Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          {/* Search Bar - mobile only (-md) */}
          <div className="block md:hidden">
            <SearchBar onShowUserSearch={handleShowUserSearch} />
          </div>
        </div>

        {/* UserSearch Modal/Dropdown */}
        {showUserSearch && (
          <div className="relative">
            <UserSearch
              onClose={() => setShowUserSearch(false)}
              onConversationCreated={(id) => {
                setShowUserSearch(false);
                if (onConversationCreated) onConversationCreated(id);
              }}
            />
          </div>
        )}
      </div>
    </header>
  );
}
