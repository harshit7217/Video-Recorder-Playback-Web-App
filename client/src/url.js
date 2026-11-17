const configuredBackendUrl = import.meta.env.VITE_FULL_URL?.trim();

export const API_BASE_URL = configuredBackendUrl.replace(/\/+$/, "");

export function fullUrl(path) {
  return `${API_BASE_URL}/${path.replace(/^\/+/, "")}`;
}
