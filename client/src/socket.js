import { io } from "socket.io-client";
import { API_BASE_URL } from "./api";

export const socket = io.connect(
  import.meta.env.VITE_SOCKET_URL ||
    API_BASE_URL ||
    window.location.origin,
  {
    autoConnect: false,
    path: import.meta.env.VITE_SOCKET_PATH || "/socket.io",
  },
);

export function emitRecordingActivity(details = {}) {
  socket.emit("recordActivity", {
    key: socket.id,
    ...details,
    timestamp: new Date().toISOString(),
  });
}
