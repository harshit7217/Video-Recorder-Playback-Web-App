import { getIPAddress } from "../services/ip-geolocationService.js"
import { vpnService } from "../services/vpn-detectionService.js";

export const vpnController = async (req, res) => {
    const ipAddress = getIPAddress(req);
    try {
        const data = await vpnService(ipAddress);
        res.json(data);
    }catch( error){
        console.error("VPN detection falied:", error);
        const isConfigurationError = error instanceof Error && error.message === "VPN DETECTION is not configured";
        res.status(isConfigurationError ? 503 : 502).json({message: isConfigurationError ? "VPN Detection is not configured" : "PN detection lookup failed. Please try again later."});
    }
}