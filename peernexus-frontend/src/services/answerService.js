import apiClient from "./apiClient.js";

export const answerService = {
  getByDoubt: (doubtId, params) =>
    apiClient.get(`/api/answers/doubt/${doubtId}`, { params }).then((r) => r.data.data),
  getById: (id) => apiClient.get(`/api/answers/${id}`).then((r) => r.data.data),
  create: (payload) => apiClient.post("/api/answers", payload).then((r) => r.data.data),
  update: (id, payload) => apiClient.put(`/api/answers/${id}`, payload).then((r) => r.data.data),
  delete: (id) => apiClient.delete(`/api/answers/${id}`).then((r) => r.data),
  accept: (id) => apiClient.post(`/api/answers/${id}/accept`).then((r) => r.data.data),
  vote: (id, type) => apiClient.post(`/api/answers/${id}/vote`, { type }).then((r) => r.data.data),
};
