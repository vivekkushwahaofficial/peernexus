import React from "react";
import Avatar from "../common/Avatar.jsx";
import Button from "../common/Button.jsx";

export function JoinRequestList({ requests = [], onApprove, onReject, processingId }) {
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
    <div className="flex flex-col gap-3">
      {requests.length === 0 ? (
        <div className="text-center py-6 text-ink/30 text-xs">
          No pending join requests.
        </div>
      ) : (
        requests.map((req) => (
          <div key={req.id} className="flex flex-col gap-3.5 p-4 rounded-2xl border border-ink/8 bg-white shadow-sm">
            {/* User row */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="flex items-center gap-3 min-w-0">
                <Avatar name={req.requesterName} size="sm" />
                <div className="flex flex-col min-w-0">
                  <span className="text-xs font-bold text-ink truncate">{req.requesterName}</span>
                  <span className="text-[10px] text-ink/40 truncate">{req.requesterEmail}</span>
                </div>
              </div>
              <span className="text-[10px] text-ink/40 self-end sm:self-center">{formatDate(req.createdAt)}</span>
            </div>

            {/* Applicant Message */}
            {req.message && (
              <div className="bg-slate-50 border border-slate-100 rounded-xl p-3 text-xs text-ink/70 leading-relaxed italic">
                "{req.message}"
              </div>
            )}

            {/* Action Row */}
            <div className="flex justify-end gap-2 border-t border-ink/5 pt-3">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onReject && onReject(req.id)}
                loading={processingId === req.id}
                className="text-rose-600 hover:bg-rose-50"
              >
                Reject
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={() => onApprove && onApprove(req.id)}
                loading={processingId === req.id}
              >
                Approve
              </Button>
            </div>
          </div>
        ))
      )}
    </div>
  );
}

export default JoinRequestList;
