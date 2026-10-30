import { socketActivity } from "./socketActivity.js";
import {
  getDataFileNames,
  saveActivitiesToDataFile,
  data,
} from "../services/fileDataService.js";

export function registerSocketHandlers(io) {
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
}
