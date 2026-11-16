import { VPNDetection } from "vpndetection";

export const vpnService = async (ipAddress) => {
  // const client = new VPNDetection();
  // const response = await client.lookup(ipAddress);

  // const result1 = await fetch("https://api.ipify.org?format=json");
  // const responsedata = await result1.json();
  // const reuqested_ip = responsedata.ip;
  // console.log("result", responsedata);

  const response = await fetch("https://iplogs.com/v1/check", {
    method: "POST",
    headers: {
      "content-type": "application/json",
    },
    body: JSON.stringify({ ip: ipAddress }),
    signal: AbortSignal.timeout(30_000),
  });
  if (!response.ok) throw new Error(`iplogs.com answered ${response.status}`);
  const result = await response.json();
  return result.is_vpn;
};
