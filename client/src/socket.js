import { io } from "socket.io-client";

const socketUrl = "https://video-recorder-playback-web-app-1.onrender.com";

export const socket = io.connect(socketUrl, {
  autoConnect: false,
  path: import.meta.env.VITE_SOCKET_PATH?.trim() || "/socket.io",
});

export function emitRecordingActivity(details = {}) {
  socket.emit("recordActivity", {
    key: socket.id,
    ...details,
    timestamp: new Date().toISOString(),
  });
}
