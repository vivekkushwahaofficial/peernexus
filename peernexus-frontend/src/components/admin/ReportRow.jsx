import React from "react";
import Badge from "../common/Badge.jsx";
import Button from "../common/Button.jsx";

export function ReportRow({ report, onReview }) {
  if (!report) return null;

  const { id, reporterName, type, targetId, reason, status, reviewedByName, createdAt } = report;

  const formatDate = (isoStr) => {
    if (!isoStr) return "";
    return new Date(isoStr).toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const statusVariants = {
    OPEN: "danger",
    REVIEWING: "warning",
    RESOLVED: "success",
    REJECTED: "neutral",
  };

  const typeVariants = {
    USER: "slate",
    DOUBT: "primary",
    ANSWER: "info",
    MESSAGE: "slate",
    GROUP: "warning",
  };

  return (
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 rounded-2xl border border-ink/8 bg-white hover:bg-slate-50 transition shadow-sm">
      <div className="flex flex-col gap-1.5 min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-bold text-ink">Report #{id}</span>
          <Badge variant={typeVariants[type] || "neutral"}>{type}</Badge>
          <Badge variant={statusVariants[status] || "neutral"}>{status}</Badge>
          <span className="text-[10px] text-ink/40 font-medium">
            Submitted: {formatDate(createdAt)}
          </span>
        </div>

        <p className="text-xs font-semibold text-ink/70">
          Target ID: <span className="text-ink">{targetId}</span> | Reporter:{" "}
          <span className="text-ink">{reporterName}</span>
        </p>

        <p className="text-xs text-ink/60 italic leading-relaxed mt-1 break-words">
          "{reason}"
        </p>

        {reviewedByName && (
          <p className="text-[10px] text-emerald-600 font-semibold mt-1">
            Reviewed by: {reviewedByName}
          </p>
        )}
      </div>

      <div className="flex items-center gap-2 self-end md:self-center shrink-0">
        <Button variant="outline" size="sm" onClick={() => onReview && onReview(report)}>
          Review
        </Button>
      </div>
    </div>
  );
}

export default ReportRow;
