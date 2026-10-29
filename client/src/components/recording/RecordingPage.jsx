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
    <div className="min-h-[500px] w-full bg-gradient-to-br from-[#FFFDEB] via-white to-[#F5F6FF] px-4 py-6 md:px-8">
      <div className="mx-auto w-full max-w-5xl">
        {/* Main Recorder Card */}
        <div className="overflow-hidden rounded-3xl border border-[#E7E8F5] bg-white shadow-[0_20px_60px_rgba(103,111,163,0.12)]">
          {/* Header */}
          <RecordingHeader
            connectionStatus={connectionStatus}
            isRecordingActive={isRecordingActive}
          />
          {/* Content */}
          <div className="p-4 sm:p-6 md:p-8">
            {/* ================= START SCREEN ================= */}
            {!recordedVideos[currentVideoIndex] && (
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
            )}
            {/* ================= VIDEO RESULT ================= */}
            {recordedVideos[currentVideoIndex] && (
              <RecordingVideoResult
                recordedVideos={recordedVideos}
                currentVideoIndex={currentVideoIndex}
                setCurrentVideoIndex={setCurrentVideoIndex}
                setRecordedVideos={setRecordedVideos}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default RecordingPage;
