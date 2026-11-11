import { io } from "socket.io-client";

export const socket = io.connect(
  import.meta.env.VITE_SOCKET_URL || window.location.origin,
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
