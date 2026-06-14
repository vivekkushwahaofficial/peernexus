import { useContext } from "react";
import { WebSocketContext } from "../context/WebSocketContext.jsx";

export function useWebSocket() {
  const context = useContext(WebSocketContext);
  if (!context) {
    throw new Error("useWebSocket must be used within WebSocketProvider");
  }
  return context;
}
