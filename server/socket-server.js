import { createServer } from "node:http";
import process from "node:process";
import { Server } from "socket.io";

const port = Number(process.env.SOCKET_PORT || 3001);
const clientOrigin = process.env.CLIENT_ORIGIN || "http://localhost:5173";
const httpServer = createServer((req, res) => {
  res.setHeader("Access-Control-Allow-Origin", clientOrigin);
  res.setHeader("Access-Control-Allow-Methods", "GET, DELETE, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
});

const io = new Server(httpServer, {
  cors: {
    origin: clientOrigin,
  },
});

let data = [];

io.on("connection", (socket) => {
  console.info(`Socket connected: ${socket.id}`);

  io.emit("data", data);

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
      console.info(`${eventName} from ${socket.id}`, details);
      details = { ...details, eventName: eventName };
      data.push(details);
      io.emit("data", data);
    });
  }

  socket.on("clear", () => {
    data.length = 0;
  });

  socket.on("disconnect", (reason) => {
    console.info(`Socket disconnected: ${socket.id} (${reason})`);
  });
});

httpServer.listen(port, () => {
  console.info(`Socket.IO server listening on http://localhost:${port}`);
});
