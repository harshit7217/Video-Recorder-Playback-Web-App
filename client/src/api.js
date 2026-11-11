const defaultBackendUrl =
  "https://video-recorder-playback-web-app.onrender.com";
const configuredBackendUrl = import.meta.env.VITE_API_URL?.trim();

export const API_BASE_URL = (
  configuredBackendUrl ||
  (import.meta.env.DEV ? "" : defaultBackendUrl)
).replace(/\/+$/, "");

export function apiUrl(path) {
  return `${API_BASE_URL}/${path.replace(/^\/+/, "")}`;
}
