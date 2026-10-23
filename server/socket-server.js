import { createServer } from "node:http";
import { Server } from "socket.io";
import express from "express";
import cors from "cors";
// import sqlite3 from "sqlite3";
// import { open } from "sqlite";

// const db = await open({
//   filename: "data.db",
//   driver: sqlite3.Database,
// });

// await db.exec(`
//   CREATE TABLE IF NOT EXISTS monitoring (
//     id INTEGER PRIMARY KEY AUTOINCREMENT,
//     reason TEXT,
//     eventName TEXT,
//     timestamp TEXT
//   )
// `);

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

io.on("connection", (socket) => {
  console.info(`Socket connected: ${socket.id}`);

  // socket.on("storedata", (data) => {
  //   let result;
  //   data.map(async (d) => {
  //     try {
  //       result = await db.run(
  //         "INSERT INTO monitoring (reason, eventName, timestamp ) VALUES (d.reason, d.eventName, d.timestamp)",
  //         d,
  //       );
  //     } catch (error) {
  //       console.log("database error: ", error);
  //     }
  //   });
  //   console.log("database data: ", result);
  // });

  socket.on("data", () => {
    io.emit("data", data);
  });

  socket.on("activities", (details) => {
    data.push(details);
    io.emit("activities", details);
  });

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
