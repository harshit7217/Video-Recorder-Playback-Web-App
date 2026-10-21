import { createServer } from "node:http";
import process from "node:process";
import { Server } from "socket.io";

const port = Number(process.env.SOCKET_PORT || 3001);
const clientOrigin = process.env.CLIENT_ORIGIN || "http://localhost:5173";
const httpServer = createServer((req, res) => {
  // CORS for the plain HTTP route (Socket.IO handles its own)
  res.setHeader("Access-Control-Allow-Origin", clientOrigin);

  if (req.method === "GET" && req.url === "/api/details") {
    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify(data));
    return;
  }

  if (req.method === "DELETE" && req.url === "/api/details") {
    data = [];
    res.writeHead(204);
    res.end();
    return;
  }

  // Socket.IO answers /socket.io/ requests itself; everything else is 404
  if (!req.url.startsWith("/socket.io")) {
    res.writeHead(404);
    res.end();
  }
});

const io = new Server(httpServer, {
  cors: {
    origin: clientOrigin,
  },
});

let data = [];

io.on("connection", (socket) => {
  console.info(`Socket connected: ${socket.id}`);

  for (const eventName of [
    "camera:connected",
    "camera:disconnected",
    "recording:started",
    "recording:paused",
    "recording:resumed",
    "recording:stopped",
    "text:copy",
    "text:paste",
    "window:onFocus",
    "window:onBlur",
    "window:size",
    "screen:full-screen",
    "screen:not-full-screen",
  ]) {
    socket.on(eventName, (details) => {
      // console.info(`${eventName} from ${socket.id}`, details);
      details = { ...details, eventName: eventName };
      data.push(details);
    });
  }

  socket.on("disconnect", (reason) => {
    console.info(`Socket disconnected: ${socket.id} (${reason})`);
    console.log(data);
  });
});

httpServer.listen(port, () => {
  console.info(`Socket.IO server listening on http://localhost:${port}`);
});
