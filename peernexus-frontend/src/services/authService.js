import apiClient from "./apiClient.js";

export const authService = {
  register: (payload) =>
    apiClient.post("/api/auth/register", payload).then((r) => r.data.data),

  login: (payload) =>
    apiClient.post("/api/auth/login", payload).then((r) => r.data.data),

  refreshToken: (refreshToken) =>
    apiClient.post("/api/auth/refresh", { refreshToken }).then((r) => r.data.data),
};
