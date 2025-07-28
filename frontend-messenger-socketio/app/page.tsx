"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/auth-context";
import { Header } from "@/components/header";
import { ConversationList } from "@/components/conversation-list";
import { ChatWindow } from "@/components/chat-window";

export default function HomePage() {
  const { user, isLoading } = useAuth();
  const [selectedConversationId, setSelectedConversationId] = useState<
    string | null
  >(null);
  const [isConversationListVisible, setIsConversationListVisible] =
    useState(false);
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !user) {
      router.push("/login");
    }
  }, [user, isLoading, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-white">
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-3xl flex items-center justify-center mx-auto mb-4 animate-pulse">
            <div className="w-8 h-8 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
          </div>
          <p className="text-gray-600 font-medium">
            Loading your conversations...
          </p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="h-screen bg-white flex flex-col overflow-hidden">
      <Header
        onConversationCreated={(id) => {
          setSelectedConversationId(id);
          setIsConversationListVisible(false);
        }}
      />
      <div className="flex-1 flex overflow-hidden">
        {/* ConversationList */}
        <div
          className={`${
            isConversationListVisible ? "flex w-full" : "hidden"
          }  md:flex w-80 bg-gradient-to-b from-gray-50 to-white border-r border-gray-100`}
        >
          <ConversationList
            selectedConversationId={selectedConversationId}
            onSelectConversation={(conversationId) => {
              setSelectedConversationId(conversationId);
              setIsConversationListVisible(false); //close the list when a conversation is selected
            }}
            onToggleView={() => setIsConversationListVisible(false)} //close the list on mobile
          />
        </div>

        {/* ChatWindow */}
        <div
          className={`${
            !isConversationListVisible ? "flex" : "hidden"
          } w-full h-full `}
        >
          <ChatWindow
            conversationId={selectedConversationId}
            onToggleConversationList={() =>
              setIsConversationListVisible((prev) => !prev)
            }
            setConversationId={setSelectedConversationId}
          />
        </div>
      </div>
    </div>
  );
}
