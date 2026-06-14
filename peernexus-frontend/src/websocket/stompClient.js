import { Client } from "@stomp/stompjs";
import SockJS from "sockjs-client";

export function createStompClient(token) {
  const baseUrl = import.meta.env.VITE_API_BASE_URL || "http://localhost:8080";

  return new Client({
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
}
