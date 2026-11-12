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
import { ipController } from "./controllers/ip-geolocationControllers.js";

dotenv.config();

connectDB();

const port = Number(process.env.SOCKET_PORT || 5000);
const clientOrigin =
  process.env.CLIENT_ORIGIN ||
  "https://video-recorder-playback-web-app-2.onrender.com";

const app = express();

app.use(cors({ origin: clientOrigin }));
app.use(express.json());

const httpServer = createServer(app);

const io = new Server(httpServer, {
  cors: {
    origin: clientOrigin,
  },
});

const dataDir = path.join(path.dirname(fileURLToPath(import.meta.url)), "data");

export { app, httpServer, io };

app.use("/static", express.static(dataDir));
app.use("/api/employers", employerRoutes);
app.use("/api/candidates", candidateRoutes);

app.set("trust proxy", true);
app.use("/ip-geolocation", ipController);

registerSocketHandlers(io);

httpServer.listen(port, () => {
  console.info(`Socket.IO server listening on http://localhost:${port}`);
});
