import apiClient from "./apiClient.js";

export const chatService = {
  getMyRooms: () => apiClient.get("/api/chat/rooms").then((r) => r.data.data),
  getOrCreateRoom: (otherUserId) =>
    apiClient.post(`/api/chat/rooms/${otherUserId}/or-create`).then((r) => r.data.data),
  getHistory: (roomId, params) =>
    apiClient.get(`/api/chat/rooms/${roomId}/messages`, { params }).then((r) => r.data.data),
  markAsRead: (roomId) =>
    apiClient.post(`/api/chat/rooms/${roomId}/read`).then((r) => r.data.data),
  searchMessages: (query, roomId, senderId) =>
    apiClient.get("/api/chat/search", { params: { query, roomId, senderId } }).then((r) => r.data.data),
  getPinnedMessages: (roomId) =>
    apiClient.get(`/api/chat/rooms/${roomId}/pinned`).then((r) => r.data.data),
  togglePinMessage: (messageId) =>
    apiClient.post(`/api/chat/messages/${messageId}/pin`).then((r) => r.data.data),
  deleteMessageForMe: (messageId) =>
    apiClient.post(`/api/chat/messages/${messageId}/delete-for-me`).then((r) => r.data.data),
};
