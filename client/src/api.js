const configuredBackendUrl = import.meta.env.VITE_API_URL?.trim();

export const API_BASE_URL = configuredBackendUrl.replace(/\/+$/, "");

export function apiUrl(path) {
  return `${API_BASE_URL}/${path.replace(/^\/+/, "")}`;
}

export async function readApiResponse(response, fallbackMessage) {
  const responseText = await response.text();
  let data;

  if (responseText) {
    try {
      data = JSON.parse(responseText);
    } catch {
      const details = responseText.slice(0, 200);
      throw new Error(
        `Server returned an invalid response (HTTP ${response.status}): ${details}`,
      );
    }
  }

  if (!response.ok) {
    throw new Error(
      data?.message || `${fallbackMessage} (HTTP ${response.status})`,
    );
  }

  if (!responseText) {
    throw new Error(
      `Server returned an empty response (HTTP ${response.status}).`,
    );
  }

  return data;
}
