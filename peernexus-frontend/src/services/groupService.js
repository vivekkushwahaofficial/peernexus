import apiClient from "./apiClient.js";

export const groupService = {
  listGroups: (params) =>
    apiClient.get("/api/groups", { params }).then((r) => r.data.data),
  searchGroups: (q, params) =>
    apiClient.get("/api/groups/search", { params: { q, ...params } }).then((r) => r.data.data),
  getMyGroups: (params) =>
    apiClient.get("/api/groups/me", { params }).then((r) => r.data.data),
  getGroup: (id) =>
    apiClient.get(`/api/groups/${id}`).then((r) => r.data.data),
  createGroup: (payload) =>
    apiClient.post("/api/groups", payload).then((r) => r.data.data),
  updateGroup: (id, payload) =>
    apiClient.put(`/api/groups/${id}`, payload).then((r) => r.data.data),
  deleteGroup: (id) =>
    apiClient.delete(`/api/groups/${id}`).then((r) => r.data),
  uploadGroupImage: (id, formData) =>
    apiClient.post(`/api/groups/${id}/image`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    }).then((r) => r.data.data),

  // Membership
  joinGroup: (id) =>
    apiClient.post(`/api/groups/${id}/join`).then((r) => r.data.data),
  leaveGroup: (id) =>
    apiClient.delete(`/api/groups/${id}/leave`).then((r) => r.data),
  getMembers: (id, params) =>
    apiClient.get(`/api/groups/${id}/members`, { params }).then((r) => r.data.data),
  removeMember: (groupId, memberId) =>
    apiClient.delete(`/api/groups/${groupId}/members/${memberId}`).then((r) => r.data),
  promoteToAdmin: (groupId, memberId) =>
    apiClient.put(`/api/groups/${groupId}/members/${memberId}/promote`).then((r) => r.data.data),
  transferOwnership: (groupId, memberId) =>
    apiClient.put(`/api/groups/${groupId}/members/${memberId}/transfer`).then((r) => r.data.data),

  // Join requests
  requestToJoin: (id, body) =>
    apiClient.post(`/api/groups/${id}/join-requests`, body || {}).then((r) => r.data.data),
  getPendingRequests: (id, params) =>
    apiClient.get(`/api/groups/${id}/join-requests`, { params }).then((r) => r.data.data),
  approveRequest: (groupId, requestId) =>
    apiClient.put(`/api/groups/${groupId}/join-requests/${requestId}/approve`).then((r) => r.data.data),
  rejectRequest: (groupId, requestId) =>
    apiClient.put(`/api/groups/${groupId}/join-requests/${requestId}/reject`).then((r) => r.data.data),
  getMyRequests: (params) =>
    apiClient.get("/api/groups/join-requests/me", { params }).then((r) => r.data.data),
};
