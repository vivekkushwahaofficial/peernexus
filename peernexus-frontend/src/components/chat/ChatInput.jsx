import React, { useState, useRef, useEffect } from "react";
import { cloudinaryService } from "../../services/cloudinaryService.js";
import Spinner from "../common/Spinner.jsx";

export function ChatInput({ onSend, onSendAttachment, onTyping }) {
  const [text, setText] = useState("");
  const [uploading, setUploading] = useState(false);
  const typingTimeoutRef = useRef(null);
  const isTypingRef = useRef(false);
  const fileInputRef = useRef(null);

  const handleTextChange = (e) => {
    const value = e.target.value;
    setText(value);

    if (onTyping) {
      if (!isTypingRef.current && value.trim().length > 0) {
        isTypingRef.current = true;
        onTyping(true);
      }

      // Reset inactive typing timer
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = setTimeout(() => {
        isTypingRef.current = false;
        onTyping(false);
      }, 2000);
    }
  };

  const handleSend = (e) => {
    e.preventDefault();
    if (!text.trim()) return;

    onSend(text.trim());
    setText("");

    if (onTyping && isTypingRef.current) {
      isTypingRef.current = false;
      onTyping(false);
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    }
  };

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const url = await cloudinaryService.uploadFile(file);
      const isImg = file.type.startsWith("image/");
      const type = isImg ? "IMAGE" : "FILE";
      onSendAttachment(url, file.name, type);
    } catch (err) {
      console.error("Failed to upload file attachment:", err);
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    };
  }, []);

  return (
    <div className="border-t border-ink/8 bg-white flex flex-col shrink-0">
      {uploading && (
        <div className="flex items-center gap-2 px-4 py-2 bg-accent/5 border-b border-accent/10 text-xs text-accent animate-pulse font-medium">
          <Spinner size="xs" />
          <span>Uploading attachment to secure cloud...</span>
        </div>
      )}
      <form onSubmit={handleSend} className="p-4 flex items-center gap-3">
        {/* File Attachment Trigger */}
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
          className="flex items-center justify-center p-2 rounded-xl text-ink/40 hover:bg-slate-100 hover:text-ink transition shrink-0 disabled:opacity-50"
        >
          {uploading ? (
            <Spinner size="xs" />
          ) : (
            <svg className="w-5.5 h-5.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
            </svg>
          )}
        </button>
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          className="hidden"
        />

        {/* Input Text Box */}
        <input
          type="text"
          placeholder="Type a message..."
          value={text}
          onChange={handleTextChange}
          disabled={uploading}
          className="flex-1 bg-slate-50 border border-ink/10 rounded-2xl px-4 py-2.5 text-sm text-ink placeholder:text-ink/40 outline-none focus:border-accent focus:bg-white transition"
        />

        {/* Send Button */}
        <button
          type="submit"
          disabled={!text.trim() || uploading}
          className="flex items-center justify-center p-2.5 rounded-2xl bg-accent hover:bg-accent/90 text-white shadow-md shadow-accent/20 transition disabled:opacity-40 disabled:shadow-none"
        >
          <svg className="w-5 h-5 transform rotate-90" fill="currentColor" viewBox="0 0 20 20">
            <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
          </svg>
        </button>
      </form>
    </div>
  );
}

export default ChatInput;
