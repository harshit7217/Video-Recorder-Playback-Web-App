import { createServer } from "node:http";
import process from "node:process";
import { Server } from "socket.io";

const port = Number(process.env.SOCKET_PORT || 3001);
const clientOrigin = process.env.CLIENT_ORIGIN || "http://localhost:5173";
const httpServer = createServer();
const io = new Server(httpServer, {
  cors: {
    origin: clientOrigin,
  },
});

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
    let data;
    socket.on(eventName, (details) => {
      console.info(`${eventName} from ${socket.id}`, details);
      data = details;
    });

    io.emit(eventName, data);
  }

  socket.on("disconnect", (reason) => {
    console.info(`Socket disconnected: ${socket.id} (${reason})`);
  });
});

httpServer.listen(port, () => {
  console.info(`Socket.IO server listening on http://localhost:${port}`);
});
