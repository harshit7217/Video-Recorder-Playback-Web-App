import { useState } from "react";
import { emitRecordingEvent } from "../socket.js";
import Button from "./Button.jsx";

const VideoRecordingHeader = ({ socketStatus, isRecording }) => {
  const [isFullscreen, setIsFullscreen] = useState(false);

  const toggleFullscreen = async () => {
    if (!document.fullscreenElement) {
      await document.documentElement.requestFullscreen();
      emitRecordingEvent("event", {
        reason: "user entred full screen",
        eventName: "screen:full-screen",
      });
    } else {
      await document.exitFullscreen();
      emitRecordingEvent("event", {
        reason: "user exit full screen",
        eventName: "screen:not-full-screen",
      });
    }
    setIsFullscreen(!isFullscreen);
  };

  return (
    <div className="flex flex-col gap-3 border-b border-[#EEF0F7] px-5 py-4 sm:flex-row sm:items-center sm:justify-between md:px-7">
      <div>
        <h2 className="text-lg font-semibold text-[#030164] md:text-xl">
          Video Recording
        </h2>
        <p className="mt-1 text-sm text-gray-500">
          Record your video and customize the background
        </p>
        <p
          className={`mt-2 flex items-center gap-2 text-xs ${
            socketStatus === "connected" ? "text-green-700" : "text-amber-700"
          }`}
          role="status"
        >
          <span
            className={`h-2 w-2 rounded-full ${
              socketStatus === "connected" ? "bg-green-500" : "bg-amber-500"
            }`}
          />
          Socket server: {socketStatus}
        </p>
      </div>

      <div className="flex flex-col justify-between gap-2">
        {isRecording && (
          <div className="flex items-center gap-2 self-start rounded-full bg-red-50 px-3 py-1.5 text-sm font-medium text-red-600">
            <span className="h-2 w-2 animate-pulse rounded-full bg-red-500" />
            Recording
          </div>
        )}
        <Button
          title={isFullscreen ? "Exit Full Screen" : "Full Screen"}
          onClick={toggleFullscreen}
        />
      </div>
    </div>
  );
};

export default VideoRecordingHeader;
