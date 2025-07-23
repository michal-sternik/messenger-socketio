import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { Users } from "lucide-react";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getConversationName(
  isGroup: boolean,
  participants: { username: string }[],
  currentUser?: { username: string },
  maxLength = 30
) {
  if (isGroup) {
    const names = participants.map((p) => p.username).join(", ");
    return names.length > maxLength
      ? names.substring(0, maxLength) + "..."
      : names || "Group Chat";
  } else {
    const other = participants.find(
      (p) => p.username !== currentUser?.username
    );
    return other?.username || "Direct Message";
  }
}

export function getConversationAvatar(
  isGroup: boolean,
  participants: { username: string }[],
  currentUser?: { username: string }
) {
  if (isGroup) {
    return (
      <div className="w-10 h-10 bg-gradient-to-br from-purple-400 to-purple-600 rounded-2xl flex items-center justify-center shadow-md">
        <Users className="h-5 w-5 text-white" />
      </div>
    );
  } else {
    const other = participants.find(
      (p) => p.username !== currentUser?.username
    );
    const initial = other?.username?.charAt(0).toUpperCase() || "?";
    return (
      <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-blue-600 rounded-2xl flex items-center justify-center text-white font-semibold">
        {initial}
      </div>
    );
  }
}
