import apiClient from "./apiClient.js";

export const reputationService = {
  getSummary: () =>
    apiClient.get("/api/reputation/me").then((r) => r.data.data),

  getHistory: (params) =>
    apiClient.get("/api/reputation/me/history", { params }).then((r) => r.data.data),

  getLeaderboard: (params) =>
    apiClient.get("/api/reputation/leaderboard", { params }).then((r) => r.data.data),
};
