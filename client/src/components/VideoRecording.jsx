import { useState, useRef, useEffect, useCallback, use } from "react";
import { emitRecordingEvent, socket } from "../socket.js";
import VideoRecordingHeader from "./VideoRecordingHeader.jsx";
import VideoRecordingScreen from "./VideoRecordingScreen.jsx";
import VideoResult from "./VideoResult.jsx";
import debounce from "debounce";

const VideoRecording = ({ socketStatus }) => {
  const [isRecording, setIsRecording] = useState(false);
  const [videoIndex, setVideoIndex] = useState(-1);
  const [videoUrlList, setVideoUrlList] = useState([]);

  const videoRef = useRef(null);
  const bgImageRef = useRef([]);

  const handleBackground = useCallback((imageUrl, index) => {
    const image = new Image();
    image.crossOrigin = "anonymous";
    image.onload = () => {
      bgImageRef.current[index] = image;
    };
    image.onerror = (error) => {
      console.error("Failed to load background image", error);
    };
    image.src = imageUrl;
  });

  // window size changes event handling
  function onResize() {
    emitRecordingEvent("activities", {
      reason: `window dimensions changed - (width: ${window.innerWidth}px, height: ${window.innerHeight}px)`,
      eventName: "window:resized",
    });
  }

  window.onresize = debounce(onResize, 500);

  useEffect(() => {
    socket.emit("clientId");
  }, []);

  useEffect(() => {
    const onFocus = () => {
      emitRecordingEvent("activities", {
        reason: "user returned to window",
        eventName: "window:focused",
      });
    };

    const onBlur = () => {
      emitRecordingEvent("activities", {
        reason: "user switched to another window",
        eventName: "window:blurred",
      });
    };
    window.addEventListener("focus", onFocus);
    window.addEventListener("blur", onBlur);

    return () => {
      window.removeEventListener("focus", onFocus);
      window.removeEventListener("blur", onBlur);
    };
  }, []);

  useEffect(() => {
    // Frist Background
    handleBackground(
      "https://images.pexels.com/photos/159839/office-home-house-desk-159839.jpeg",
      0,
    );
    // Second background
    handleBackground(
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
          <VideoRecordingHeader
            socketStatus={socketStatus}
            isRecording={isRecording}
          />
          {/* Content */}
          <div className="p-4 sm:p-6 md:p-8">
            {/* ================= START SCREEN ================= */}
            {!videoUrlList[videoIndex] && (
              <VideoRecordingScreen
                isRecording={isRecording}
                videoRef={videoRef}
                setIsRecording={setIsRecording}
                videoIndex={videoIndex}
                setVideoUrlList={setVideoUrlList}
                setVideoIndex={setVideoIndex}
                videoUrlList={videoUrlList}
                bgImageRef={bgImageRef}
              />
            )}
            {/* ================= VIDEO RESULT ================= */}
            {videoUrlList[videoIndex] && (
              <VideoResult
                videoUrlList={videoUrlList}
                videoIndex={videoIndex}
                setVideoIndex={setVideoIndex}
                setVideoUrlList={setVideoUrlList}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default VideoRecording;
