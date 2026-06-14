import React from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { userService } from "../../services/userService.js";
import {
  useConnections,
  useIncomingRequests,
  useOutgoingRequests,
  useSendConnectionRequest,
  useAcceptConnectionRequest,
  useCancelConnectionRequest,
  useRemoveConnection,
} from "../../hooks/useConnections.js";
import { useOrCreateChatRoom } from "../../hooks/useChat.js";
import { useToast } from "../../hooks/useToast.js";
import Avatar from "../../components/common/Avatar.jsx";
import Badge, { RoleBadge } from "../../components/common/Badge.jsx";
import Spinner from "../../components/common/Spinner.jsx";
import Button from "../../components/common/Button.jsx";

export function PublicProfile() {
  const { id } = useParams();
  const userId = parseInt(id, 10);
  const navigate = useNavigate();
  const toast = useToast();

  const { data: targetUser, isLoading: userLoading, error: userError } = useQuery({
    queryKey: ["user", userId],
    queryFn: () => userService.getById(userId),
    enabled: Boolean(userId),
  });

  // Fetch Connection States
  const { data: connectionsPage } = useConnections({ size: 100 });
  const { data: incomingPage } = useIncomingRequests({ size: 100 });
  const { data: outgoingPage } = useOutgoingRequests({ size: 100 });

  const sendReq = useSendConnectionRequest();
  const acceptReq = useAcceptConnectionRequest();
  const cancelReq = useCancelConnectionRequest();
  const removeConn = useRemoveConnection();
  const createRoom = useOrCreateChatRoom();

  const isConnected = connectionsPage?.content?.some((c) => c.requester?.id === userId || c.recipient?.id === userId);
  const connectionRecord = connectionsPage?.content?.find((c) => c.requester?.id === userId || c.recipient?.id === userId);

  const incomingRequest = incomingPage?.content?.find((req) => req.requester?.id === userId);
  const outgoingRequest = outgoingPage?.content?.find((req) => req.recipient?.id === userId);

  const handleConnect = async () => {
    try {
      if (isConnected) {
        if (window.confirm("Are you sure you want to disconnect from this student?")) {
          await removeConn.mutateAsync(connectionRecord.id);
          toast.success("Disconnected successfully");
        }
      } else if (incomingRequest) {
        await acceptReq.mutateAsync(incomingRequest.id);
        toast.success("Connection request accepted!");
      } else if (outgoingRequest) {
        await cancelReq.mutateAsync(outgoingRequest.id);
        toast.success("Connection request cancelled");
      } else {
        await sendReq.mutateAsync(userId);
        toast.success("Connection request sent!");
      }
    } catch (err) {
      toast.error("Failed to update connection status");
    }
  };

  const handleMessage = async () => {
    try {
      const room = await createRoom.mutateAsync(userId);
      // Wait, let's see what getOrCreateRoom returns: the room ID (Long) or the room object.
      // The convention is that POST /rooms/:id/or-create returns the room ID.
      // So we navigate to `/chat` and pass the roomId
      navigate(`/chat?room=${room}`);
    } catch (err) {
      toast.error("Failed to start conversation");
    }
  };

  const parseTags = (commaString) => {
    if (!commaString) return [];
    return commaString.split(",").map((s) => s.trim()).filter(Boolean);
  };

  if (userLoading) {
    return (
      <div className="flex h-[300px] w-full items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  if (userError || !targetUser) {
    return (
      <div className="text-center py-12">
        <h2 className="text-lg font-bold text-ink">User not found</h2>
        <p className="text-xs text-ink/40 mt-1">The profile you are looking for does not exist.</p>
        <Link to="/" className="mt-4 inline-block text-accent font-bold hover:underline text-xs">
          Go Home
        </Link>
      </div>
    );
  }

  const skills = parseTags(targetUser.skills);
  const interests = parseTags(targetUser.interests);

  const getButtonText = () => {
    if (isConnected) return "Disconnect";
    if (incomingRequest) return "Accept Request";
    if (outgoingRequest) return "Requested";
    return "Connect";
  };

  const getButtonVariant = () => {
    if (isConnected) return "danger";
    if (outgoingRequest) return "outline";
    return "primary";
  };

  return (
    <div className="flex flex-col gap-6 max-w-3xl mx-auto animate-fade-in">
      {/* Upper Info Box */}
      <div className="card p-6 sm:p-8 bg-white flex flex-col sm:flex-row gap-6 items-center sm:items-start relative shadow-sm">
        <Avatar name={targetUser.name} size="xl" className="shadow-sm border-2 border-white ring-4 ring-slate-100" />

        <div className="flex-1 flex flex-col gap-3 text-center sm:text-left min-w-0">
          <div className="flex flex-col sm:flex-row sm:items-center gap-2">
            <h1 className="text-xl font-bold text-ink truncate leading-tight font-display">
              {targetUser.name}
            </h1>
            <div className="flex items-center gap-1.5 justify-center sm:justify-start">
              <RoleBadge role={targetUser.role} />
              {targetUser.verified && (
                <svg className="w-4.5 h-4.5 text-accent shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              )}
            </div>
          </div>

          <p className="text-sm text-ink/75 leading-relaxed break-words">
            {targetUser.bio || "No biography provided yet."}
          </p>

          <div className="flex flex-wrap gap-4 mt-1 justify-center sm:justify-start text-xs font-semibold text-ink/60">
            <span className="flex items-center gap-1.5">
              <span className="text-accent text-sm font-black">{targetUser.reputationPoints || 0}</span> Reputation
            </span>
            <span className="flex items-center gap-1.5">
              Level: <Badge variant="primary">{targetUser.reputationLevel || "Beginner"}</Badge>
            </span>
          </div>
        </div>

        {/* Dynamic actions */}
        <div className="flex gap-2 self-stretch sm:self-start shrink-0">
          <Button
            variant={getButtonVariant()}
            size="sm"
            onClick={handleConnect}
            loading={
              sendReq.isPending || acceptReq.isPending || cancelReq.isPending || removeConn.isPending
            }
            className="flex-1 sm:flex-initial"
          >
            {getButtonText()}
          </Button>

          <Button
            variant="secondary"
            size="sm"
            onClick={handleMessage}
            loading={createRoom.isPending}
            className="flex-1 sm:flex-initial"
          >
            Chat
          </Button>
        </div>
      </div>

      {/* Skills & Interests grid */}
      <div className="grid gap-6 md:grid-cols-2">
        <div className="card p-5 bg-white shadow-sm">
          <h3 className="text-sm font-bold text-ink uppercase tracking-wider mb-3">Skills</h3>
          {skills.length === 0 ? (
            <p className="text-xs text-ink/40 italic">No skills listed yet.</p>
          ) : (
            <div className="flex flex-wrap gap-1.5">
              {skills.map((s, idx) => (
                <span key={idx} className="text-xs bg-slate-100 text-slate-600 px-2.5 py-1 rounded-lg border border-slate-200">
                  {s}
                </span>
              ))}
            </div>
          )}
        </div>

        <div className="card p-5 bg-white shadow-sm">
          <h3 className="text-sm font-bold text-ink uppercase tracking-wider mb-3">Interests</h3>
          {interests.length === 0 ? (
            <p className="text-xs text-ink/40 italic">No interests listed yet.</p>
          ) : (
            <div className="flex flex-wrap gap-1.5">
              {interests.map((s, idx) => (
                <span key={idx} className="text-xs bg-accent/5 text-accent px-2.5 py-1 rounded-lg border border-accent/10">
                  {s}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default PublicProfile;
