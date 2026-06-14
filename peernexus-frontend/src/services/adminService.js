import apiClient from "./apiClient.js";

export const adminService = {
  getDashboardStats: () =>
    apiClient.get("/api/admin/dashboard").then((r) => r.data.data),

  submitReport: (payload) =>
    apiClient.post("/api/admin/reports", payload).then((r) => r.data.data),

  listReports: (params) =>
    apiClient.get("/api/admin/reports", { params }).then((r) => r.data.data),

  getReport: (reportId) =>
    apiClient.get(`/api/admin/reports/${reportId}`).then((r) => r.data.data),

  reviewReport: (reportId, payload) =>
    apiClient.put(`/api/admin/reports/${reportId}/review`, payload).then((r) => r.data.data),

  applyModerationAction: (payload) =>
    apiClient.post("/api/admin/moderation/actions", payload).then((r) => r.data.data),

  listActions: (params) =>
    apiClient.get("/api/admin/moderation/actions", { params }).then((r) => r.data.data),

  listActionsByUser: (userId, params) =>
    apiClient.get(`/api/admin/moderation/actions/user/${userId}`, { params }).then((r) => r.data.data),

  getAuditLog: (params) =>
    apiClient.get("/api/admin/audit-log", { params }).then((r) => r.data.data),

  getAuditLogByActor: (actorId, params) =>
    apiClient.get(`/api/admin/audit-log/actor/${actorId}`, { params }).then((r) => r.data.data),
};
