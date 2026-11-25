import { useState, useRef, useEffect, useCallback } from "react";
import { emitRecordingActivity, socket } from "../../socket.js";
import RecordingHeader from "./RecordingHeader.jsx";
import RecordingScreen from "./RecordingScreen.jsx";
import RecordingVideoResult from "./RecordedVideoResult.jsx";
import debounce from "debounce";

const RecordingPage = ({ connectionStatus }) => {
  const [isRecordingActive, setIsRecordingActive] = useState(false);
  const [currentVideoIndex, setCurrentVideoIndex] = useState(-1);
  const [recordedVideos, setRecordedVideos] = useState([]);

  const videoElementRef = useRef(null);
  const backgroundImagesRef = useRef([]);

  const loadBackgroundImage = useCallback((imageUrl, index) => {
    const image = new Image();
    image.crossOrigin = "anonymous";
    image.onload = () => {
      backgroundImagesRef.current[index] = image;
    };
    image.onerror = (error) => {
      console.error("Failed to load background image", error);
    };
    image.src = imageUrl;
  });

  const handleClipboardAction = useCallback(async (event, status) => {
    if (!event) return;

    const clipboardData = event.clipboardData || window.clipboardData;
    const selectedText = window.getSelection()?.toString() || "";
    const pastedText = clipboardData ? clipboardData.getData("text") : "";

    if (status === "copy") {
      navigator.clipboard.writeText(selectedText);
      emitRecordingActivity({
        reason: `user copied text to clipboard - (${selectedText})`,
        eventName: "text:copied",
      });
      return;
    }

    emitRecordingActivity({
      reason: `user pasted text to clipboard - (${pastedText})`,
      eventName: "text:pasted",
    });
  }, []);

  useEffect(() => {
    const handleWindowFocus = () => {
      emitRecordingActivity({
        reason: "user returned to window",
        eventName: "window:focused",
      });
    };

    const handleWindowBlur = () => {
      emitRecordingActivity({
        reason: "user switched to another window",
        eventName: "window:blurred",
      });
    };

    const onCopy = (event) => handleClipboardAction(event, "copy");
    const onPaste = (event) => handleClipboardAction(event, "paste");

    // window size changes event handling
    const handleWindowResize = () => {
      emitRecordingActivity({
        reason: `window dimensions changed - (width: ${window.innerWidth}px, height: ${window.innerHeight}px)`,
        eventName: "window:resized",
      });
    };

    window.onresize = debounce(handleWindowResize, 500);

    window.addEventListener("focus", handleWindowFocus);
    window.addEventListener("blur", handleWindowBlur);
    document.addEventListener("copy", onCopy);
    document.addEventListener("paste", onPaste);

    socket.emit("registerClient");

    return () => {
      window.removeEventListener("focus", handleWindowFocus);
      window.removeEventListener("blur", handleWindowBlur);
      document.removeEventListener("copy", onCopy);
      document.removeEventListener("paste", onPaste);
    };
  }, []);

  useEffect(() => {
    // Frist Background
    loadBackgroundImage(
      "https://images.pexels.com/photos/159839/office-home-house-desk-159839.jpeg",
      0,
    );
    // Second background
    loadBackgroundImage(
      "https://as2.ftcdn.net/v2/jpg/12/43/81/49/1000_F_1243814925_JVTsWRfjqOi4gyB3yhDte9syfMAY8BJK.jpg",
      1,
    );
  }, []);

  return (
    <div
      className="
  min-h-screen w-full
  bg-gradient-to-br
  from-[#F5F6FF] via-white to-[#FFFDEB]
  px-3 py-5
  dark:from-slate-950 dark:via-slate-900 dark:to-slate-950
  sm:px-6 sm:py-8
  lg:px-8 lg:py-10
"
    >
      <div className="mx-auto w-full max-w-6xl">
        {/* Page Heading */}
        <div
          className="
      mb-5 flex flex-col gap-3
      sm:mb-7 sm:flex-row
      sm:items-center sm:justify-between
    "
        >
          <div>
            <div
              className="
          mb-2 inline-flex items-center gap-2
          rounded-full border border-indigo-100
          bg-indigo-50 px-3 py-1
          text-[10px] font-bold uppercase
          tracking-widest text-indigo-600
          dark:border-indigo-500/20
          dark:bg-indigo-500/10 dark:text-indigo-300
        "
            >
              <span className="h-1.5 w-1.5 rounded-full bg-indigo-500" />
              Interview Workspace
            </div>

            <h1
              className="
          text-2xl font-bold tracking-tight
          text-slate-900 dark:text-white
          sm:text-3xl
        "
            >
              Interview Recording
            </h1>

            <p
              className="
          mt-1 text-xs leading-5
          text-slate-500 dark:text-slate-400
          sm:text-sm
        "
            >
              Record your responses and review your interview videos.
            </p>
          </div>

          {/* Connection Indicator */}
          <div
            className="
        inline-flex w-fit items-center gap-2
        rounded-xl border border-slate-200
        bg-white/80 px-3.5 py-2.5
        shadow-sm backdrop-blur-sm
        dark:border-slate-700 dark:bg-slate-800
      "
          >
            <span
              className={`
          h-2 w-2 rounded-full
          ${
            connectionStatus === "connected" ? "bg-emerald-500" : "bg-amber-500"
          }
        `}
            />

            <span
              className="
          text-xs font-semibold
          text-slate-700 dark:text-slate-200
        "
            >
              {connectionStatus === "connected"
                ? "Camera Connected"
                : "Connecting..."}
            </span>
          </div>
        </div>

        {/* Main Recorder Card */}
        <div
          className="
      overflow-hidden
      rounded-2xl sm:rounded-3xl
      border border-slate-200/80
      bg-white/95
      shadow-[0_20px_70px_-25px_rgba(103,111,163,0.20)]
      dark:border-slate-700
      dark:bg-slate-800/95
    "
        >
          {/* Recording Header */}
          <div
            className="
        border-b border-slate-100
        bg-gradient-to-r
        from-white via-[#F8F8FF] to-[#F4F3FF]
        dark:border-slate-700
        dark:from-slate-800
        dark:via-slate-800
        dark:to-indigo-950/30
      "
          >
            <RecordingHeader
              connectionStatus={connectionStatus}
              isRecordingActive={isRecordingActive}
            />
          </div>

          {/* Main Content */}
          <div
            className="
        p-3 sm:p-5
        md:p-7 lg:p-9
      "
          >
            {/* START SCREEN */}
            {!recordedVideos[currentVideoIndex] && (
              <div className="animate-in fade-in duration-300">
                <RecordingScreen
                  isRecordingActive={isRecordingActive}
                  videoElementRef={videoElementRef}
                  setIsRecordingActive={setIsRecordingActive}
                  currentVideoIndex={currentVideoIndex}
                  setRecordedVideos={setRecordedVideos}
                  setCurrentVideoIndex={setCurrentVideoIndex}
                  recordedVideos={recordedVideos}
                  bgImageRef={backgroundImagesRef}
                />
              </div>
            )}

            {/* VIDEO RESULT */}
            {recordedVideos[currentVideoIndex] && (
              <div className="animate-in fade-in duration-300">
                <RecordingVideoResult
                  recordedVideos={recordedVideos}
                  currentVideoIndex={currentVideoIndex}
                  setCurrentVideoIndex={setCurrentVideoIndex}
                  setRecordedVideos={setRecordedVideos}
                />
              </div>
            )}
          </div>

          {/* Bottom Accent */}
          <div
            className="
        h-1 w-full
        bg-gradient-to-r
        from-indigo-500 via-violet-500 to-purple-400
      "
          />
        </div>

        {/* Bottom Information */}
        <div
          className="
      mt-5 flex flex-col
      items-center justify-between gap-2
      text-center sm:flex-row
      sm:text-left
    "
        >
          <p
            className="
        text-[11px] text-slate-400
        dark:text-slate-500
      "
          >
            Interview Workspace · Secure Recording
          </p>

          <p
            className="
        text-[11px] text-slate-400
        dark:text-slate-500
      "
          >
            Make sure your camera is ready before recording.
          </p>
        </div>
      </div>
    </div>
  );
};

export default RecordingPage;
