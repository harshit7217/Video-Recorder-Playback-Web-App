import { createServer } from "node:http";
import { Server } from "socket.io";
import express from "express";
import cors from "cors";
import { socketActivity } from "./socketActivity.mjs";
import {
  getDataFileNames,
  saveActivitiesToDataFile,
  data,
  readDataFile,
  getUniqueKeysFromFile,
  getEntriesByKey,
} from "./fileOperation.mjs";

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

// socket id store of the videorecording's connection
let clientId;

io.on("connection", async (socket) => {
  socket.on("connect", () => {
    console.info(`Socket connected: ${socket.id}`);
  });

  socket.on("clientId", async () => {
    clientId = socket.id;
  });

  socket.on("getData", () => {
    io.emit("data", data);
  });

  socket.on("disconnect", async () => {
    console.info(`Socket disconnected: ${socket.id}`);
    if (clientId === socket.id) {
      saveActivitiesToDataFile();
    }
  });

  // events activity reciver
  socket.on("activities", async (details) => {
    for (const key in details) {
      details[key] = socketActivity[details[key]] ?? details[key];
    }
    data.push(details);
    io.emit("activities", details);
  });

  // clear data reciver
  socket.on("clear", () => {
    data.length = 0;
  });

  // Reading a files
  socket.on("filesRead", async () => {
    const fileNames = await getDataFileNames();
    io.emit("filesRead", fileNames);
  });

  socket.on("keyRead", async (filename) => {
    await readDataFile(filename);
    const keyOfFile = getUniqueKeysFromFile();
    io.emit("keyOfFile", keyOfFile);
  });

  socket.on("fileData", (key) => {
    const selectedEntries = getEntriesByKey(key);
    io.emit("sendingData", selectedEntries);
  });
});

httpServer.listen(port, () => {
  console.info(`Socket.IO server listening on http://localhost:${port}`);
});
