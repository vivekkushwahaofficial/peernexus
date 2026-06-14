import apiClient from "./apiClient.js";

export const notificationService = {
  getNotifications: (params) =>
    apiClient.get("/api/notifications", { params }).then((r) => r.data.data),
  markRead: (id) =>
    apiClient.post(`/api/notifications/${id}/read`).then((r) => r.data.data),
  markAllRead: () =>
    apiClient.post("/api/notifications/read-all").then((r) => r.data),
};
