import { getIPAddress } from "../services/ip-geolocationService.js";
import { vpnService } from "../services/vpn-detectionService.js";

export const vpnController = async (req, res) => {
  const ipAddress = getIPAddress(req);
  try {
    const data = await vpnService(ipAddress);
    return res.json(data);
  } catch (error) {
    console.error("VPN and proxy detection failed:", error);
    return res.status(502).json({
      message: "VPN and proxy detection failed. Please try again later.",
    });
  }
};