import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth.js";
import { useWebSocket } from "../../hooks/useWebSocket.js";
import {
  useGroup,
  useGroupMembers,
  usePendingJoinRequests,
  useApproveJoinRequest,
  useRejectJoinRequest,
  useJoinGroup,
  useLeaveGroup,
  useRemoveMember,
  usePromoteToAdmin,
  useTransferOwnership,
  useRequestToJoinGroup,
  useDeleteGroup,
} from "../../hooks/useGroups.js";
import {
  useGroupChatHistory,
  useMarkGroupAsRead,
} from "../../hooks/useGroupChat.js";
import { groupSocket } from "../../websocket/groupSocket.js";
import { useToast } from "../../hooks/useToast.js";
import Avatar from "../../components/common/Avatar.jsx";
import Badge from "../../components/common/Badge.jsx";
import Spinner from "../../components/common/Spinner.jsx";
import Button from "../../components/common/Button.jsx";
import GroupMemberList from "../../components/groups/GroupMemberList.jsx";
import JoinRequestList from "../../components/groups/JoinRequestList.jsx";
import MessageBubble from "../../components/chat/MessageBubble.jsx";
import ChatInput from "../../components/chat/ChatInput.jsx";
import ConfirmDialog from "../../components/common/ConfirmDialog.jsx";
import { useQueryClient } from "@tanstack/react-query";
import JoinRequestModal from "../../components/groups/JoinRequestModal.jsx";

