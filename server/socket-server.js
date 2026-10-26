import { createServer } from "node:http";
import { Server } from "socket.io";
import express from "express";
import cors from "cors";
import { once } from "node:events";
import { appendFile, open } from "node:fs/promises";

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

let data = [];
const d = new Date();
const day = String(d.getDate()).padStart(2, "0");
const month = String(d.getMonth() + 1).padStart(2, "0");
const year = d.getFullYear();
const fileName = day + "-" + month + "-" + year + ".txt";
await appendFile(`data/${fileName}`, "");
let clientId;
io.on("connection", async (socket) => {
  console.info(`Socket connected: ${socket.id}`);

  socket.on("clientId", () => {
    clientId = socket.id;
  });

  socket.on("getData", () => {
    io.emit("data", data);
  });

  socket.on("disconnect", async () => {
    console.info(`Socket disconnected: ${socket.id}`);

    if (clientId === socket.id) {
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
        io.emit("disconnet");
        data.length = 0;
      }
    }
  });

  socket.on("activities", (details) => {
    data.push(details);
    io.emit("activities", details);
  });

  socket.on("clear", () => {
    data.length = 0;
  });
});

httpServer.listen(port, () => {
  console.info(`Socket.IO server listening on http://localhost:${port}`);
});
