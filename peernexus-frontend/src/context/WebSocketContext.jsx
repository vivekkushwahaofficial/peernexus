import React, {
  createContext,
  useEffect,
  useState,
  useRef,
  useCallback,
} from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useAuth } from "../hooks/useAuth.js";
import { createStompClient } from "../websocket/stompClient.js";

export const WebSocketContext = createContext(null);

export function WebSocketProvider({ children }) {
  const { accessToken, isAuthenticated } = useAuth();
  const queryClient = useQueryClient();
  const [connected, setConnected] = useState(false);
  const stompClientRef = useRef(null);
  const subscriptionsRef = useRef({});

  const connect = useCallback(
    (token) => {
      if (stompClientRef.current) {
        stompClientRef.current.deactivate();
      }

      const client = createStompClient(token);

      client.onConnect = (frame) => {
        setConnected(true);
        console.log("[STOMP] Connected successfully");

        // ── Subscribe to personal notification queue ──────────────────────
        // The backend pushes to /user/queue/notifications via SimpMessagingTemplate
        client.subscribe("/user/queue/notifications", (message) => {
          try {
            const notification = JSON.parse(message.body);
            console.debug("[STOMP] Notification received:", notification);
            // Invalidate the notifications cache so the badge refreshes instantly
            queryClient.invalidateQueries({ queryKey: ["notifications"] });
          } catch (err) {
            console.error("[STOMP] Failed to parse notification:", err);
          }
        });

        // Restore active subscriptions if reconnecting
        Object.keys(subscriptionsRef.current).forEach((dest) => {
          const sub = subscriptionsRef.current[dest];
          if (client.connected) {
            sub.subscription = client.subscribe(dest, sub.callback);
          }
        });
      };

      client.onDisconnect = () => {
        setConnected(false);
        console.log("[STOMP] Disconnected");
      };

      client.onStompError = (frame) => {
        console.error(
          "[STOMP] Protocol error:",
          frame.headers["message"],
          frame.body
        );
      };

      client.activate();
      stompClientRef.current = client;
    },
    [queryClient]
  );

  const disconnect = useCallback(() => {
    if (stompClientRef.current) {
      stompClientRef.current.deactivate();
      stompClientRef.current = null;
      setConnected(false);
    }
  }, []);

  useEffect(() => {
    if (isAuthenticated && accessToken) {
      connect(accessToken);
    } else {
      disconnect();
    }
    return () => disconnect();
  }, [isAuthenticated, accessToken, connect, disconnect]);

  const subscribe = useCallback((destination, callback) => {
    const client = stompClientRef.current;

    // Save in subscription state for re-connections
    subscriptionsRef.current[destination] = { callback, subscription: null };

    if (client && client.connected) {
      const sub = client.subscribe(destination, callback);
      subscriptionsRef.current[destination].subscription = sub;
    }

    return () => {
      const subInfo = subscriptionsRef.current[destination];
      if (subInfo) {
        if (subInfo.subscription) {
          subInfo.subscription.unsubscribe();
        }
        delete subscriptionsRef.current[destination];
      }
    };
  }, []);

  const send = useCallback((destination, body = {}, headers = {}) => {
    const client = stompClientRef.current;
    if (client && client.connected) {
      client.publish({
        destination,
        body: JSON.stringify(body),
        headers,
      });
      return true;
    }
    console.warn("[STOMP] Client not connected. Cannot send to:", destination);
    return false;
  }, []);

  return (
    <WebSocketContext.Provider
      value={{ connected, stompClient: stompClientRef.current, subscribe, send }}
    >
      {children}
    </WebSocketContext.Provider>
  );
}

export default WebSocketContext;
