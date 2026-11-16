import ip2location from "ip-to-location";

export const ipService = async (ipAddress) => {
  return ip2location.fetch(ipAddress);
};

export const getIPAddress = (req) => {
  return req.headers["x-forwarded-for"]?.split(",")[0].trim() || req.ip;
};
