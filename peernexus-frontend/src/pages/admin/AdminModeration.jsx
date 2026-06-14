import React, { useState } from "react";
import { useModerationActions, useApplyModerationAction } from "../../hooks/useAdmin.js";
import { useToast } from "../../hooks/useToast.js";
import { AdminNavbar } from "./AdminDashboard.jsx";
import Spinner from "../../components/common/Spinner.jsx";
import Pagination from "../../components/common/Pagination.jsx";
import EmptyState from "../../components/common/EmptyState.jsx";
import Modal from "../../components/common/Modal.jsx";
import Input from "../../components/common/Input.jsx";
import Button from "../../components/common/Button.jsx";
import Badge from "../../components/common/Badge.jsx";

const ACTION_TYPES = [
  { value: "WARNING", label: "Send Warning" },
  { value: "SUSPEND", label: "Suspend Account" },
  { value: "BAN", label: "Permanently Ban User" },
  { value: "DELETE_CONTENT", label: "Delete Infringing Content" },
];

const CONTENT_TYPES = [
  { value: "DOUBT", label: "Doubt Post" },
  { value: "ANSWER", label: "Answer Post" },
  { value: "MESSAGE", label: "Private/Group Message" },
  { value: "GROUP", label: "Study Group" },
];

export function AdminModeration() {
  const toast = useToast();
  const [page, setPage] = useState(0);
  const [applyModalOpen, setApplyModalOpen] = useState(false);

  // Form states
  const [targetUserId, setTargetUserId] = useState("");
  const [actionType, setActionType] = useState("WARNING");
  const [reason, setReason] = useState("");
  const [suspendUntil, setSuspendUntil] = useState("");
  const [targetContentId, setTargetContentId] = useState("");
  const [targetContentType, setTargetContentType] = useState("DOUBT");
  const [linkedReportId, setLinkedReportId] = useState("");

  const [formErrors, setFormErrors] = useState({});

  // Queries
  const { data: actionsPage, isLoading } = useModerationActions({ page, size: 10, sort: "createdAt,desc" });
  const applyActionMutation = useApplyModerationAction();

  const actions = actionsPage?.content || [];

  const validate = () => {
    const errors = {};
    if (!targetUserId.trim()) errors.targetUserId = "Target User ID is required";
    if (!reason.trim()) errors.reason = "Reason is required";

    if (actionType === "SUSPEND" && !suspendUntil) {
      errors.suspendUntil = "Suspension expiration date is required";
    }

    if (actionType === "DELETE_CONTENT" && !targetContentId.trim()) {
      errors.targetContentId = "Target Content ID is required";
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleApplySubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    const payload = {
      targetUserId: parseInt(targetUserId, 10),
      actionType,
      reason: reason.trim(),
    };

    if (actionType === "SUSPEND") {
      payload.suspendUntil = new Date(suspendUntil).toISOString();
    }

    if (actionType === "DELETE_CONTENT") {
      payload.targetContentId = parseInt(targetContentId, 10);
      payload.targetContentType = targetContentType;
    }

    if (linkedReportId.trim()) {
      payload.linkedReportId = parseInt(linkedReportId, 10);
    }

    try {
      await applyActionMutation.mutateAsync(payload);
      toast.success("Moderation action applied and logged");
      setApplyModalOpen(false);
      // Reset form
      setTargetUserId("");
      setActionType("WARNING");
      setReason("");
      setSuspendUntil("");
      setTargetContentId("");
      setLinkedReportId("");
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to apply moderation action");
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

  const getActionBadgeVariant = (type) => {
    if (type === "BAN") return "danger";
    if (type === "SUSPEND") return "warning";
    if (type === "DELETE_CONTENT") return "neutral";
    return "info";
  };

  return (
    <div className="flex flex-col gap-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-rose-700 font-display">Moderation Actions</h1>
          <p className="text-xs text-ink/50 mt-1">Apply enforcements against accounts or content.</p>
        </div>

        <Button variant="primary" onClick={() => setApplyModalOpen(true)} className="bg-rose-700 hover:bg-rose-800">
          Apply Action
        </Button>
      </div>

      <AdminNavbar />

      {/* Action Table/List */}
      {isLoading ? (
        <div className="flex justify-center py-12">
          <Spinner size="lg" />
        </div>
      ) : actions.length === 0 ? (
        <EmptyState
          title="No actions recorded"
          description="There are no moderation actions logged in the system database."
        />
      ) : (
        <div className="card overflow-hidden bg-white shadow-sm border-ink/8 flex flex-col">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-ink/8 text-ink/50 font-bold uppercase tracking-wider">
                  <th className="p-4">Action ID</th>
                  <th className="p-4">Target User</th>
                  <th className="p-4">Action Type</th>
                  <th className="p-4">Enforcer</th>
                  <th className="p-4">Reason</th>
                  <th className="p-4">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-ink/5">
                {actions.map((act) => (
                  <tr key={act.id} className="hover:bg-slate-50/50 transition">
                    <td className="p-4 font-bold text-ink/60">#{act.id}</td>
                    <td className="p-4 font-semibold text-ink">User #{act.targetUserId}</td>
                    <td className="p-4">
                      <Badge variant={getActionBadgeVariant(act.actionType)}>
                        {act.actionType?.replace("_", " ")}
                      </Badge>
                    </td>
                    <td className="p-4 text-ink/70">Admin #{act.actorId || "System"}</td>
                    <td className="p-4 text-ink/65 italic truncate max-w-[200px]" title={act.reason}>
                      "{act.reason}"
                    </td>
                    <td className="p-4 text-ink/40">{formatDate(act.createdAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <Pagination pageData={actionsPage} onPageChange={(p) => setPage(p)} />
        </div>
      )}

      {/* Apply Action Modal Form */}
      <Modal isOpen={applyModalOpen} onClose={() => setApplyModalOpen(false)} title="Apply Moderation Action" size="md">
        <form onSubmit={handleApplySubmit} className="flex flex-col gap-4">
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Target User ID"
              name="targetUserId"
              placeholder="e.g. 42"
              value={targetUserId}
              onChange={(e) => setTargetUserId(e.target.value)}
              error={formErrors.targetUserId}
              required
            />

            <Input
              label="Action Type"
              name="actionType"
              type="select"
              options={ACTION_TYPES}
              value={actionType}
              onChange={(e) => setActionType(e.target.value)}
            />
          </div>

          {actionType === "SUSPEND" && (
            <Input
              label="Suspend Until"
              name="suspendUntil"
              type="datetime-local"
              value={suspendUntil}
              onChange={(e) => setSuspendUntil(e.target.value)}
              error={formErrors.suspendUntil}
              required
            />
          )}

          {actionType === "DELETE_CONTENT" && (
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Content ID"
                name="targetContentId"
                placeholder="e.g. 102"
                value={targetContentId}
                onChange={(e) => setTargetContentId(e.target.value)}
                error={formErrors.targetContentId}
                required
              />

              <Input
                label="Content Type"
                name="targetContentType"
                type="select"
                options={CONTENT_TYPES}
                value={targetContentType}
                onChange={(e) => setTargetContentType(e.target.value)}
              />
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Linked Report ID (Optional)"
              name="linkedReportId"
              placeholder="e.g. 15"
              value={linkedReportId}
              onChange={(e) => setLinkedReportId(e.target.value)}
            />
          </div>

          <Input
            label="Enforcement Reason"
            name="reason"
            type="textarea"
            placeholder="Provide detail on how the user violated PeerNexus terms. This will be shown to the target user..."
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            error={formErrors.reason}
            required
            rows={4}
          />

          <div className="flex justify-end gap-2.5 border-t border-ink/8 pt-4">
            <Button variant="ghost" onClick={() => setApplyModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="danger" loading={applyActionMutation.isPending} className="bg-rose-700 hover:bg-rose-800">
              Apply Enforcement
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

export default AdminModeration;
