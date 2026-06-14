import apiClient from "./apiClient.js";

export const connectionService = {
  getConnections: (params) =>
    apiClient.get("/api/connections", { params }).then((r) => r.data.data),
  getIncomingRequests: (params) =>
    apiClient.get("/api/connections/requests/incoming", { params }).then((r) => r.data.data),
  getOutgoingRequests: (params) =>
    apiClient.get("/api/connections/requests/outgoing", { params }).then((r) => r.data.data),
  getMutualConnections: (userId) =>
    apiClient.get(`/api/connections/mutual/${userId}`).then((r) => r.data.data),
  sendRequest: (recipientId) =>
    apiClient.post("/api/connections/request", { recipientId }).then((r) => r.data.data),
  acceptRequest: (id) =>
    apiClient.post(`/api/connections/${id}/accept`).then((r) => r.data.data),
  rejectRequest: (id) =>
    apiClient.post(`/api/connections/${id}/reject`).then((r) => r.data.data),
  cancelRequest: (id) =>
    apiClient.post(`/api/connections/${id}/cancel`).then((r) => r.data.data),
  removeConnection: (id) =>
    apiClient.delete(`/api/connections/${id}`).then((r) => r.data),
};
