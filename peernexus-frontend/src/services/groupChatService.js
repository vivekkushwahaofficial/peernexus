import apiClient from "./apiClient.js";

export const groupChatService = {
  getHistory: (groupId, params) =>
    apiClient.get(`/api/group-chat/${groupId}/messages`, { params }).then((r) => r.data.data),
  sendMessage: (groupId, payload) =>
    apiClient.post(`/api/group-chat/${groupId}/messages`, payload).then((r) => r.data.data),
  markAsRead: (groupId) =>
    apiClient.post(`/api/group-chat/${groupId}/read`).then((r) => r.data.data),
  getUnreadCount: (groupId) =>
    apiClient.get(`/api/group-chat/${groupId}/unread-count`).then((r) => r.data.data),
  getLastMessage: (groupId) =>
    apiClient.get(`/api/group-chat/${groupId}/last-message`).then((r) => r.data.data),
};
