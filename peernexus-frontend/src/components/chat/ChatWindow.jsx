import React, { useEffect, useRef, useState } from "react";
import MessageBubble from "./MessageBubble.jsx";
import ChatInput from "./ChatInput.jsx";
import Avatar from "../common/Avatar.jsx";

export function ChatWindow({
  room,
  messages = [],
  currentUserId,
  typingUser,
  pinnedMessages = [],
  onSendMessage,
  onSendAttachment,
  onTyping,
  onReaction,
  onEdit,
  onDeleteForMe,
  onDeleteForEveryone,
  onPinToggle,
  onBack,
}) {
  const scrollRef = useRef(null);
  const [showPinnedDropdown, setShowPinnedDropdown] = useState(false);

  const partner = room?.otherUser
    ? {
        id: room.otherUser.id,
        name: room.otherUser.name,
        avatarUrl: room.otherUser.profilePicture,
        online: room.otherUser.online,
        lastSeen: room.otherUser.lastSeen,
      }
    : null;

  // Auto scroll to bottom on new message or typing indicator
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages.length, typingUser]);

  const formatLastSeen = (lastSeenStr) => {
    if (!lastSeenStr) return "Offline";
    const lastSeenDate = new Date(lastSeenStr);
    const now = new Date();
    const diffMs = now - lastSeenDate;
    const diffMins = Math.floor(diffMs / 60000);
    if (diffMins < 1) return "Last seen just now";
    if (diffMins < 60) return `Last seen ${diffMins}m ago`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `Last seen ${diffHours}h ago`;
    return `Last seen on ${lastSeenDate.toLocaleDateString(undefined, { month: "short", day: "numeric" })}`;
  };

  const jumpToMessage = (msgId) => {
    const el = document.getElementById(`msg-${msgId}`);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "center" });
      el.classList.add("bg-amber-100", "scale-[1.02]", "p-1", "rounded-2xl");
      setTimeout(() => {
        el.classList.remove("bg-amber-100", "scale-[1.02]", "p-1", "rounded-2xl");
      }, 2000);
    }
    setShowPinnedDropdown(false);
  };

  if (!room) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center bg-slate-50/50 text-center p-6 h-[calc(100vh-140px)] rounded-2xl border border-ink/5 shadow-sm">
        <div className="w-14 h-14 rounded-2xl bg-ink/5 flex items-center justify-center text-ink/30 mb-4">
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
        </div>
        <h3 className="text-sm font-bold text-ink mb-1.5">Select a Conversation</h3>
        <p className="text-xs text-ink/40 max-w-xs leading-relaxed font-medium">
          Choose a user from the sidebar or click connect on a profile to start chatting.
        </p>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col h-[calc(100vh-140px)] rounded-2xl border border-ink/5 bg-slate-50/50 overflow-hidden relative">
      {/* Header */}
      <div className="bg-white border-b border-ink/5 p-4 flex items-center gap-3 shrink-0 shadow-sm z-10">
        {onBack && (
          <button
            onClick={onBack}
            className="md:hidden p-2 rounded-xl text-ink/40 hover:bg-ink/5 hover:text-ink transition-all focus:outline-none shrink-0 cursor-pointer"
            aria-label="Back to conversations list"
          >
            <svg className="w-5.5 h-5.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
        )}
        <Avatar src={partner?.avatarUrl} name={partner?.name} status={partner?.online ? "online" : "offline"} size="md" />
        <div className="flex flex-col">
          <span className="text-xs font-bold text-ink">{partner?.name}</span>
          <span className="text-[10px] text-ink/40 font-medium">
            {partner?.online ? (
              <span className="text-accent font-bold flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-accent animate-ping inline-block" />
                Active now
              </span>
            ) : (
              formatLastSeen(partner?.lastSeen)
            )}
          </span>
        </div>
      </div>

      {/* Pinned Messages Bar */}
      {pinnedMessages.length > 0 && (
        <div className="bg-amber-50/90 backdrop-blur-sm border-b border-amber-200/50 px-4 py-2 flex items-center justify-between shrink-0 text-xs text-amber-800 z-10 transition-all">
          <div className="flex items-center gap-2 font-bold">
            <span>📌</span>
            <span>
              {pinnedMessages.length} Pinned message{pinnedMessages.length > 1 ? "s" : ""}
            </span>
          </div>
          <div className="relative">
            <button
              onClick={() => setShowPinnedDropdown((prev) => !prev)}
              className="text-[11px] font-bold underline hover:text-amber-950 transition cursor-pointer"
            >
              {showPinnedDropdown ? "Hide" : "View"}
            </button>

            {showPinnedDropdown && (
              <div className="absolute right-0 top-full mt-2 w-64 bg-white border border-ink/5 rounded-xl shadow-xl p-2 z-50 flex flex-col gap-1 text-ink">
                <span className="text-[10px] font-bold text-ink/40 px-2 py-1 uppercase tracking-wider">
                  Pinned Messages
                </span>
                <div className="max-h-40 overflow-y-auto flex flex-col gap-0.5">
                  {pinnedMessages.map((msg) => (
                    <button
                      key={msg.id}
                      onClick={() => jumpToMessage(msg.id)}
                      className="w-full text-left p-2 hover:bg-slate-50 rounded-lg text-xs transition truncate border-b border-ink/5 last:border-b-0 cursor-pointer"
                    >
                      <div className="flex justify-between items-center mb-0.5 text-[9px] text-ink/40 font-semibold">
                        <span>{msg.senderName}</span>
                        <span>{new Date(msg.sentAt).toLocaleDateString()}</span>
                      </div>
                      <span className="text-ink/75">
                        {msg.type === "IMAGE" ? "📷 Image attachment" : msg.type === "FILE" ? "📁 File attachment" : msg.content}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Message Feed Area */}
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-4 flex flex-col gap-4"
      >
        {messages.length === 0 ? (
          <div className="text-center py-12 text-ink/30 text-xs my-auto font-medium">
            Say hello to start the conversation!
          </div>
        ) : (
          messages.map((msg) => (
            <MessageBubble
              key={msg.id || `${msg.sentAt}-${msg.senderId}`}
              message={msg}
              currentUserId={currentUserId}
              onReaction={onReaction}
              onEdit={onEdit}
              onDeleteForMe={onDeleteForMe}
              onDeleteForEveryone={onDeleteForEveryone}
              onPinToggle={onPinToggle}
            />
          ))
        )}

        {/* Typing event */}
        {typingUser && typingUser.typing && (
          <div className="flex items-center gap-2 text-ink/40 text-xs ml-2 animate-pulse font-medium">
            <span className="font-semibold">{typingUser.name}</span> is typing
            <span className="flex gap-0.5 items-center">
              <span className="w-1 h-1 bg-ink/40 rounded-full animate-bounce delay-0" />
              <span className="w-1.5 h-1.5 bg-ink/40 rounded-full animate-bounce delay-75" />
              <span className="w-1 h-1 bg-ink/40 rounded-full animate-bounce delay-150" />
            </span>
          </div>
        )}
      </div>

      {/* Input composition */}
      <ChatInput
        onSend={onSendMessage}
        onSendAttachment={onSendAttachment}
        onTyping={onTyping}
      />
    </div>
  );
}

export default ChatWindow;
