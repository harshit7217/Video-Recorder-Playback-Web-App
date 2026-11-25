import { useState } from "react";
import { emitRecordingActivity } from "../../socket.js";
import Button from "./../ui/Button.jsx";
import { useEffect } from "react";

const RecordingHeader = ({ connectionStatus, isRecordingActive }) => {
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
    <div
      className="
  flex flex-col gap-4
  bg-gradient-to-r from-white via-[#F8F8FF] to-[#F5F4FF]
  px-4 py-5
  dark:from-slate-800 dark:via-slate-800 dark:to-indigo-950/30
  sm:px-6 sm:py-5
  md:flex-row md:items-center md:justify-between
  md:px-7
"
    >
      {/* Left Section */}
      <div className="min-w-0">
        <div className="flex items-center gap-3">
          <div
            className="
        flex h-11 w-11 shrink-0
        items-center justify-center
        rounded-xl bg-indigo-600
        text-white shadow-lg shadow-indigo-200/60
        dark:shadow-none
      "
          >
            <svg
              className="h-5 w-5"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
            >
              <rect x="3" y="5" width="18" height="14" rx="2" />
              <path d="m10 9 5 3-5 3z" />
            </svg>
          </div>

          <div className="min-w-0">
            <h2
              className="
          text-lg font-bold tracking-tight
          text-slate-900 dark:text-white
          sm:text-xl
        "
            >
              Video Recording
            </h2>

            <p
              className="
          mt-0.5 text-xs leading-5
          text-slate-500 dark:text-slate-400
          sm:text-sm
        "
            >
              Record your video and customize the background.
            </p>
          </div>
        </div>

        {/* Connection Status */}
        <div
          className={`
        mt-3 inline-flex items-center gap-2
        rounded-full px-3 py-1.5
        text-[11px] font-semibold
        ${
          connectionStatus === "connected"
            ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400"
            : "bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400"
        }
      `}
          role="status"
          aria-live="polite"
        >
          <span
            className={`
        h-2 w-2 rounded-full
        ${
          connectionStatus === "connected"
            ? "bg-emerald-500"
            : "animate-pulse bg-amber-500"
        }
      `}
          />
          Socket Server: {connectionStatus}
        </div>
      </div>

      {/* Right Section */}
      <div
        className="
    flex flex-wrap items-center
    gap-2.5 sm:gap-3
  "
      >
        {/* Recording Status */}
        {isRecordingActive && (
          <div
            className="
        inline-flex items-center gap-2
        rounded-xl
        bg-red-50 px-3.5 py-2.5
        text-xs font-bold text-red-600
        dark:bg-red-950/40 dark:text-red-400
      "
          >
            <span className="relative flex h-2.5 w-2.5">
              <span
                className="
            absolute inline-flex h-full w-full
            animate-ping rounded-full
            bg-red-400 opacity-60
          "
              />
              <span
                className="
            relative inline-flex h-2.5 w-2.5
            rounded-full bg-red-500
          "
              />
            </span>
            REC
            <span className="font-medium">Recording</span>
          </div>
        )}

        {/* Fullscreen Button */}
        <Button
          label={isFullScreen ? "Exit Full Screen" : "Full Screen"}
          onClick={toggleFullScreen}
        />
      </div>
    </div>
  );
};

export default RecordingHeader;
