import { io } from "socket.io-client";

const socketUrl = import.meta.env.VITE_SOCKET_URL;

export const socket = io.connect(socketUrl, {
  autoConnect: false,
  transports: ["websocket", "polling"],
});

export function emitRecordingActivity(details = {}) {
  socket.emit("recordActivity", {
    key: socket.id,
    ...details,
    timestamp: new Date().toISOString(),
  });
}
