import React, { useState } from "react";
import { useAdminAuditLog, useAdminAuditLogByActor } from "../../hooks/useAdmin.js";
import { AdminNavbar } from "./AdminDashboard.jsx";
import Spinner from "../../components/common/Spinner.jsx";
import Pagination from "../../components/common/Pagination.jsx";
import EmptyState from "../../components/common/EmptyState.jsx";
import Input from "../../components/common/Input.jsx";
import Button from "../../components/common/Button.jsx";

export function AdminAuditLog() {
  const [page, setPage] = useState(0);
  const [actorInput, setActorInput] = useState("");
  const [submittedActorId, setSubmittedActorId] = useState("");

  const params = { page, size: 15, sort: "performedAt,desc" };

  const isFilteringByActor = Boolean(submittedActorId.trim());

  const { data: globalPage, isLoading: globalLoading } = useAdminAuditLog(params);
  const { data: actorPage, isLoading: actorLoading } = useAdminAuditLogByActor(
    parseInt(submittedActorId, 10),
    params
  );

  const activePageData = isFilteringByActor ? actorPage : globalPage;
  const isLoading = isFilteringByActor ? actorLoading : globalLoading;

  const logs = activePageData?.content || [];

  const handleFilterSubmit = (e) => {
    e.preventDefault();
    setPage(0);
    setSubmittedActorId(actorInput);
  };

  const handleClearFilter = () => {
    setPage(0);
    setActorInput("");
    setSubmittedActorId("");
  };

  const formatDate = (isoStr) => {
    if (!isoStr) return "";
    return new Date(isoStr).toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
  };

  return (
    <div className="flex flex-col gap-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-rose-700 font-display">Security Audit Log</h1>
        <p className="text-xs text-ink/50 mt-1">Full immutable trail of admin and moderation enforcements.</p>
      </div>

      <AdminNavbar />

      {/* Filter Row */}
      <form onSubmit={handleFilterSubmit} className="flex gap-2 items-end max-w-sm">
        <Input
          label="Filter by Actor User ID"
          name="actorId"
          placeholder="e.g. 1"
          value={actorInput}
          onChange={(e) => setActorInput(e.target.value)}
          type="number"
          className="flex-1"
        />
        <Button type="submit" variant="secondary" className="px-5 shrink-0 py-3">
          Filter
        </Button>
        {isFilteringByActor && (
          <Button variant="ghost" onClick={handleClearFilter} className="shrink-0 py-3">
            Clear
          </Button>
        )}
      </form>

      {/* Audit Logs Table */}
      {isLoading ? (
        <div className="flex justify-center py-12">
          <Spinner size="lg" />
        </div>
      ) : logs.length === 0 ? (
        <EmptyState
          title="No audit logs found"
          description={
            isFilteringByActor
              ? `No actions have been recorded for actor ID ${submittedActorId}.`
              : "Audit trail is currently empty."
          }
        />
      ) : (
        <div className="card overflow-hidden bg-white shadow-sm border-ink/8 flex flex-col">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-ink/8 text-ink/50 font-bold uppercase tracking-wider">
                  <th className="p-4">Log ID</th>
                  <th className="p-4">Actor</th>
                  <th className="p-4">Action</th>
                  <th className="p-4">Target Type</th>
                  <th className="p-4">Target ID</th>
                  <th className="p-4">Verdicts & Notes</th>
                  <th className="p-4">Performed At</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-ink/5">
                {logs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50/50 transition">
                    <td className="p-4 font-bold text-ink/40">#{log.id}</td>
                    <td className="p-4 font-semibold text-rose-700">
                      {log.actorName} (ID: {log.actorId})
                    </td>
                    <td className="p-4">
                      <span className="font-semibold text-ink bg-slate-100 border border-ink/5 px-2 py-0.5 rounded-full text-[10px]">
                        {log.action}
                      </span>
                    </td>
                    <td className="p-4 font-medium text-ink/60">{log.targetType || "-"}</td>
                    <td className="p-4 font-bold text-ink/80">{log.targetId || "-"}</td>
                    <td className="p-4 text-ink/65 break-words max-w-xs">{log.details}</td>
                    <td className="p-4 text-ink/40 whitespace-nowrap">{formatDate(log.performedAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <Pagination pageData={activePageData} onPageChange={(p) => setPage(p)} />
        </div>
      )}
    </div>
  );
}

export default AdminAuditLog;
