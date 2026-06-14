import React, { useState } from "react";
import { Link } from "react-router-dom";
import {
  useConnections,
  useIncomingRequests,
  useOutgoingRequests,
  useAcceptConnectionRequest,
  useRejectConnectionRequest,
  useCancelConnectionRequest,
  useRemoveConnection,
} from "../../hooks/useConnections.js";
import { useToast } from "../../hooks/useToast.js";
import Avatar from "../../components/common/Avatar.jsx";
import Badge from "../../components/common/Badge.jsx";
import Spinner from "../../components/common/Spinner.jsx";
import Pagination from "../../components/common/Pagination.jsx";
import EmptyState from "../../components/common/EmptyState.jsx";
import Button from "../../components/common/Button.jsx";

import { useAuth } from "../../hooks/useAuth.js";

export function Connections() {
  const { user } = useAuth();
  const toast = useToast();
  const [activeTab, setActiveTab] = useState("my"); // "my" | "incoming" | "outgoing"
  const [page, setPage] = useState(0);

  const params = { page, size: 10 };

  // Queries
  const { data: connectionsPage, isLoading: connLoading } = useConnections(params);
  const { data: incomingPage, isLoading: incomingLoading } = useIncomingRequests(params);
  const { data: outgoingPage, isLoading: outgoingLoading } = useOutgoingRequests(params);

  // Mutations
  const acceptReq = useAcceptConnectionRequest();
  const rejectReq = useRejectConnectionRequest();
  const cancelReq = useCancelConnectionRequest();
  const removeConn = useRemoveConnection();

  const handlePageChange = (newPage) => {
    setPage(newPage);
  };

  const handleAccept = async (id) => {
    try {
      await acceptReq.mutateAsync(id);
      toast.success("Request accepted!");
    } catch (err) {
      toast.error("Failed to accept request");
    }
  };

  const handleReject = async (id) => {
    try {
      await rejectReq.mutateAsync(id);
      toast.success("Request rejected");
    } catch (err) {
      toast.error("Failed to reject request");
    }
  };

  const handleCancel = async (id) => {
    try {
      await cancelReq.mutateAsync(id);
      toast.success("Request cancelled");
    } catch (err) {
      toast.error("Failed to cancel request");
    }
  };

  const handleDisconnect = async (id) => {
    if (window.confirm("Are you sure you want to disconnect?")) {
      try {
        await removeConn.mutateAsync(id);
        toast.success("Connection removed");
      } catch (err) {
        toast.error("Failed to remove connection");
      }
    }
  };

  const isLoading =
    activeTab === "my"
      ? connLoading
      : activeTab === "incoming"
      ? incomingLoading
      : outgoingLoading;

  const activePageData =
    activeTab === "my"
      ? connectionsPage
      : activeTab === "incoming"
      ? incomingPage
      : outgoingPage;

  const items = activePageData?.content || [];

  return (
    <div className="flex flex-col gap-6 animate-fade-in max-w-3xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-ink font-display">Student Connections</h1>
        <p className="text-xs text-ink/50 mt-1">Manage your academic connections and peer requests.</p>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-ink/8">
        <button
          onClick={() => {
            setActiveTab("my");
            setPage(0);
          }}
          className={`px-5 py-3 text-xs font-semibold uppercase tracking-wider border-b-2 transition-all ${
            activeTab === "my"
              ? "border-accent text-accent"
              : "border-transparent text-ink/50 hover:text-ink"
          }`}
        >
          My Connections ({connectionsPage?.totalElements || 0})
        </button>
        <button
          onClick={() => {
            setActiveTab("incoming");
            setPage(0);
          }}
          className={`px-5 py-3 text-xs font-semibold uppercase tracking-wider border-b-2 transition-all ${
            activeTab === "incoming"
              ? "border-accent text-accent"
              : "border-transparent text-ink/50 hover:text-ink"
          }`}
        >
          Incoming Requests ({incomingPage?.totalElements || 0})
        </button>
        <button
          onClick={() => {
            setActiveTab("outgoing");
            setPage(0);
          }}
          className={`px-5 py-3 text-xs font-semibold uppercase tracking-wider border-b-2 transition-all ${
            activeTab === "outgoing"
              ? "border-accent text-accent"
              : "border-transparent text-ink/50 hover:text-ink"
          }`}
        >
          Sent Requests ({outgoingPage?.totalElements || 0})
        </button>
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="flex justify-center py-12">
          <Spinner size="lg" />
        </div>
      ) : items.length === 0 ? (
        <EmptyState
          title={`No ${activeTab === "my" ? "connections" : "requests"} yet`}
          description={
            activeTab === "my"
              ? "You haven't connected with any students yet. Search the doubt forum or leaderboard to find peers!"
              : activeTab === "incoming"
              ? "You don't have any incoming connection requests at the moment."
              : "You haven't sent any connection requests."
          }
        />
      ) : (
        <div className="flex flex-col gap-3">
          {items.map((item) => {
            return (
              <ConnectionRow
                key={item.id}
                item={item}
                tab={activeTab}
                onAccept={handleAccept}
                onReject={handleReject}
                onCancel={handleCancel}
                onDisconnect={handleDisconnect}
                processing={
                  acceptReq.isPending ||
                  rejectReq.isPending ||
                  cancelReq.isPending ||
                  removeConn.isPending
                }
                currentUserId={user?.id}
              />
            );
          })}

          <Pagination pageData={activePageData} onPageChange={handlePageChange} />
        </div>
      )}
    </div>
  );
}


// Sub-component for rendering a single item in connection lists
function ConnectionRow({ item, tab, onAccept, onReject, onCancel, onDisconnect, processing, currentUserId }) {
  const isIncoming = tab === "incoming";
  const isOutgoing = tab === "outgoing";
  const isMy = tab === "my";

  // Resolve partner details dynamically
  const partner = item.requester?.id === currentUserId ? item.recipient : item.requester;

  if (!partner) return null;

  const { id, name, role, verified } = partner;
  // Emails aren't in ConnectionUserSummary, we can display the role
  const roleText = role?.replace("ROLE_", "") || "Student";

  return (
    <div className="flex items-center justify-between p-4 rounded-2xl border border-ink/8 bg-white shadow-sm hover:bg-slate-50 transition">
      <Link to={`/profile/${id}`} className="flex items-center gap-3">
        <Avatar name={name} size="md" />
        <div className="flex flex-col">
          <div className="flex items-center gap-1">
            <span className="text-xs font-bold text-ink leading-tight">{name}</span>
            {verified && (
              <svg className="w-3.5 h-3.5 text-accent shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            )}
          </div>
          <span className="text-[10px] text-ink/40 mt-1">{roleText}</span>
        </div>
      </Link>

      <div className="flex gap-2">
        {isIncoming && (
          <>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onReject(item.id)}
              loading={processing}
              className="text-rose-600 hover:bg-rose-50"
            >
              Reject
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={() => onAccept(item.id)}
              loading={processing}
            >
              Accept
            </Button>
          </>
        )}

        {isOutgoing && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => onCancel(item.id)}
            loading={processing}
          >
            Cancel Request
          </Button>
        )}

        {isMy && (
          <Button
            variant="danger"
            size="sm"
            onClick={() => onDisconnect(item.id)}
            loading={processing}
          >
            Disconnect
          </Button>
        )}
      </div>
    </div>
  );
}


export default Connections;
