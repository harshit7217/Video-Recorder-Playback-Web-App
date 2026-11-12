export const ipController = (req, res) => {
  var ip = req.headers["x-forwarded-for"];
  const ipAddress = ip.split(",")[0];

  console.log("Visitor IP:", ipAddress);

  res.send("Your IP: " + ipAddress);
  console.log(ip.data);
};
