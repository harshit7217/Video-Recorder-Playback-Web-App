import { createServer } from "node:http";
import { Server } from "socket.io";
import express from "express";
import cors from "cors";
import { once } from "node:events";
import { appendFile, open, readdir } from "node:fs/promises";

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

// temporary data store
let data = [];

const socketActivity = {
  "camera-connected": "1",
  "camera:disconnected": "2",
  "recording:started": "3",
  "recording:paused": "4",
  "recording:resumed": "5",
  "recording:stopped": "6",
  "text:copied": "7",
  "text:pasted": "8",
  "window:resized": "9",
  "window:focused": "10",
  "window:blurred": "11",
  "screen:fullscreen-entered": "12",
  "screen:fullscreen-exited": "13",
};

// Creating a file name of current date
const d = new Date();
const day = String(d.getDate()).padStart(2, "0");
const month = String(d.getMonth() + 1).padStart(2, "0");
const year = d.getFullYear();
const fileName = day + "-" + month + "-" + year + ".txt";
await appendFile(`data/${fileName}`, "a");

// socket id store of the videorecording's connection
let clientId;

const getDataFileNames = async () => {
  let d = "./data";
  try {
    const files = await readdir(d);
    return files;
  } catch (err) {
    console.error("there was an error ", err);
  }
};

const saveActivitiesToFile = async () => {
  const fd = await open(`data/${fileName}`, "a");
  try {
    const stream = await fd.createWriteStream({ autoClose: true });
    const finished = once(stream, "finish");
    for (const obj of data) {
      const chunk = JSON.stringify(obj) + "\n";

      if (!stream.write(chunk)) {
        await stream.write(chunk);
      }
    }
    stream.end();
    await finished;
  } catch (err) {
    console.error("there was an error", err);
  } finally {
    await fd.close();
    data.length = 0;
  }
};

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
      saveActivitiesToFile();
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


});

httpServer.listen(port, () => {
  console.info(`Socket.IO server listening on http://localhost:${port}`);
});
