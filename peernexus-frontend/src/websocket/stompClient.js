import { Client } from "@stomp/stompjs";
import SockJS from "sockjs-client";

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

  // Dynamically update headers with the latest refreshed token before connecting
  client.beforeConnect = () => {
    const raw = localStorage.getItem("peernexus_auth");
    if (raw) {
      try {
        const { accessToken } = JSON.parse(raw);
        if (accessToken) {
          client.connectHeaders = {
            Authorization: `Bearer ${accessToken}`,
            token: accessToken,
          };
        }
      } catch (err) {
        console.error("[STOMP] Failed to parse auth token for reconnect:", err);
      }
    }
  };

  return client;
}
