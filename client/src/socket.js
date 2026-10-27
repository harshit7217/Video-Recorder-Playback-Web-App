import { io } from "socket.io-client";

export const socket = io.connect(
  import.meta.env.VITE_SOCKET_URL || "http://localhost:3001",
  {
    autoConnect: false,
    path: import.meta.env.VITE_SOCKET_PATH,
  },
);

export function emitRecordingEvent(eventName, details = {}) {
  socket.emit(eventName, {
    key: socket.id,
    ...details,
    timestamp: new Date().toISOString(),
  });
}
