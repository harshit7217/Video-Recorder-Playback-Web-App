import { IpGeolocationClient } from "ip-geolocation-api-javascript-sdk";

export const ipService = async (ipAddress) => {
  console.log("calling ip service");
  const client = new IpGeolocationClient({
    apiKey: process.env.IPGEO_API_KEY,
  });

  try {
    const response = await client.lookupIpGeolocation({
      ip: ipAddress,
    });

    console.log(response.data);
  } finally {
    await client.close();
  }
};
