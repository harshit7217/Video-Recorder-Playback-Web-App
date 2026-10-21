import { io } from "socket.io-client";

export const socket = io(
  import.meta.env.VITE_SOCKET_URL || "http://localhost:3001",
  {
    autoConnect: false,
    path: import.meta.env.VITE_SOCKET_PATH || "/socket.io",
  },
);

export function emitRecordingEvent(eventName, details = {}) {
  socket.emit(eventName, {
    ...details,
    timestamp: new Date().toISOString(),
  });
}
