import { ipService } from "../services/ip-geolocationService";

export const ipController = (req, res) => {
  var ip = req.headers["x-forwarded-for"];
  const ipAddress = ip.split(",")[0];

  ipService(ipAddress).catch((error) => {
    console.error(error);
  });
};
