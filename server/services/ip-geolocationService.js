import ip2location from "ip-to-location";

export const ipService = async (ipAddress) => {
  return ip2location.fetch(ipAddress);
};

export const getIPAddress = (req) => {
  return "14.140.15.12";
  // req.headers["x-forwarded-for"]?.split(",")[0].trim() || req.ip;
};
