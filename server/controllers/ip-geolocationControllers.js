export const ipController = (req, res) => {
  var ip = req.headers["x-forwarded-for"];

  console.log("Visitor IP:", ip);

  res.send("Your IP: " + ip.split(",")[0]);
};
