import { socketActivity } from "./socketActivity.js";
import {
  getDataFileNames,
  saveActivitiesToDataFile,
  data,
} from "../services/fileDataService.js";

export function registerSocketHandlers(io) {
  io.on("connection", async (socket) => {
    console.info(`Socket connected: ${socket.id}`);
    let isRecordingClient = false;

    socket.on("registerClient", async () => {
      isRecordingClient = true;
    });

    socket.on("requestData", () => {
      io.emit("recordingData", data);
    });

    const saveActivities = async (reason) => {
      try {
        await saveActivitiesToDataFile();
      } catch (error) {
        console.error(`Failed to save activities on ${reason}:`, error);
      }
    };

    socket.on("disconnect", async () => {
      console.info(`Socket disconnected: ${socket.id}`);
      if (isRecordingClient) {
        await saveActivities("recording client disconnect");
      }
    });

    // events activity reciver
    socket.on("recordActivity", async (details) => {
      const shouldSave = isRecordingClient &&
        details?.eventName === "recording:stopped";
      for (const key in details) {
        details[key] = socketActivity[details[key]] ?? details[key];
      }
      data.push(details);
      io.emit("activityRecorded", details);

      if (shouldSave) {
        await saveActivities("recording stop");
      }
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
