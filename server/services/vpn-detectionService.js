import { VPNDetection } from "vpndetection";

export const vpnService = async (ipAddress) => {
  const client = new VPNDetection();

  const response = await client.lookup(ipAddress);

  return response.isVpn;
};
