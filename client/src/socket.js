import { io } from "socket.io-client";
import { API_BASE_URL } from "./api";

const configuredSocketUrl = import.meta.env.VITE_SOCKET_URL?.trim();
// const socketUrl = configuredSocketUrl || API_BASE_URL || window.location.origin;
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
