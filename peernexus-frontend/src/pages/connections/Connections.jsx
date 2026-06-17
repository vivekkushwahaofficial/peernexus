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
import ConfirmDialog from "../../components/common/ConfirmDialog.jsx";

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

  const [disconnectId, setDisconnectId] = useState(null);

  const handleDisconnect = (id) => {
    setDisconnectId(id);
  };

  const handleConfirmDisconnect = async () => {
    if (!disconnectId) return;
    try {
      await removeConn.mutateAsync(disconnectId);
      toast.success("Connection removed");
      setDisconnectId(null);
    } catch (err) {
      toast.error("Failed to remove connection");
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
        <h1 className="text-2xl font-extrabold text-ink font-display">Student Connections</h1>
        <p className="text-xs text-ink/40 mt-1">Manage your academic connections and peer requests.</p>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-ink/5 overflow-x-auto whitespace-nowrap scrollbar-none">
        <button
          onClick={() => {
            setActiveTab("my");
            setPage(0);
          }}
          className={`px-5 py-3 text-xs font-bold uppercase tracking-wider border-b-2 transition-all shrink-0 cursor-pointer ${
            activeTab === "my"
              ? "border-accent text-accent"
              : "border-transparent text-ink/40 hover:text-ink hover:border-ink/10"
          }`}
        >
          My Connections ({connectionsPage?.totalElements || 0})
        </button>
        <button
          onClick={() => {
            setActiveTab("incoming");
            setPage(0);
          }}
          className={`px-5 py-3 text-xs font-bold uppercase tracking-wider border-b-2 transition-all shrink-0 cursor-pointer ${
            activeTab === "incoming"
              ? "border-accent text-accent"
              : "border-transparent text-ink/40 hover:text-ink hover:border-ink/10"
          }`}
        >
          Incoming Requests ({incomingPage?.totalElements || 0})
        </button>
        <button
          onClick={() => {
            setActiveTab("outgoing");
            setPage(0);
          }}
          className={`px-5 py-3 text-xs font-bold uppercase tracking-wider border-b-2 transition-all shrink-0 cursor-pointer ${
            activeTab === "outgoing"
              ? "border-accent text-accent"
              : "border-transparent text-ink/40 hover:text-ink hover:border-ink/10"
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

      <ConfirmDialog
        isOpen={disconnectId !== null}
        onClose={() => setDisconnectId(null)}
        onConfirm={handleConfirmDisconnect}
        title="Disconnect Student"
        message="Are you sure you want to disconnect from this student?"
        loading={removeConn.isPending}
      />
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
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-xl border border-ink/5 bg-white shadow-sm hover:bg-slate-50 transition cursor-pointer">
      <Link to={`/profile/${id}`} className="flex items-center gap-3 min-w-0">
        <Avatar name={name} size="md" />
        <div className="flex flex-col min-w-0">
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-bold text-ink leading-tight truncate">{name}</span>
            {verified && (
              <svg className="w-3.5 h-3.5 text-accent shrink-0" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            )}
          </div>
          <span className="text-[10px] text-ink/40 font-bold uppercase tracking-wider mt-1">{roleText}</span>
        </div>
      </Link>

      <div className="flex gap-2 w-full sm:w-auto justify-end">
        {isIncoming && (
          <>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onReject(item.id)}
              loading={processing}
              className="text-error/80 hover:bg-error/5 font-bold text-xs"
            >
              Reject
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={() => onAccept(item.id)}
              loading={processing}
              className="font-bold text-xs"
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
            className="font-bold text-xs px-4"
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
            className="font-bold text-xs"
          >
            Disconnect
          </Button>
        )}
      </div>
    </div>
  );
}


export default Connections;
