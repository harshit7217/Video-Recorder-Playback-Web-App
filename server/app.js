import { createServer } from "node:http";
import { Server } from "socket.io";
import express from "express";
import path from "node:path";
import { fileURLToPath } from "node:url";
import cors from "cors";
import { registerSocketHandlers } from "./socket/socket.js";
import connectDB from "./config/db.js";
import dotenv from "dotenv";
import employerRoutes from "./routes/employerRoutes.js";
import candidateRoutes from "./routes/candidateRoutes.js";

dotenv.config();

connectDB();

const port = Number(process.env.SOCKET_PORT || 5000);
const clientOrigins = (
  process.env.CLIENT_ORIGIN ||
  "http://localhost:5173,https://video-recorder-playback-web-app-2.onrender.com"
)
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean)
  .map((origin) => new URL(origin).origin);

const app = express();

app.use(cors({ origin: clientOrigins }));
app.use(express.json());

const httpServer = createServer(app);

const io = new Server(httpServer, {
  cors: {
    origin: clientOrigins,
  },
});

const dataDir = path.join(path.dirname(fileURLToPath(import.meta.url)), "data");

export { app, httpServer, io };

app.use("/static", express.static(dataDir));
app.use("/api/employers", employerRoutes);
app.use("/api/candidates", candidateRoutes);

app.get("/", (req, res) => {
  const ip = req.ip;

  console.log("Visitor IP:", ip);

  res.send("Your IP: " + ip);
});

registerSocketHandlers(io);

httpServer.listen(port, () => {
  console.info(`Socket.IO server listening on http://localhost:${port}`);
});
