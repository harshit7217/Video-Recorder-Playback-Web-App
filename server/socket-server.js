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
    "recording:started",
    "recording:paused",
    "recording:resumed",
    "recording:stopped",
  ]) {
    socket.on(eventName, (details) => {
      console.info(`${eventName} from ${socket.id}`, details);
    });
  }

  socket.on("disconnect", (reason) => {
    console.info(`Socket disconnected: ${socket.id} (${reason})`);
  });
});

httpServer.listen(port, () => {
  console.info(`Socket.IO server listening on http://localhost:${port}`);
});
