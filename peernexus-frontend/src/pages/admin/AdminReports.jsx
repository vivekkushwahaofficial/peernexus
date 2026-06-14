import React, { useState } from "react";
import { useReports, useReviewReport } from "../../hooks/useAdmin.js";
import { useToast } from "../../hooks/useToast.js";
import { AdminNavbar } from "./AdminDashboard.jsx";
import ReportRow from "../../components/admin/ReportRow.jsx";
import Spinner from "../../components/common/Spinner.jsx";
import Pagination from "../../components/common/Pagination.jsx";
import EmptyState from "../../components/common/EmptyState.jsx";
import Modal from "../../components/common/Modal.jsx";
import Input from "../../components/common/Input.jsx";
import Button from "../../components/common/Button.jsx";

const REPORT_STATUSES = [
  { value: "OPEN", label: "Open Reports" },
  { value: "REVIEWING", label: "Under Review" },
  { value: "RESOLVED", label: "Resolved" },
  { value: "REJECTED", label: "Rejected/Spam" },
];

export function AdminReports() {
  const toast = useToast();
  const [status, setStatus] = useState("OPEN");
  const [page, setPage] = useState(0);
  const [selectedReport, setSelectedReport] = useState(null);
  const [adminNotes, setAdminNotes] = useState("");
  const [reviewStatus, setReviewStatus] = useState("RESOLVED");

  // Queries / Mutations
  const { data: reportsPage, isLoading } = useReports({ status, page, size: 10, sort: "createdAt,desc" });
  const reviewReportMutation = useReviewReport();

  const reports = reportsPage?.content || [];

  const handleOpenReview = (report) => {
    setSelectedReport(report);
    setAdminNotes(report.adminNotes || "");
    setReviewStatus(report.status === "OPEN" ? "RESOLVED" : report.status);
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!selectedReport) return;

    try {
      await reviewReportMutation.mutateAsync({
        reportId: selectedReport.id,
        payload: {
          status: reviewStatus,
          adminNotes: adminNotes.trim(),
        },
      });
      toast.success("Report updated successfully");
      setSelectedReport(null);
      setAdminNotes("");
    } catch (err) {
      toast.error("Failed to review report");
    }
  };

  const handlePageChange = (newPage) => {
    setPage(newPage);
  };

  return (
    <div className="flex flex-col gap-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-rose-700 font-display">Abuse Reports</h1>
        <p className="text-xs text-ink/50 mt-1">Review flagged doubts, answers, and messages.</p>
      </div>

      <AdminNavbar />

      {/* Filter Selector */}
      <div className="flex border-b border-ink/8 gap-4 overflow-x-auto pb-1">
        {REPORT_STATUSES.map((st) => (
          <button
            key={st.value}
            onClick={() => {
              setStatus(st.value);
              setPage(0);
            }}
            className={`px-4 py-2 text-xs font-semibold uppercase tracking-wider border-b-2 whitespace-nowrap transition ${
              status === st.value
                ? "border-rose-600 text-rose-700"
                : "border-transparent text-ink/50 hover:text-ink"
            }`}
          >
            {st.label}
          </button>
        ))}
      </div>

      {/* Reports Feed */}
      {isLoading ? (
        <div className="flex justify-center py-12">
          <Spinner size="lg" />
        </div>
      ) : reports.length === 0 ? (
        <EmptyState
          title={`No ${status.toLowerCase()} reports`}
          description={`Everything looks clean. There are no reports with status ${status} at the moment.`}
        />
      ) : (
        <div className="flex flex-col gap-3">
          {reports.map((report) => (
            <ReportRow key={report.id} report={report} onReview={handleMarkReview => handleOpenReview(report)} />
          ))}

          <Pagination pageData={reportsPage} onPageChange={handlePageChange} />
        </div>
      )}

      {/* Review Dialog Modal */}
      {selectedReport && (
        <Modal
          isOpen={Boolean(selectedReport)}
          onClose={() => setSelectedReport(null)}
          title={`Review Report #${selectedReport.id}`}
          size="md"
        >
          <form onSubmit={handleReviewSubmit} className="flex flex-col gap-4">
            <div className="bg-slate-50 p-4 rounded-2xl border border-ink/5 text-xs flex flex-col gap-2">
              <p>
                <span className="font-bold text-ink/75">Type:</span> {selectedReport.type} |{" "}
                <span className="font-bold text-ink/75">Target Entity ID:</span>{" "}
                {selectedReport.targetId}
              </p>
              <p>
                <span className="font-bold text-ink/75">Reporter:</span>{" "}
                {selectedReport.reporterName}
              </p>
              <p className="italic text-ink/60 mt-1">"{selectedReport.reason}"</p>
            </div>

            <Input
              label="Review Verdict"
              name="reviewStatus"
              type="select"
              options={[
                { value: "RESOLVED", label: "Resolve (Confirm violation)" },
                { value: "REJECTED", label: "Reject (False flag/Spam)" },
                { value: "REVIEWING", label: "Keep Under Review" },
              ]}
              value={reviewStatus}
              onChange={(e) => setReviewStatus(e.target.value)}
            />

            <Input
              label="Resolution Notes"
              name="adminNotes"
              type="textarea"
              placeholder="Explain the moderation actions taken (e.g. content deleted, warnings sent)..."
              value={adminNotes}
              onChange={(e) => setAdminNotes(e.target.value)}
              required
              rows={4}
            />

            <div className="flex justify-end gap-2.5 border-t border-ink/8 pt-4">
              <Button variant="ghost" onClick={() => setSelectedReport(null)}>
                Cancel
              </Button>
              <Button type="submit" variant="primary" loading={reviewReportMutation.isPending}>
                Save Verdict
              </Button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}

export default AdminReports;
