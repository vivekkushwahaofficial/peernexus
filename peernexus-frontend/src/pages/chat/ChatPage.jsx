import React, { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth.js";
import { useWebSocket } from "../../hooks/useWebSocket.js";
import { useChatRooms, useChatHistory, useMarkChatAsRead } from "../../hooks/useChat.js";
import { chatSocket } from "../../websocket/chatSocket.js";
import { chatService } from "../../services/chatService.js";
import ChatSidebar from "../../components/chat/ChatSidebar.jsx";
import ChatWindow from "../../components/chat/ChatWindow.jsx";
import Spinner from "../../components/common/Spinner.jsx";
import { useQueryClient } from "@tanstack/react-query";

export function ChatPage() {
  const { user } = useAuth();
  const { subscribe, send } = useWebSocket();
  const [searchParams, setSearchParams] = useSearchParams();
  const queryRoomId = searchParams.get("room");
  const queryClient = useQueryClient();

  const [activeRoomId, setActiveRoomId] = useState(queryRoomId ? parseInt(queryRoomId, 10) : null);
  const [messages, setMessages] = useState([]);
  const [pinnedMessages, setPinnedMessages] = useState([]);
  const [typingUser, setTypingUser] = useState(null);

  // Queries
  const { data: rooms = [], isLoading: roomsLoading } = useChatRooms();
  const { data: historyData, isLoading: historyLoading } = useChatHistory(activeRoomId);
  const history = historyData?.content || [];

  const markReadMutation = useMarkChatAsRead();

  // Sync state if URL search param changes
  useEffect(() => {
    if (queryRoomId) {
      const parsed = parseInt(queryRoomId, 10);
      if (parsed !== activeRoomId) {
        setActiveRoomId(parsed);
      }
    }
  }, [queryRoomId, activeRoomId]);

  // When room is selected, load history to local state
  useEffect(() => {
    if (history) {
      setMessages(history);
    }
  }, [history]);

  // Load pinned messages when room changes
  useEffect(() => {
    if (activeRoomId) {
      chatService.getPinnedMessages(activeRoomId)
        .then(setPinnedMessages)
        .catch((err) => console.error("Failed to load pinned messages", err));
    } else {
      setPinnedMessages([]);
    }
  }, [activeRoomId]);

  // Mark as read when the active room changes
  useEffect(() => {
    if (activeRoomId) {
      markReadMutation.mutate(activeRoomId);
    }
  }, [activeRoomId]);

  // Dynamic presence status subscription
  const activeRoom = rooms.find((r) => r.roomId === activeRoomId);

  useEffect(() => {
    if (!activeRoomId || !activeRoom) return;
    const partnerId = activeRoom.otherUser?.id;
    if (!partnerId) return;

    const unsubscribeStatus = subscribe(`/topic/status/${partnerId}`, (frame) => {
      try {
        const event = JSON.parse(frame.body);
        queryClient.setQueryData(["chatRooms"], (oldRooms) => {
          if (!oldRooms) return oldRooms;
          return oldRooms.map((r) => {
            if (r.otherUser?.id === partnerId) {
              return {
                ...r,
                otherUser: {
                  ...r.otherUser,
                  online: event.online,
                  lastSeen: new Date().toISOString(),
                },
              };
            }
            return r;
          });
        });
      } catch (err) {
        console.error("Failed to parse status update", err);
      }
    });

    return () => {
      unsubscribeStatus();
    };
  }, [activeRoomId, activeRoom, subscribe, queryClient]);

  // Subscribe to real-time events on WebSocket mount
  useEffect(() => {
    let unsubscribeMsg = () => {};
    let unsubscribeTyping = () => {};
    let unsubscribeRead = () => {};
    let unsubscribeReactions = () => {};
    let unsubscribePins = () => {};

    // 1. Subscribe to Private Messages
    unsubscribeMsg = subscribe("/user/queue/messages", (frame) => {
      try {
        const newMsg = JSON.parse(frame.body);
        if (newMsg.chatRoomId === activeRoomId) {
          setMessages((prev) => {
            // Update if already exists (handles edits / deletes)
            if (prev.some((m) => m.id === newMsg.id)) {
              return prev.map((m) => (m.id === newMsg.id ? newMsg : m));
            }
            return [...prev, newMsg];
          });
          // Mark read over STOMP
          chatSocket.sendReadReceipt(send, activeRoomId);
        }
        // Invalidate sidebar to pull last message
        queryClient.invalidateQueries({ queryKey: ["chatRooms"] });
      } catch (err) {
        console.error("Failed to parse incoming STOMP message", err);
      }
    });

    // 2. Subscribe to Typing Events
    unsubscribeTyping = subscribe("/user/queue/typing", (frame) => {
      try {
        const event = JSON.parse(frame.body);
        if (event.chatRoomId === activeRoomId) {
          const roomObj = rooms.find((r) => r.roomId === activeRoomId);
          const partner = roomObj?.otherUser;
          
          if (event.typing) {
            setTypingUser({ name: partner?.name || "Partner", typing: true });
          } else {
            setTypingUser(null);
          }
        }
      } catch (err) {
        console.error("Failed to parse typing event", err);
      }
    });

    // 3. Subscribe to Read Receipts
    unsubscribeRead = subscribe("/user/queue/read-receipt", (frame) => {
      try {
        const receipt = JSON.parse(frame.body);
        if (receipt.chatRoomId === activeRoomId) {
          setMessages((prev) =>
            prev.map((m) => (m.senderId === user?.id ? { ...m, status: "READ", readAt: receipt.readAt } : m))
          );
        }
      } catch (err) {
        console.error("Failed to parse read receipt", err);
      }
    });

    // 4. Subscribe to Reactions
    unsubscribeReactions = subscribe("/user/queue/reactions", (frame) => {
      try {
        const event = JSON.parse(frame.body);
        if (event.chatRoomId === activeRoomId) {
          setMessages((prev) =>
            prev.map((m) =>
              m.id === event.messageId ? { ...m, reactions: event.reactions } : m
            )
          );
        }
      } catch (err) {
        console.error("Failed to parse reaction event", err);
      }
    });

    // 5. Subscribe to Pin updates
    unsubscribePins = subscribe("/user/queue/pins", (frame) => {
      try {
        const pinMsg = JSON.parse(frame.body);
        if (pinMsg.chatRoomId === activeRoomId) {
          setMessages((prev) =>
            prev.map((m) => (m.id === pinMsg.id ? { ...m, pinned: pinMsg.pinned } : m))
          );
          setPinnedMessages((prev) => {
            if (pinMsg.pinned) {
              if (prev.some((m) => m.id === pinMsg.id)) return prev;
              return [...prev, pinMsg];
            } else {
              return prev.filter((m) => m.id !== pinMsg.id);
            }
          });
        }
      } catch (err) {
        console.error("Failed to parse pin update", err);
      }
    });

    return () => {
      unsubscribeMsg();
      unsubscribeTyping();
      unsubscribeRead();
      unsubscribeReactions();
      unsubscribePins();
    };
  }, [activeRoomId, subscribe, send, rooms, user?.id, queryClient]);

  const handleSelectRoom = (roomId) => {
    setActiveRoomId(roomId);
    setSearchParams({ room: roomId });
    setTypingUser(null);
  };

  const handleSendMessage = (text) => {
    if (!activeRoomId) return;
    chatSocket.sendPrivateMessage(send, activeRoomId, text, "TEXT");
  };

  const handleSendAttachment = (url, fileName, type) => {
    if (!activeRoomId) return;
    chatSocket.sendPrivateMessage(send, activeRoomId, url, type, fileName);
  };

  const handleTyping = (isTyping) => {
    if (!activeRoomId || !user?.id) return;
    chatSocket.sendTypingEvent(send, activeRoomId, user.id, isTyping);
  };

  const handleReaction = (messageId, emoji) => {
    chatSocket.sendReaction(send, messageId, emoji);
  };

  const handleEdit = (messageId, newContent) => {
    chatSocket.sendEdit(send, messageId, newContent);
  };

  const handleDeleteForEveryone = (messageId) => {
    chatSocket.sendDeleteForEveryone(send, messageId);
  };

  const handleDeleteForMe = async (messageId) => {
    try {
      await chatService.deleteMessageForMe(messageId);
      setMessages((prev) => prev.filter((m) => m.id !== messageId));
      setPinnedMessages((prev) => prev.filter((m) => m.id !== messageId));
    } catch (err) {
      console.error("Failed to delete message for me:", err);
    }
  };

  const handlePinToggle = async (messageId) => {
    try {
      await chatService.togglePinMessage(messageId);
    } catch (err) {
      console.error("Failed to toggle pin status:", err);
    }
  };

  return (
    <div className="flex flex-col md:flex-row gap-6 animate-fade-in">
      {roomsLoading ? (
        <div className="flex h-[300px] w-full items-center justify-center">
          <Spinner size="lg" />
        </div>
      ) : (
        <>
          <ChatSidebar
            rooms={rooms}
            activeRoomId={activeRoomId}
            currentUserId={user?.id}
            onSelectRoom={handleSelectRoom}
          />

          <div className="flex-1 flex flex-col h-[calc(100vh-140px)]">
            {historyLoading ? (
              <div className="flex-1 flex items-center justify-center bg-slate-50 border border-ink/8 rounded-2xl">
                <Spinner size="md" />
              </div>
            ) : (
              <ChatWindow
                room={activeRoom}
                messages={messages}
                currentUserId={user?.id}
                typingUser={typingUser}
                pinnedMessages={pinnedMessages}
                onSendMessage={handleSendMessage}
                onSendAttachment={handleSendAttachment}
                onTyping={handleTyping}
                onReaction={handleReaction}
                onEdit={handleEdit}
                onDeleteForMe={handleDeleteForMe}
                onDeleteForEveryone={handleDeleteForEveryone}
                onPinToggle={handlePinToggle}
              />
            )}
          </div>
        </>
      )}
    </div>
  );
}

export default ChatPage;
