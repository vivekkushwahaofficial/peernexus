import apiClient from "./apiClient.js";

/**
 * Service to communicate with the backend AI helper endpoints.
 * Reuses the existing apiClient instance to automatically handle
 * JWT authentication and token refresh interceptors.
 */
export const aiService = {
  explain: (payload) => apiClient.post("/api/ai/explain", payload).then((r) => r.data.data),
};

export default aiService;
