import React, { useState } from "react";
import Avatar from "../common/Avatar.jsx";

export function MessageBubble({
  message,
  currentUserId,
  showSenderName = false,
  onReaction,
  onEdit,
  onDeleteForMe,
  onDeleteForEveryone,
  onPinToggle,
}) {
  if (!message) return null;

  const {
    id,
    senderId,
    senderName,
    senderProfilePicture,
    content,
    type,
    fileName,
    fileSize,
    mimeType,
    sentAt,
    status,
    reactions = [],
    edited,
    pinned,
    deleted,
  } = message;

  const isMe = senderId === currentUserId;
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(content || "");
  const [showMenu, setShowMenu] = useState(false);
  const [lightboxOpen, setLightboxOpen] = useState(false);

  const formatTime = (isoStr) => {
    if (!isoStr) return "";
    const date = new Date(isoStr);
    return date.toLocaleTimeString(undefined, {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatBytes = (bytes) => {
    if (bytes === 0 || !bytes) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
  };

  const ageMs = Date.now() - new Date(sentAt).getTime();
  const canEdit = isMe && !deleted && type === "TEXT" && ageMs < 900000; // 15 mins
  const canDeleteForEveryone = isMe && !deleted && ageMs < 3600000; // 1 hour

  // Reactions calculations
  const reactionCounts = reactions.reduce((acc, r) => {
    acc[r.reaction] = (acc[r.reaction] || 0) + 1;
    return acc;
  }, {});

  const myReactions = reactions
    .filter((r) => r.userId === currentUserId)
    .map((r) => r.reaction);

  const handleEditSubmit = (e) => {
    e.preventDefault();
    if (editText.trim() && editText.trim() !== content) {
      onEdit(id, editText.trim());
    }
    setIsEditing(false);
  };

  const reactionEmojis = ["👍", "❤️", "😂", "😮", "😢", "🙏"];

  return (
    <div
      id={`msg-${id}`}
      className={`group relative flex items-start gap-2.5 max-w-[85%] md:max-w-[70%] cursor-pointer transition-all duration-300 ${
        isMe ? "ml-auto flex-row-reverse" : "mr-auto"
      }`}
      onClick={() => setShowMenu((prev) => !prev)}
      onMouseEnter={() => setShowMenu(true)}
      onMouseLeave={() => {
        setShowMenu(false);
      }}
    >
      {/* Show other user avatar */}
      {!isMe && (
        <Avatar
          src={senderProfilePicture}
          name={senderName || "User"}
          size="sm"
          className="mt-0.5"
        />
      )}

      <div className="flex flex-col gap-1 w-full min-w-0">
        {/* Sender display name for group chat or distinct visual info */}
        {!isMe && showSenderName && senderName && (
          <span className="text-[10px] font-bold text-ink/50 px-1">{senderName}</span>
        )}

        {/* Message body container */}
        <div className="relative flex items-center gap-1.5 w-full min-w-0">
          <div
            className={`w-full px-4 py-2.5 rounded-2xl text-sm shadow-sm transition-colors duration-200 ${
              deleted
                ? "italic bg-slate-50 text-slate-400 border border-ink/5"
                : isMe
                ? "bg-accent text-white rounded-tr-none shadow-sm shadow-accent/15"
                : "bg-white text-ink border border-ink/5 rounded-tl-none shadow-[0_2px_8px_rgba(16,21,26,0.02)]"
            } ${pinned ? "border-l-4 border-l-amber-500" : ""}`}
          >
            {/* Pinned visual indicator */}
            {pinned && !deleted && (
              <div className="flex items-center gap-1.5 text-[9px] mb-1.5 opacity-80 font-bold uppercase tracking-wider">
                <span>📌 Pinned Message</span>
              </div>
            )}

            {deleted ? (
              <span>This message was deleted</span>
            ) : isEditing ? (
              <form onSubmit={handleEditSubmit} className="flex flex-col gap-2">
                <input
                  type="text"
                  value={editText}
                  onChange={(e) => setEditText(e.target.value)}
                  className="w-full bg-black/10 border border-white/20 rounded-lg px-2.5 py-1 text-xs text-white outline-none focus:border-white focus:ring-2 focus:ring-white/20 transition-all"
                  autoFocus
                />
                <div className="flex gap-2 justify-end text-[10px]">
                  <button
                    type="button"
                    onClick={() => setIsEditing(false)}
                    className="opacity-75 hover:opacity-100 font-semibold cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button type="submit" className="font-bold underline cursor-pointer">
                    Save
                  </button>
                </div>
              </form>
            ) : type === "IMAGE" ? (
              <div className="relative">
                <img
                  src={content}
                  alt="chat attachment"
                  onClick={() => setLightboxOpen(true)}
                  className="max-w-full sm:max-w-[280px] max-h-[200px] object-cover rounded-xl mt-1 cursor-zoom-in hover:scale-101 hover:brightness-95 transition-all duration-300"
                />
                {edited && (
                  <span className="absolute bottom-1 right-1 text-[8px] opacity-60 bg-black/40 text-white px-1.5 py-0.5 rounded">
                    edited
                  </span>
                )}
              </div>
            ) : type === "FILE" ? (
              <div className="relative">
                <a
                  href={content}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`flex items-center gap-3 p-2.5 rounded-xl border transition mt-1 max-w-[280px] ${
                    isMe
                      ? "bg-white/10 border-white/20 hover:bg-white/20 text-white"
                      : "bg-slate-50 border-ink/5 hover:bg-slate-100 text-ink"
                  }`}
                >
                  <div className="p-2 bg-accent/10 rounded-lg shrink-0">
                    <svg className="w-5 h-5 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <div className="flex flex-col min-w-0">
                    <span className="text-xs font-semibold truncate max-w-[150px]">
                      {fileName || "attachment.bin"}
                    </span>
                    <span className="text-[10px] opacity-75">
                      {formatBytes(fileSize)} • {mimeType?.split("/")[1]?.toUpperCase() || "BIN"}
                    </span>
                  </div>
                </a>
                {edited && (
                  <span className="absolute bottom-1 right-1 text-[8px] opacity-60 bg-black/40 text-white px-1.5 py-0.5 rounded">
                    edited
                  </span>
                )}
              </div>
            ) : (
              <div className="relative">
                <p className="whitespace-pre-wrap break-words leading-relaxed">{content}</p>
                {edited && (
                  <span className="text-[8px] opacity-60 ml-1.5 align-bottom inline-block">
                    (edited)
                  </span>
                )}
              </div>
            )}
          </div>

          {/* Context Options Button (visible on hover or tap) */}
          {showMenu && !deleted && (
            <div
              onClick={(e) => e.stopPropagation()}
              className={`absolute top-1/2 -translate-y-1/2 z-10 flex flex-col sm:flex-row items-center bg-white/95 sm:bg-transparent border sm:border-0 border-ink/5 p-1 sm:p-0 rounded-2xl shadow-md sm:shadow-none gap-1.5 ${
                isMe ? "right-full mr-2" : "left-full ml-2"
              }`}
            >
              {/* Quick Reactions bar */}
              <div className="flex items-center bg-white border border-ink/5 shadow-md rounded-full px-1.5 py-0.5 gap-0.5">
                {reactionEmojis.map((emoji) => (
                  <button
                    key={emoji}
                    onClick={() => onReaction(id, emoji)}
                    className="hover:scale-125 transition text-xs cursor-pointer"
                  >
                    {emoji}
                  </button>
                ))}
              </div>

              {/* Three-dot menu */}
              <div className="relative">
                <button
                  onClick={() => setShowMenu((prev) => !prev)}
                  className="flex items-center justify-center p-1 bg-white border border-ink/5 hover:bg-slate-50 rounded-full shadow-sm text-ink/50 hover:text-ink transition cursor-pointer"
                >
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                  </svg>
                </button>

                <div className="absolute right-0 bottom-full mb-1.5 bg-white border border-ink/5 rounded-xl shadow-lg p-1 text-xs flex flex-col min-w-[125px] z-20">
                  {canEdit && (
                    <button
                      onClick={() => setIsEditing(true)}
                      className="w-full text-left px-2.5 py-1.5 hover:bg-slate-50 text-ink rounded-lg font-bold transition cursor-pointer"
                    >
                      ✏️ Edit Message
                    </button>
                  )}
                  <button
                    onClick={() => onPinToggle(id)}
                    className="w-full text-left px-2.5 py-1.5 hover:bg-slate-50 text-ink rounded-lg font-bold transition cursor-pointer"
                  >
                    📌 {pinned ? "Unpin Message" : "Pin Message"}
                  </button>
                  {canDeleteForEveryone && (
                    <button
                      onClick={() => onDeleteForEveryone(id)}
                      className="w-full text-left px-2.5 py-1.5 hover:bg-error/5 text-error rounded-lg font-bold transition cursor-pointer"
                    >
                      🗑️ Delete Everyone
                    </button>
                  )}
                  <button
                    onClick={() => onDeleteForMe(id)}
                    className="w-full text-left px-2.5 py-1.5 hover:bg-error/5 text-error/80 rounded-lg font-bold transition cursor-pointer"
                  >
                    🗑️ Delete for Me
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Reaction Badges List */}
        {reactions.length > 0 && !deleted && (
          <div className={`flex flex-wrap gap-1 mt-0.5 ${isMe ? "justify-end" : "justify-start"}`}>
            {Object.entries(reactionCounts).map(([emoji, count]) => {
              const hasReacted = myReactions.includes(emoji);
              return (
                <button
                  key={emoji}
                  onClick={() => onReaction(id, emoji)}
                  className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] border transition-all duration-200 cursor-pointer ${
                    hasReacted
                      ? "bg-accent/15 border-accent/30 text-accent font-bold scale-105 shadow-sm"
                      : "bg-white border-ink/5 text-ink/60 hover:bg-slate-50"
                  }`}
                >
                  <span>{emoji}</span>
                  <span>{count}</span>
                </button>
              );
            })}
          </div>
        )}

        {/* Meta time / read indicator */}
        <div className={`flex items-center gap-1.5 text-[9px] text-ink/40 px-1 ${isMe ? "justify-end" : ""}`}>
          <span>{formatTime(sentAt)}</span>
          {isMe && (
            <>
              {status === "READ" ? (
                // Double blue check icon for Read
                <svg className="w-3.5 h-3.5 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7m-11 5l3 3L17 8" />
                </svg>
              ) : status === "DELIVERED" ? (
                // Double grey check icon for Delivered
                <svg className="w-3.5 h-3.5 text-ink/30" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7m-11 5l3 3L17 8" />
                </svg>
              ) : (
                // Single grey check icon for Sent
                <svg className="w-3 h-3 text-ink/20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                </svg>
              )}
            </>
          )}
        </div>
      </div>

      {/* Lightbox for Images */}
      {lightboxOpen && (
        <div
          className="fixed inset-0 bg-black/90 z-[9999] flex items-center justify-center p-4 cursor-zoom-out animate-fade-in"
          onClick={() => setLightboxOpen(false)}
        >
          <img src={content} alt="Lightbox attachment" className="max-w-full max-h-full object-contain rounded-lg shadow-2xl" />
          <button
            onClick={() => setLightboxOpen(false)}
            className="absolute top-4 right-4 bg-white/10 hover:bg-white/20 text-white rounded-full p-2.5 transition"
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      )}
    </div>
  );
}

export default MessageBubble;
