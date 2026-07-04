import { Client } from "@stomp/stompjs";
import SockJS from "sockjs-client";
import axios from "axios";

function isTokenExpired(token) {
  if (!token) return true;
  try {
    const parts = token.split(".");
    if (parts.length !== 3) return true;
    const payload = JSON.parse(atob(parts[1]));
    const exp = payload.exp;
    // Safety skew: check if token expires within the next 10 seconds
    return (Date.now() / 1000) >= (exp - 10);
  } catch (e) {
    return true;
  }
}

export function createStompClient(token) {
  const baseUrl = import.meta.env.VITE_API_BASE_URL || "http://localhost:8080";

  const client = new Client({
    webSocketFactory: () => new SockJS(`${baseUrl}/ws`),
    connectHeaders: {
      Authorization: `Bearer ${token}`,
      token: token,
    },
    debug: (str) => {
      if (import.meta.env.DEV) {
        console.log("[STOMP]", str);
      }
    },
    reconnectDelay: 5000,
    heartbeatIncoming: 4000,
    heartbeatOutgoing: 4000,
  });

  // Dynamically refresh and update headers with the latest token before connecting
  client.beforeConnect = async () => {
    const raw = localStorage.getItem("peernexus_auth");
    if (!raw) return;

    try {
      const authData = JSON.parse(raw);
      let accessToken = authData.accessToken;
      const refreshToken = authData.refreshToken;

      if (accessToken && isTokenExpired(accessToken)) {
        console.log("[STOMP] Access token expired, attempting background refresh...");
        if (refreshToken) {
          try {
            const response = await axios.post(`${baseUrl}/api/auth/refresh`, {
              refreshToken,
            });
            const newAccessToken = response.data.data.accessToken;
            const newRefreshToken = response.data.data.refreshToken;

            localStorage.setItem(
              "peernexus_auth",
              JSON.stringify({ ...authData, accessToken: newAccessToken, refreshToken: newRefreshToken })
            );
            accessToken = newAccessToken;
            console.log("[STOMP] Token refreshed successfully before websocket connection.");
          } catch (refreshErr) {
            console.error("[STOMP] Failed to refresh token before websocket connection, redirecting to login:", refreshErr);
            localStorage.removeItem("peernexus_auth");
            window.location.href = "/login";
            throw refreshErr;
          }
        }
      }

      if (accessToken) {
        client.connectHeaders = {
          Authorization: `Bearer ${accessToken}`,
          token: accessToken,
        };
      }
    } catch (err) {
      console.error("[STOMP] beforeConnect execution failed:", err);
    }
  };

  return client;
}
