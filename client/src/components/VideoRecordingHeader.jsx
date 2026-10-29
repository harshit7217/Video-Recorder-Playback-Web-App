import { useState } from "react";
import { emitRecordingActivity } from "../socket.js";
import Button from "./Button.jsx";
import { useEffect } from "react";

const VideoRecordingHeader = ({ connectionStatus, isRecordingActive }) => {
  const [isFullScreen, setIsFullscreen] = useState(false);

  const toggleFullScreen = () => {
    if (!document.fullscreenElement) {
      entreFullScreen();
    } else {
      exitFullScreen();
    }
  };

  const exitFullScreen = async () => {
    await document.exitFullscreen();
    emitRecordingActivity({
      reason: "user exit full screen",
      eventName: "screen:fullscreen-exited",
    });
    setIsFullscreen(false);
  };

  const entreFullScreen = async () => {
    await document.documentElement.requestFullscreen();
    emitRecordingActivity({
      reason: "user enter full screen",
      eventName: "screen:fullscreen-entered",
    });
    setIsFullscreen(true);
  };

  useEffect(() => {
    const handleFullscreenChange = (e) => {
      if (
        !document.webkitIsFullScreen &&
        !document.mozFullScreen &&
        !document.msFullscreenElement
      ) {
        emitRecordingActivity({
          reason: "user exit full screen",
          eventName: "screen:fullscreen-exited",
        });
        setIsFullscreen(false);
      }
    };
    document.addEventListener(
      "webkitfullscreenchange",
      handleFullscreenChange,
      false,
    );
    document.addEventListener(
      "mozfullscreenchange",
      handleFullscreenChange,
      false,
    );
    document.addEventListener(
      "fullscreenchange",
      handleFullscreenChange,
      false,
    );
    document.addEventListener(
      "MSFullscreenChange",
      handleFullscreenChange,
      false,
    );
    return () => {
      document.removeEventListener(
        "webkitfullscreenchange",
        handleFullscreenChange,
        false,
      );
      document.removeEventListener(
        "mozfullscreenchange",
        handleFullscreenChange,
        false,
      );
      document.removeEventListener(
        "fullscreenchange",
        handleFullscreenChange,
        false,
      );
      document.removeEventListener(
        "MSFullscreenChange",
        handleFullscreenChange,
        false,
      );
    };
  }, []);

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
            connectionStatus === "connected"
              ? "text-green-700"
              : "text-amber-700"
          }`}
          role="status"
        >
          <span
            className={`h-2 w-2 rounded-full ${
              connectionStatus === "connected" ? "bg-green-500" : "bg-amber-500"
            }`}
          />
          Socket server: {connectionStatus}
        </p>
      </div>

      <div className="flex flex-col justify-between gap-2">
        {isRecordingActive && (
          <div className="flex items-center gap-2 self-center rounded-full bg-red-50 px-3 py-1.5 text-sm font-medium text-red-600">
            <span className="h-2 w-2 animate-pulse rounded-full bg-red-500" />
            Recording
          </div>
        )}
        <Button
          label={isFullScreen ? "Exit Full Screen" : "Full Screen"}
          onClick={toggleFullScreen}
        />
      </div>
    </div>
  );
};

export default VideoRecordingHeader;
