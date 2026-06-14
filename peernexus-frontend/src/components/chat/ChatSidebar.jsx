import React, { useState, useEffect } from "react";
import Avatar from "../common/Avatar.jsx";
import { chatService } from "../../services/chatService.js";

export function ChatSidebar({ rooms = [], activeRoomId, currentUserId, onSelectRoom }) {
  const [localSearch, setLocalSearch] = useState("");
  const [msgSearch, setMsgSearch] = useState("");
  const [msgResults, setMsgResults] = useState([]);
  const [isSearchingMsgs, setIsSearchingMsgs] = useState(false);
  const [searchTab, setSearchTab] = useState("chats"); // "chats" | "messages"

  useEffect(() => {
    if (!msgSearch.trim()) {
      setMsgResults([]);
      return;
    }
    const timer = setTimeout(async () => {
      setIsSearchingMsgs(true);
      try {
        const results = await chatService.searchMessages(msgSearch.trim());
        setMsgResults(results || []);
      } catch (err) {
        console.error("Message search failed:", err);
      } finally {
        setIsSearchingMsgs(false);
      }
    }, 400);

    return () => clearTimeout(timer);
  }, [msgSearch]);

  const formatTime = (isoStr) => {
    if (!isoStr) return "";
    const date = new Date(isoStr);
    const now = new Date();
    if (date.toDateString() === now.toDateString()) {
      return date.toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" });
    }
    return date.toLocaleDateString(undefined, { month: "short", day: "numeric" });
  };

  const filteredRooms = rooms.filter((room) => {
    const name = room.otherUser?.name || "";
    return name.toLowerCase().includes(localSearch.toLowerCase());
  });

  return (
    <div className="w-full md:w-80 border-r border-ink/8 bg-white shrink-0 flex flex-col h-[calc(100vh-140px)] shadow-sm">
      {/* Header and Tabs */}
      <div className="p-4 border-b border-ink/8 flex flex-col gap-3">
        <div className="flex justify-between items-center">
          <h2 className="text-base font-bold text-ink">Messages</h2>
          <div className="flex bg-slate-100 rounded-lg p-0.5 text-xs">
            <button
              onClick={() => setSearchTab("chats")}
              className={`px-3 py-1 rounded-md font-medium transition ${
                searchTab === "chats" ? "bg-white text-ink shadow-sm" : "text-ink/60 hover:text-ink"
              }`}
            >
              Chats
            </button>
            <button
              onClick={() => setSearchTab("messages")}
              className={`px-3 py-1 rounded-md font-medium transition ${
                searchTab === "messages" ? "bg-white text-ink shadow-sm" : "text-ink/60 hover:text-ink"
              }`}
            >
              Search
            </button>
          </div>
        </div>

        {/* Search Bar */}
        {searchTab === "chats" ? (
          <div className="relative">
            <input
              type="text"
              placeholder="Search conversations..."
              value={localSearch}
              onChange={(e) => setLocalSearch(e.target.value)}
              className="w-full bg-slate-50 border border-ink/10 rounded-xl pl-9 pr-4 py-2 text-xs text-ink placeholder:text-ink/40 outline-none focus:border-accent focus:bg-white transition"
            />
            <svg
              className="w-4 h-4 text-ink/30 absolute left-3 top-2.5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
        ) : (
          <div className="relative">
            <input
              type="text"
              placeholder="Search in message text..."
              value={msgSearch}
              onChange={(e) => setMsgSearch(e.target.value)}
              className="w-full bg-slate-50 border border-ink/10 rounded-xl pl-9 pr-4 py-2 text-xs text-ink placeholder:text-ink/40 outline-none focus:border-accent focus:bg-white transition"
            />
            <svg
              className="w-4 h-4 text-ink/30 absolute left-3 top-2.5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
        )}
      </div>

      {/* List Feed */}
      <div className="flex-1 overflow-y-auto p-2 flex flex-col gap-1">
        {searchTab === "chats" ? (
          filteredRooms.length === 0 ? (
            <div className="text-center py-12 text-ink/30 text-xs">
              No active conversations
            </div>
          ) : (
            filteredRooms.map((room) => {
              const partner = room.otherUser
                ? {
                    id: room.otherUser.id,
                    name: room.otherUser.name,
                    avatarUrl: room.otherUser.profilePicture,
                    online: room.otherUser.online,
                  }
                : null;
              const active = room.roomId === activeRoomId;
              const lastMsg = room.lastMessageContent || room.lastMessageAt
                ? {
                    content: room.lastMessageContent,
                    sentAt: room.lastMessageAt,
                    senderId: room.lastMessageSenderId,
                    type: room.lastMessageType,
                    deleted: false,
                  }
                : null;
              const unread = room.unreadCount || 0;

              return (
                <button
                  key={room.roomId}
                  onClick={() => onSelectRoom(room.roomId)}
                  className={`w-full flex items-center gap-3 p-3 rounded-2xl transition-all duration-200 text-left border border-transparent ${
                    active
                      ? "bg-accent/10 text-ink border-accent/20"
                      : "hover:bg-slate-50 text-ink/75 hover:scale-[1.01] active:scale-[0.99]"
                  }`}
                >
                  <Avatar
                    src={partner?.avatarUrl}
                    name={partner?.name}
                    status={partner?.online ? "online" : "offline"}
                    size="md"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-baseline mb-0.5">
                      <span className="text-xs font-bold text-ink truncate">{partner?.name}</span>
                      {lastMsg && (
                        <span className="text-[9px] text-ink/40 shrink-0">
                          {formatTime(lastMsg.sentAt)}
                        </span>
                      )}
                    </div>

                    <div className="flex justify-between items-center">
                      <p className="text-xs text-ink/50 truncate pr-2">
                        {lastMsg?.deleted
                          ? "Message was deleted"
                          : lastMsg?.type === "IMAGE"
                          ? "📷 Sent an image"
                          : lastMsg?.type === "FILE"
                          ? "📁 Sent a file"
                          : lastMsg?.content || "Start chatting..."}
                      </p>

                      {unread > 0 && (
                        <span className="flex h-5 min-w-5 px-1.5 items-center justify-center rounded-full bg-accent text-[9px] font-bold text-white shrink-0 animate-pulse">
                          {unread}
                        </span>
                      )}
                    </div>
                  </div>
                </button>
              );
            })
          )
        ) : (
          /* Message Search Tab Results */
          <div className="flex flex-col gap-1.5 p-1">
            {isSearchingMsgs ? (
              <div className="text-center py-8 text-xs text-ink/40">Searching...</div>
            ) : msgSearch.trim() === "" ? (
              <div className="text-center py-8 text-xs text-ink/30">
                Type above to search message text across all rooms
              </div>
            ) : msgResults.length === 0 ? (
              <div className="text-center py-8 text-xs text-ink/30">No messages found</div>
            ) : (
              msgResults.map((msg) => (
                <button
                  key={msg.id}
                  onClick={() => onSelectRoom(msg.chatRoomId)}
                  className="w-full p-2.5 rounded-xl text-left bg-slate-50 hover:bg-slate-100 transition border border-ink/5 flex flex-col gap-1 hover:scale-[1.01]"
                >
                  <div className="flex justify-between items-center w-full">
                    <span className="text-[10px] font-bold text-ink/70">{msg.senderName}</span>
                    <span className="text-[8px] text-ink/40">{formatTime(msg.sentAt)}</span>
                  </div>
                  <p className="text-[11px] text-ink/60 line-clamp-2 break-all">{msg.content}</p>
                </button>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default ChatSidebar;