export function GroupDetail() {
  const { id } = useParams();
  const groupId = parseInt(id, 10);
  const navigate = useNavigate();
  const toast = useToast();
  const { user } = useAuth();
  const { subscribe, send } = useWebSocket();
  const queryClient = useQueryClient();

  const [activeTab, setActiveTab] = useState("chat"); // "chat" | "members" | "requests"
  const [messages, setMessages] = useState([]);
  const [typingUsers, setTypingUsers] = useState({}); // e.g. { userId: name }
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [leaveDialogOpen, setLeaveDialogOpen] = useState(false);
  const [requestModalOpen, setRequestModalOpen] = useState(false);
  const chatScrollRef = useRef(null);

  // Queries
  const { data: group, isLoading: groupLoading, error: groupError } = useGroup(groupId);

  const isMember = group?.myRole !== null && group?.myRole !== undefined;
  const isOwner = group?.myRole === "OWNER";
  const isAdmin = group?.myRole === "ADMIN";
  const showManageTab = isOwner || isAdmin;

  const { data: membersPage, isLoading: membersLoading } = useGroupMembers(groupId, { size: 100 }, { enabled: isMember });
  const { data: requestsPage } = usePendingJoinRequests(groupId, { size: 100 }, { enabled: isMember && showManageTab });
  const { data: chatHistory } = useGroupChatHistory(groupId, {}, { enabled: isMember });

  // Mutations
  const joinGroupMutation = useJoinGroup();
  const leaveGroupMutation = useLeaveGroup();
  const deleteGroupMutation = useDeleteGroup();
  const requestJoinMutation = useRequestToJoinGroup(groupId);
  const removeMemberMutation = useRemoveMember(groupId);
  const promoteAdminMutation = usePromoteToAdmin(groupId);
  const transferOwnerMutation = useTransferOwnership(groupId);
  const approveReqMutation = useApproveJoinRequest(groupId);
  const rejectReqMutation = useRejectJoinRequest(groupId);
  const markReadMutation = useMarkGroupAsRead();

  // Sync REST chat history to local state
  useEffect(() => {
    if (chatHistory?.content && isMember) {
      setMessages(chatHistory.content);
      // Mark read REST
      markReadMutation.mutate(groupId);
    }
  }, [chatHistory?.content, isMember, groupId]);

  // Scroll to bottom of chat feed
  useEffect(() => {
    if (chatScrollRef.current) {
      chatScrollRef.current.scrollTop = chatScrollRef.current.scrollHeight;
    }
  }, [messages, typingUsers]);

  // Subscribe to real-time Group Chat STOMP events
  useEffect(() => {
    if (!isMember) return;

    let unsubscribeMsg = () => {};
    let unsubscribeTyping = () => {};
    let unsubscribeRead = () => {};

    // 1. Subscribe to group messages topic
    unsubscribeMsg = subscribe(`/topic/group.${groupId}`, (frame) => {
      try {
        const newMsg = JSON.parse(frame.body);
        setMessages((prev) => {
          if (prev.some((m) => m.id === newMsg.id)) return prev;
          return [...prev, newMsg];
        });
        // Send read receipt
        groupSocket.sendGroupReadReceipt(send, groupId);
      } catch (err) {
        console.error("Failed to parse incoming group message", err);
      }
    });

    // 2. Subscribe to typing indicator topic
    unsubscribeTyping = subscribe(`/topic/group.${groupId}.typing`, (frame) => {
      try {
        const event = JSON.parse(frame.body);
        if (event.senderId !== user?.id) {
          // Find user name from members page
          const membersList = membersPage?.content || [];
          const member = membersList.find((m) => m.userId === event.senderId);
          const name = member?.userName || "Someone";

          setTypingUsers((prev) => {
            const next = { ...prev };
            if (event.typing) {
              next[event.senderId] = name;
            } else {
              delete next[event.senderId];
            }
            return next;
          });
        }
      } catch (err) {
        console.error("Failed to parse group typing event", err);
      }
    });

    // 3. Subscribe to read receipts
    unsubscribeRead = subscribe(`/topic/group.${groupId}.read`, (frame) => {
      try {
        const receipt = JSON.parse(frame.body);
        // Invalidate chat history to sync readCounts
        queryClient.invalidateQueries({ queryKey: ["groupChatHistory", groupId] });
      } catch (err) {
        console.error("Failed to parse read receipt", err);
      }
    });

    return () => {
      unsubscribeMsg();
      unsubscribeTyping();
      unsubscribeRead();
    };
  }, [groupId, isMember, subscribe, send, user?.id, membersPage, queryClient]);

  const handleJoinGroup = async () => {
    try {
      if (group?.isPrivate) {
        setRequestModalOpen(true);
      } else {
        await joinGroupMutation.mutateAsync(groupId);
        toast.success("Joined group successfully!");
      }
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to join group");
    }
  };

  const handleRequestSubmit = async (message) => {
    try {
      await requestJoinMutation.mutateAsync({ message });
      toast.success("Join request submitted!");
      setRequestModalOpen(false);
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to submit request");
    }
  };

  const handleLeaveGroup = async () => {
    try {
      await leaveGroupMutation.mutateAsync(groupId);
      toast.success("Left group successfully");
      navigate("/groups");
    } catch (err) {
      toast.error("Failed to leave group");
    }
  };

  const handleDeleteGroup = async () => {
    try {
      await deleteGroupMutation.mutateAsync(groupId);
      toast.success("Study group deleted");
      navigate("/groups");
    } catch (err) {
      toast.error("Failed to delete study group");
    }
  };

  const handleSendMessage = (text) => {
    groupSocket.sendGroupMessage(send, groupId, text, "TEXT");
  };

  const handleSendAttachment = (url, fileName, type) => {
    groupSocket.sendGroupMessage(send, groupId, url, type, fileName);
  };

  const handleTyping = (isTyping) => {
    if (!user?.id) return;
    groupSocket.sendGroupTyping(send, groupId, user.id, isTyping);
  };

  if (groupLoading) {
    return (
      <div className="flex h-[300px] w-full items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  if (groupError || !group) {
    return (
      <div className="text-center py-12">
        <h2 className="text-lg font-bold text-ink">Group not found</h2>
        <p className="text-xs text-ink/40 mt-1">This study group may have been deleted or the URL is incorrect.</p>
        <Link to="/groups" className="mt-4 inline-block text-accent font-bold hover:underline text-xs">
          Back to Study Groups
        </Link>
      </div>
    );
  }

  const defaultBanner = "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?q=80&w=1200&auto=format&fit=crop";
  const members = membersPage?.content || [];
  const requests = requestsPage?.content || [];

  const typingNames = Object.values(typingUsers);

  return (
    <div className="flex flex-col gap-6 max-w-5xl mx-auto animate-fade-in">
      {/* Group Header Info */}
      <div className="card overflow-hidden bg-white shadow-sm border-ink/10">
        <div className="h-44 w-full relative">
          <img src={group.imageUrl || defaultBanner} alt={group.name} className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
          <div className="absolute bottom-5 left-6 right-6 flex justify-between items-end text-white">
            <div className="flex flex-col gap-1.5 min-w-0">
              <div className="flex items-center gap-2">
                <Badge variant={group.isPrivate ? "warning" : "success"}>
                  {group.isPrivate ? "Private" : "Public"}
                </Badge>
                {group.topic && (
                  <span className="text-xs font-bold text-emerald-300 uppercase tracking-wider">
                    #{group.topic}
                  </span>
                )}
              </div>
              <h1 className="text-2xl font-black truncate leading-tight font-display">{group.name}</h1>
            </div>

            {isMember ? (
              <div className="flex gap-2">
                {showManageTab && (
                  <Link to={`/groups/${groupId}/edit`}>
                    <Button variant="outline" size="sm" className="bg-white/10 text-white border-white/20 hover:bg-white/20">
                      Manage Metadata
                    </Button>
                  </Link>
                )}
                {!isOwner && (
                  <Button
                    variant="danger"
                    size="sm"
                    onClick={() => setLeaveDialogOpen(true)}
                  >
                    Leave Group
                  </Button>
                )}
                {isOwner && (
                  <Button
                    variant="danger"
                    size="sm"
                    onClick={() => setDeleteDialogOpen(true)}
                  >
                    Delete Group
                  </Button>
                )}
              </div>
            ) : (
              <Button
                variant="primary"
                size="sm"
                onClick={handleJoinGroup}
                loading={joinGroupMutation.isPending || requestJoinMutation.isPending}
              >
                {group.isPrivate ? "Request to Join" : "Join Study Group"}
              </Button>
            )}
          </div>
        </div>

        <div className="p-5 border-t border-ink/8 text-xs text-ink/75 bg-slate-50/50">
          <p className="leading-relaxed">{group.description || "No description provided for this group."}</p>
        </div>
      </div>

      {/* Main Tabs Layout */}
      {!isMember ? (
        <div className="card p-8 text-center bg-white flex flex-col items-center justify-center gap-4 border-ink/10 shadow-sm min-h-[200px]">
          <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center text-ink/30">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <div className="max-w-xs">
            <h3 className="text-sm font-bold text-ink mb-1">Access Restricted</h3>
            <p className="text-xs text-ink/40 leading-relaxed mb-3">
              You must be a member of this study group to explore the conversations and resources.
            </p>
            <Button
              variant="primary"
              size="sm"
              onClick={handleJoinGroup}
              loading={joinGroupMutation.isPending || requestJoinMutation.isPending}
            >
              {group.isPrivate ? "Submit Join Request" : "Join Group Now"}
            </Button>
          </div>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {/* Tab buttons */}
          <div className="flex border-b border-ink/8">
            <button
              onClick={() => setActiveTab("chat")}
              className={`px-5 py-3 text-xs font-semibold uppercase tracking-wider border-b-2 transition-all ${
                activeTab === "chat"
                  ? "border-accent text-accent"
                  : "border-transparent text-ink/50 hover:text-ink"
              }`}
            >
              Chat Feed
            </button>
            <button
              onClick={() => setActiveTab("members")}
              className={`px-5 py-3 text-xs font-semibold uppercase tracking-wider border-b-2 transition-all ${
                activeTab === "members"
                  ? "border-accent text-accent"
                  : "border-transparent text-ink/50 hover:text-ink"
              }`}
            >
              Members ({members.length})
            </button>
            {showManageTab && group.isPrivate && (
              <button
                onClick={() => setActiveTab("requests")}
                className={`px-5 py-3 text-xs font-semibold uppercase tracking-wider border-b-2 transition-all ${
                  activeTab === "requests"
                    ? "border-accent text-accent"
                    : "border-transparent text-ink/50 hover:text-ink"
                }`}
              >
                Join Requests ({requests.length})
              </button>
            )}
          </div>

          {/* Active Tab Panel */}
          {activeTab === "chat" && (
            <div className="flex flex-col h-[calc(100vh-280px)] rounded-3xl border border-ink/8 bg-slate-50 overflow-hidden">
              <div
                ref={chatScrollRef}
                className="flex-1 overflow-y-auto p-4 flex flex-col gap-4"
              >
                {messages.length === 0 ? (
                  <div className="text-center py-12 text-ink/30 text-xs my-auto">
                    Start the study group discussion!
                  </div>
                ) : (
                  messages.map((msg) => (
                    <MessageBubble
                      key={msg.id || `${msg.sentAt}-${msg.senderId}`}
                      message={msg}
                      currentUserId={user?.id}
                      showSenderName={true}
                    />
                  ))
                )}

                {/* Typing status */}
                {typingNames.length > 0 && (
                  <div className="flex items-center gap-2 text-ink/40 text-xs ml-2">
                    <span className="font-semibold">{typingNames.join(", ")}</span>{" "}
                    {typingNames.length === 1 ? "is" : "are"} typing
                    <span className="flex gap-0.5 items-center">
                      <span className="w-1.5 h-1.5 bg-ink/40 rounded-full animate-bounce delay-0" />
                      <span className="w-1.5 h-1.5 bg-ink/40 rounded-full animate-bounce delay-75" />
                      <span className="w-1.5 h-1.5 bg-ink/40 rounded-full animate-bounce delay-150" />
                    </span>
                  </div>
                )}
              </div>

              <ChatInput
                onSend={handleSendMessage}
                onSendAttachment={handleSendAttachment}
                onTyping={handleTyping}
              />
            </div>
          )}

          {activeTab === "members" && (
            <div className="card p-5 bg-white shadow-sm">
              {membersLoading ? (
                <div className="flex justify-center py-6">
                  <Spinner size="md" />
                </div>
              ) : (
                <GroupMemberList
                  members={members}
                  myRole={group.myRole}
                  currentUserId={user?.id}
                  onRemoveMember={(uid) => removeMemberMutation.mutate(uid)}
                  onPromoteMember={(uid) => promoteAdminMutation.mutate(uid)}
                  onTransferOwnership={(uid) => transferOwnerMutation.mutate(uid)}
                />
              )}
            </div>
          )}

          {activeTab === "requests" && showManageTab && (
            <div className="card p-5 bg-white shadow-sm">
              <JoinRequestList
                requests={requests}
                onApprove={(rid) => approveReqMutation.mutate(rid)}
                onReject={(rid) => rejectReqMutation.mutate(rid)}
                processingId={approveReqMutation.variables || rejectReqMutation.variables}
              />
            </div>
          )}
        </div>
      )}

      {/* dialogs */}
      <ConfirmDialog
        isOpen={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        onConfirm={handleDeleteGroup}
        title="Delete Study Group"
        message="Are you sure you want to permanently delete this study group? This will erase all member lists and chat archives."
        loading={deleteGroupMutation.isPending}
      />

      <ConfirmDialog
        isOpen={leaveDialogOpen}
        onClose={() => setLeaveDialogOpen(false)}
        onConfirm={handleLeaveGroup}
        title="Leave Study Group"
        message="Are you sure you want to leave this study group?"
        loading={leaveGroupMutation.isPending}
      />

      <JoinRequestModal
        isOpen={requestModalOpen}
        onClose={() => setRequestModalOpen(false)}
        onSubmit={handleRequestSubmit}
        loading={requestJoinMutation.isPending}
        groupName={group?.name}
      />
    </div>
  );
}

export default GroupDetail;
