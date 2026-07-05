/**
 * Axios client with automatic JWT refresh-token interceptor.
 *
 * Flow:
 *  1. Every request gets the current access token from localStorage.
 *  2. On 401 response → attempt silent token refresh.
 *  3. If refresh succeeds → retry the original request with the new token.
 *  4. If refresh fails → clear auth state and redirect to /login.
 */
import axios from "axios";

const BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8080";
const STORAGE_KEY = "peernexus_auth";

const apiClient = axios.create({
  baseURL: BASE_URL,
  headers: { "Content-Type": "application/json" },
});

function isTokenExpired(token) {
  if (!token) return true;
  try {
    const parts = token.split(".");
    if (parts.length !== 3) return true;
    const payload = JSON.parse(atob(parts[1]));
    const exp = payload.exp;
    // Check if token expires in the next 10 seconds (skew safety)
    return (Date.now() / 1000) >= (exp - 10);
  } catch (e) {
    return true;
  }
}

let activeRefreshPromise = null;

async function refreshAccessToken(refreshToken, authData) {
  if (activeRefreshPromise) {
    return activeRefreshPromise;
  }
  activeRefreshPromise = (async () => {
    try {
      const response = await axios.post(`${BASE_URL}/api/auth/refresh`, {
        refreshToken,
      });
      const newAccessToken = response.data.data.accessToken;
      const newRefreshToken = response.data.data.refreshToken;
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({ ...authData, accessToken: newAccessToken, refreshToken: newRefreshToken })
      );
      return newAccessToken;
    } finally {
      activeRefreshPromise = null;
    }
  })();
  return activeRefreshPromise;
}

// ── Request interceptor: attach Bearer token (with proactive refresh) ─────────────
apiClient.interceptors.request.use(async (config) => {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (raw) {
    try {
      const authData = JSON.parse(raw);
      let accessToken = authData.accessToken;
      const refreshToken = authData.refreshToken;

      if (accessToken && isTokenExpired(accessToken)) {
        console.log("[REST] Access token expired. Performing proactive background refresh...");
        if (refreshToken) {
          try {
            accessToken = await refreshAccessToken(refreshToken, authData);
            console.log("[REST] Proactive token refresh completed successfully.");
          } catch (refreshErr) {
            console.error("[REST] Proactive token refresh failed, clearing session:", refreshErr);
            localStorage.removeItem(STORAGE_KEY);
            window.location.href = "/login";
            return Promise.reject(refreshErr);
          }
        }
      }

      if (accessToken) {
        config.headers.Authorization = `Bearer ${accessToken}`;
      }
    } catch {
      // malformed storage — ignore
    }
  }
  return config;
});

// ── Response interceptor: handle 401 → refresh ───────────────────────────────
let isRefreshing = false;
let failedQueue = [];

function processQueue(error, token = null) {
  failedQueue.forEach((prom) =>
    error ? prom.reject(error) : prom.resolve(token)
  );
  failedQueue = [];
}

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const original = error.config;

    // Only intercept 401s that haven't already been retried
    if (error.response?.status === 401 && !original._retry) {
      if (isRefreshing) {
        // Queue this request until the refresh resolves
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then((token) => {
          original.headers.Authorization = `Bearer ${token}`;
          return apiClient(original);
        });
      }

      original._retry = true;
      isRefreshing = true;

      try {
        const raw = localStorage.getItem(STORAGE_KEY);
        const { refreshToken } = raw ? JSON.parse(raw) : {};
        if (!refreshToken) throw new Error("No refresh token");

        const { data } = await axios.post(`${BASE_URL}/api/auth/refresh`, {
          refreshToken,
        });
        const newAccessToken = data.data.accessToken;
        const newRefreshToken = data.data.refreshToken;

        // Persist updated tokens
        const stored = raw ? JSON.parse(raw) : {};
        localStorage.setItem(
          STORAGE_KEY,
          JSON.stringify({ ...stored, accessToken: newAccessToken, refreshToken: newRefreshToken })
        );

        processQueue(null, newAccessToken);
        original.headers.Authorization = `Bearer ${newAccessToken}`;
        return apiClient(original);
      } catch (refreshError) {
        processQueue(refreshError, null);
        // Wipe auth and send to login
        localStorage.removeItem(STORAGE_KEY);
        window.location.href = "/login";
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

export default apiClient;
