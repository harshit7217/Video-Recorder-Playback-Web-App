import { createServer } from "node:http";
import { Server } from "socket.io";
import express from "express";
import path from "node:path";
import { fileURLToPath } from "node:url";
import cors from "cors";
import { registerSocketHandlers } from "./socket/socket.js";

const port = Number(process.env.SOCKET_PORT || 3001);
const clientOrigin = process.env.CLIENT_ORIGIN || "http://localhost:5173";

const app = express();

app.use(cors({ origin: clientOrigin }));

const httpServer = createServer(app);

const io = new Server(httpServer, {
  cors: {
    origin: clientOrigin,
  },
});

const dataDir = path.join(path.dirname(fileURLToPath(import.meta.url)), "data");

export { app, httpServer, io };

app.use("/static", express.static(dataDir));

registerSocketHandlers(io);

httpServer.listen(port, () => {
  console.info(`Socket.IO server listening on http://localhost:${port}`);
});
