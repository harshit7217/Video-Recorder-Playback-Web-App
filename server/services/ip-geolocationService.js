import { IpGeolocationClient } from "ip-geolocation-api-javascript-sdk";
import ip2location from "ip-to-location";

export const ipService = async (ipAddress) => {
  return ip2location.fetch(ipAddress);
};

// export const ipService = async (ipAddress) => {
//   const apiKey = process.env.IPGEO_API_KEY;
//   if (!apiKey) {
//     throw new Error("IPGEO_API_KEY is not configured");
//   }

//   const client = new IpGeolocationClient({
//     apiKey,
//     connectTimeoutMs: 5000,
//     readTimeoutMs: 5000,
//   });
//   console.log(client);

//   try {
//     const response = await client.lookupIpGeolocation({
//       ip: ipAddress,
//     });
//     return response.data;
//   } finally {
//     await client.close();
//   }
// };

export const getIPAddress = (req) => {
  return req.headers["x-forwarded-for"]?.split(",")[0].trim() || req.ip;
};
