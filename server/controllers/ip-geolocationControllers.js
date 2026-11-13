import { getIPAddress, ipService } from "../services/ip-geolocationService.js";

export const ipController = async (req, res) => {
  const ipAddress = getIPAddress(req);
  try {
    const data = await ipService(ipAddress);
    res.json(data);
  } catch (error) {
    console.error("IP geolocation lookup failed:", error);
    const isConfigurationError =
      error instanceof Error &&
      error.message === "IPGEO_API_KEY is not configured";

    res.status(isConfigurationError ? 503 : 502).json({
      message: isConfigurationError
        ? "IP geolocation is not configured on the server."
        : "IP geolocation lookup failed. Please try again later.",
    });
  }
};
