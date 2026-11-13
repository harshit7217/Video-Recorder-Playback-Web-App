import { IpGeolocationClient } from "ip-geolocation-api-javascript-sdk";

export const ipService = async (ipAddress) => {
  const apiKey = process.env.IPGEO_API_KEY;
  if (!apiKey) {
    throw new Error("IPGEO_API_KEY is not configured");
  }

  const client = new IpGeolocationClient({
    apiKey,
    connectTimeoutMs: 5000,
    readTimeoutMs: 5000,
  });

  try {
    const response = await client.lookupIpGeolocation({
      ip: ipAddress,
    });
    return response.data;
  } finally {
    await client.close();
  }
};

export const getIPAddress = (req, res) => {
  const ipAddress = "122.161.48.154"
    // req.headers["x-forwarded-for"]?.split(",")[0].trim() || req.ip;
  return ipAddress;
};
