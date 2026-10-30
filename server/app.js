import { createServer } from "node:http";
import { Server } from "socket.io";
import express from "express";
import path, { dirname } from "node:path";
import { fileURLToPath } from "node:url";
import cors from "cors";
import { socketActivity } from "./socket/socketActivity.mjs";
import {
  getDataFileNames,
  saveActivitiesToDataFile,
  data,
} from "./services/fileDataService.mjs";

const port = Number(process.env.SOCKET_PORT || 3001);
const clientOrigin = process.env.CLIENT_ORIGIN || "http://localhost:5173";

const app = express();

app.use(
  cors({
    origin: clientOrigin,
  }),
);

const httpServer = createServer(app);

const io = new Server(httpServer, {
  cors: {
    origin: clientOrigin,
  },
});

// socket id store of the recording client's connection
let recordingClientId;

io.on("connection", async (socket) => {
  socket.on("connect", () => {
    console.info(`Socket connected: ${socket.id}`);
  });

  socket.on("registerClient", async () => {
    recordingClientId = socket.id;
  });

  socket.on("requestData", () => {
    io.emit("recordingData", data);
  });

  socket.on("disconnect", async () => {
    console.info(`Socket disconnected: ${socket.id}`);
    if (recordingClientId === socket.id) {
      saveActivitiesToDataFile();
    }
  });

  // events activity reciver
  socket.on("recordActivity", async (details) => {
    for (const key in details) {
      details[key] = socketActivity[details[key]] ?? details[key];
    }
    data.push(details);
    io.emit("activityRecorded", details);
  });

  // clear data reciver
  socket.on("clearActivities", () => {
    data.length = 0;
  });

  // Reading a files
  socket.on("requestFiles", async () => {
    const fileNames = await getDataFileNames();
    io.emit("filesList", fileNames);
  });
});

const __dirname = path.join(
  path.dirname(fileURLToPath(import.meta.url)),
  "/data",
);

app.use("/static", express.static(path.join(__dirname)));

httpServer.listen(port, () => {
  console.info(`Socket.IO server listening on http://localhost:${port}`);
});
