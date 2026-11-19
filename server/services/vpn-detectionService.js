export const vpnService = async (ipAddress) => {
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

  if (
    typeof result?.is_vpn !== "boolean" ||
    typeof result?.is_proxy !== "boolean" ||
    (result.is_proxy && typeof result.proxy_type !== "string")
  ) {
    throw new Error("iplogs.com returned incomplete VPN and proxy results");
  }

  return {
    isVpn: result.is_vpn,
    isResidentialProxy:
      result.is_proxy && result.proxy_type === "residential",
    isPublicProxy: result.is_proxy && result.proxy_type === "public",
  };
};
