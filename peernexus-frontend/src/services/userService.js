import apiClient from "./apiClient.js";

export const userService = {
  getMe: () => apiClient.get("/api/users/me").then((r) => r.data.data),
  getById: (id) => apiClient.get(`/api/users/${id}`).then((r) => r.data.data),
  updateMe: (payload) => apiClient.put("/api/users/me", payload).then((r) => r.data.data),
};
