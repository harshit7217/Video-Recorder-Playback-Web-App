import { VPNDetection } from "vpndetection";

export const vpnService = async (ipAddress) => {
  // const client = new VPNDetection();
  // const response = await client.lookup(ipAddress);

  const response = await fetch("https://iplogs.com/v1/check", {
    method: "POST",
    headers: {
      "content-type": "application/json",
    },
    body: JSON.stringify({ ip: ipAddress }),
    signal: AbortSignal.timeout(30_000),
  });
  if (!response.ok) throw new Error(`iplogs.com answered ${response.status}`);
  const { is_vpn } = await response.json();
  return is_vpn;
};
