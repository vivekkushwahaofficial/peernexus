import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useNotifications, useMarkRead, useMarkAllRead } from "../../hooks/useNotifications.js";
import { useToast } from "../../hooks/useToast.js";
import Spinner from "../../components/common/Spinner.jsx";
import EmptyState from "../../components/common/EmptyState.jsx";
import Pagination from "../../components/common/Pagination.jsx";
import Button from "../../components/common/Button.jsx";

export function Notifications() {
  const toast = useToast();
  const navigate = useNavigate();
  const [page, setPage] = useState(0);

  const { data: notificationsPage, isLoading } = useNotifications({ page, size: 15, sort: "createdAt,desc" });
  const markReadMutation = useMarkRead();
  const markAllReadMutation = useMarkAllRead();

  const notifications = notificationsPage?.content || [];

  const handleMarkAllRead = async () => {
    try {
      await markAllReadMutation.mutateAsync();
      toast.success("All notifications marked as read");
    } catch (err) {
      toast.error("Failed to update notifications");
    }
  };

  const handleNotificationClick = async (notif) => {
    // Mark as read first (if not already read)
    if (!notif.read) {
      try {
        await markReadMutation.mutateAsync(notif.id);
      } catch (err) {
        console.error("Failed to mark notification as read", err);
      }
    }

    // Redirect based on reference properties
    const { referenceType, referenceId } = notif;
    if (referenceType === "DOUBT" || referenceType === "ANSWER") {
      navigate(`/doubts/${referenceId}`);
    } else if (referenceType === "CONNECTION" || referenceType === "CONNECTION_REQUEST") {
      navigate("/connections");
    } else if (referenceType === "GROUP" || referenceType === "GROUP_CHAT") {
      navigate(`/groups/${referenceId}`);
    } else {
      navigate("/");
    }
  };

  const formatDate = (isoStr) => {
    if (!isoStr) return "";
    return new Date(isoStr).toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="flex flex-col gap-6 max-w-2xl mx-auto animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-ink font-display">Notifications</h1>
          <p className="text-xs text-ink/50 mt-1">Stay updated with doubt activities and connection requests.</p>
        </div>

        {notifications.length > 0 && (
          <Button variant="outline" size="sm" onClick={handleMarkAllRead} loading={markAllReadMutation.isPending}>
            Mark All Read
          </Button>
        )}
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12">
          <Spinner size="lg" />
        </div>
      ) : notifications.length === 0 ? (
        <EmptyState
          title="No notifications yet"
          description="We'll notify you here when you receive replies to doubts, connection requests, or study updates."
        />
      ) : (
        <div className="flex flex-col gap-2.5">
          {notifications.map((notif) => (
            <div
              key={notif.id}
              onClick={() => handleNotificationClick(notif)}
              className={`flex items-start justify-between gap-4 p-4 rounded-2xl border cursor-pointer hover:bg-slate-50 transition shadow-sm ${
                notif.read
                  ? "bg-white border-ink/8 text-ink/70"
                  : "bg-accent/5 border-accent/20 text-ink ring-1 ring-accent/10"
              }`}
            >
              <div className="flex flex-col gap-1 min-w-0">
                <p className="text-xs font-semibold leading-relaxed break-words">
                  {notif.message}
                </p>
                <span className="text-[10px] text-ink/40 font-medium">
                  {formatDate(notif.createdAt)}
                </span>
              </div>

              {!notif.read && (
                <span className="w-2.5 h-2.5 rounded-full bg-accent shrink-0 mt-1.5" />
              )}
            </div>
          ))}

          <Pagination pageData={notificationsPage} onPageChange={(p) => setPage(p)} />
        </div>
      )}
    </div>
  );
}

export default Notifications;
