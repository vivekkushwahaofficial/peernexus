import apiClient from "./apiClient.js";

export const doubtService = {
  getAll: (params) => apiClient.get("/api/doubts", { params }).then((r) => r.data.data),
  getById: (id) => apiClient.get(`/api/doubts/${id}`).then((r) => r.data.data),
  search: (query, params) =>
    apiClient.get("/api/doubts/search", { params: { query, ...params } }).then((r) => r.data.data),
  getByCategory: (categoryId, params) =>
    apiClient.get(`/api/doubts/category/${categoryId}`, { params }).then((r) => r.data.data),
  create: (payload) => apiClient.post("/api/doubts", payload).then((r) => r.data.data),
  update: (id, payload) => apiClient.put(`/api/doubts/${id}`, payload).then((r) => r.data.data),
  delete: (id) => apiClient.delete(`/api/doubts/${id}`).then((r) => r.data),
  uploadImages: (id, imageUrls) =>
    apiClient.post(`/api/doubts/${id}/images`, { imageUrls }).then((r) => r.data.data),
};
