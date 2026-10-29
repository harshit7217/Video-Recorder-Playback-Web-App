import { useCallback, useEffect, useState, useRef } from "react";
import { emitRecordingActivity } from "../../socket.js";
import Button from "../ui/Button.jsx";
import BackgroundController from "./background/BackgroundController.jsx";
import CanvasFrame from "./frame/CanvasFrame.jsx";
import HiddenVideoFrame from "./frame/HiddenVideoFrame.jsx";
import RecordingTimer from "./RecordingTimer.jsx";
import CountdownOverlay from "./CountdownOverlay.jsx";

const MIME_CANDIDATES = [
  "video/webm;codecs=vp9,opus",
  "video/webm;codecs=vp8,opus",
  "video/webm",
  "video/mp4",
];

const pickMimeType = () =>
  MIME_CANDIDATES.find((t) => window.MediaRecorder?.isTypeSupported?.(t)) || "";

const RecordingScreen = ({
  isRecordingActive,
  videoElementRef,
  setIsRecordingActive,
  currentVideoIndex,
  setRecordedVideos,
  setCurrentVideoIndex,
  recordedVideos,
  bgImageRef,
}) => {
  const [minimumRecordingDurationSeconds, setMinDuration] = useState(1);
  const [isCountdownRunning, setChecking] = useState(false);
  const [recordingState, setRecorderState] = useState("inactive");
  const [countdownSeconds, setStart] = useState(3);
  const [remainingSeconds, setCount] = useState(299);

  const isFrameProcessingRef = useRef(false);
  const isRecordingCancelledRef = useRef(false);
  const mediaRecorderRef = useRef(null);
  const isLoopRunningRef = useRef(false);
  const rafRef = useRef(null);
  const streamRef = useRef(null);
  const isBlurEnabledRef = useRef(false);
  const backgroundImagesRef = useRef([]);
  const segmenterRef = useRef(null);
  const canvasRef = useRef(null);

  // This draw image
  const drawPlain = useCallback(() => {
    const canvas = canvasRef.current;
    const video = videoElementRef.current;
    if (!canvas || !video) return;
    const ctx = canvas.getContext("2d");
    ctx.filter = "none";
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
  }, []);

  // Using for background
  const startLoop = useCallback(() => {
    isLoopRunningRef.current = true;

    const loop = async () => {
      if (!isLoopRunningRef.current) return;
      const video = videoElementRef.current;

      if (video && video.readyState >= 2 && !isFrameProcessingRef.current) {
        isFrameProcessingRef.current = true;
        try {
          if (
            (isBlurEnabledRef.current ||
              backgroundImagesRef.current[0] ||
              backgroundImagesRef.current[1]) &&
            segmenterRef.current
          ) {
            await segmenterRef.current.send({ image: video });
          } else {
            drawPlain();
          }
        } catch (err) {
          console.error("Frame error:", err);
        } finally {
          isFrameProcessingRef.current = false;
        }
      }
      rafRef.current = requestAnimationFrame(loop);
    };

    rafRef.current = requestAnimationFrame(loop);
  }, [drawPlain]);

  const createRecordedClip = useCallback((e) => {
    const mimeType = mediaRecorderRef.current?.mimeType || "video/webm";
    const blob = new Blob([e.data], { type: mimeType });
    const url = URL.createObjectURL(blob);
    return [url, blob.size];
  });

  const handleRecordedChunk = async (e, message) => {
    const [url, size] = createRecordedClip(e);
    const videoSize = `${(size / (1024 * 1024)).toFixed(2)} MB`;
    if (message) {
      setRecordedVideos((prev) =>
        prev.concat({
          url: url,
          size: videoSize,
          createdAt: new Date().toLocaleTimeString(),
        }),
      );
      setCurrentVideoIndex(
        currentVideoIndex + 1 === recordedVideos.length
          ? currentVideoIndex + 1
          : currentVideoIndex,
      );
    }
  };

  const initializeCamera = async () => {
    try {
      const userStream = await navigator.mediaDevices.getUserMedia({
        audio: true,
        video: true,
      });
      streamRef.current = userStream;

      const video = videoElementRef.current;
      video.srcObject = userStream;
      video.muted = true;
      await video.play();

      const canvas = canvasRef.current;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;

      startLoop();

      const canvasStream = canvas.captureStream(30);
      userStream.getAudioTracks().forEach((t) => canvasStream.addTrack(t));

      const mimeType = pickMimeType();
      mediaRecorderRef.current = new MediaRecorder(
        canvasStream,
        mimeType ? { mimeType } : undefined,
      );
      mediaRecorderRef.current.addEventListener("dataavailable", (e) =>
        handleRecordedChunk(e, isRecordingCancelledRef.current),
      );
    } catch (err) {
      console.error(err);
    } finally {
      emitRecordingActivity({
        reason: "device_initialized_successfully",
        eventName: "camera-connected",
      });
    }
  };

  // This arrow function helps to set up the 3 sec remainingSeconds down then starting the recording.
  const startRecordingCountdown = useCallback(() => {
    setStart(3);
    setChecking(true);
    isRecordingCancelledRef.current = true;
  });

  const toggleRecordingPause = useCallback((recordingState) => {
    if (recordingState === "active") {
      if (
        mediaRecorderRef.current &&
        mediaRecorderRef.current.state === "recording"
      ) {
        mediaRecorderRef.current.pause();
        emitRecordingActivity({
          reason: "user requested pause",
          eventName: "recording:paused",
        });
        setRecorderState("paused");
      }
    } else if (recordingState === "paused") {
      if (
        mediaRecorderRef.current &&
        mediaRecorderRef.current.state === "paused"
      ) {
        mediaRecorderRef.current.resume();
        emitRecordingActivity({
          reason: "user requested resume",
          eventName: "recording:resumed",
        });
        setRecorderState("active");
      }
    }
  });

  const cancelRecording = useCallback(async () => {
    isRecordingCancelledRef.current = false;
    handleStop("cancelled");
    initializeCamera();
  }, []);

  const stopFrameLoop = useCallback(() => {
    isLoopRunningRef.current = false;
    cancelAnimationFrame(rafRef.current);
  }, []);

  //   handling the stop of video
  const handleStop = async (reason = "recording:stopped") => {
    const recorder = mediaRecorderRef.current;
    if (!recorder || recorder.state === "inactive") return;
    emitRecordingActivity({
      reason: "user requested stop",
      eventName: "recording:stopped",
    });
    recorder.stop();
    stopFrameLoop();
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
    }
    setRecorderState("inactive");
    setIsRecordingActive(false);
    emitRecordingActivity({
      reason: "connection lost",
      eventName: "camera:disconnected",
    });
  };

  useEffect(() => {
    if (remainingSeconds < 0 || !isRecordingActive) {
      setCount(299);
      return;
    }
    if (remainingSeconds === 0) {
      handleStop();
      setCount((remainingSeconds) => remainingSeconds - 1);
    }
    if (recordingState === "paused") {
      return;
    }
    const timeout = setTimeout(() => {
      setCount((remainingSeconds) => remainingSeconds - 1);
      if (remainingSeconds > 295) {
        setMinDuration((temp) => temp + 1);
      }
    }, 1000);
    return () => clearTimeout(timeout);
  }, [remainingSeconds, isRecordingActive, recordingState]);

  useEffect(() => {
    if (!isCountdownRunning) return;

    if (countdownSeconds <= 0) {
      const recorder = mediaRecorderRef.current;
      if (recorder && recorder.state === "inactive") {
        recorder.start();
        emitRecordingActivity({
          reason: "user initiated recording",
          eventName: "recording:started",
        });
        setRecorderState("active");
        setMinDuration(1);
        setIsRecordingActive(true);
      }
      setChecking(false);
      return;
    }

    const timer = setTimeout(() => setStart((s) => s - 1), 1000);
    return () => clearTimeout(timer);
  }, [countdownSeconds, isCountdownRunning]);

  useEffect(() => {
    initializeCamera();
    return () => {
      stopFrameLoop();
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
        streamRef.current = null;
      }
    };
  }, [currentVideoIndex]);

  useEffect(() => {
    return () => {
      segmenterRef.current?.close?.();
    };
  }, []);

  return (
    <div className="space-y-6">
      {/* Video Preview */}
      <div className="relative mx-auto w-full max-w-3xl overflow-hidden rounded-2xl bg-[#11142B] shadow-lg">
        {/* Timer */}
        {isRecordingActive && (
          <RecordingTimer remainingSeconds={remainingSeconds} />
        )}

        {/* Hidden source video */}
        <HiddenVideoFrame videoElementRef={videoElementRef} />

        <CanvasFrame canvasRef={canvasRef} />

        {/* Empty state */}
        {!isRecordingActive && !isCountdownRunning && (
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
            <div className="rounded-2xl bg-black/30 px-5 py-3 text-center text-white backdrop-blur-sm">
              <p className="text-sm font-medium">Camera preview</p>
              <p className="mt-1 text-xs text-white/70">
                Click countdownSeconds when you're ready
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Countdown */}
      {isCountdownRunning && (
        <CountdownOverlay secondsUntilStart={countdownSeconds} />
      )}

      {/* Start Button */}
      {!isRecordingActive && !isCountdownRunning && (
        <div className="flex justify-center">
          <Button label={"Start Recording"} onClick={startRecordingCountdown} />
        </div>
      )}

      {/* Recording Controls */}
      {isRecordingActive && (
        <div className="flex flex-wrap items-center justify-center gap-3">
          {minimumRecordingDurationSeconds == 5 && (
            <Button
              label={"Stop Recording"}
              onClick={() => handleStop("stopped")}
            />
          )}

          {recordingState === "active" ? (
            <Button
              label={"Pause Recording"}
              onClick={() => toggleRecordingPause("active")}
            />
          ) : (
            <Button
              label={"Resume Recording"}
              onClick={() => toggleRecordingPause("paused")}
            />
          )}
          <Button
            label={"Cancel Recording"}
            onClick={() => cancelRecording()}
          />
        </div>
      )}

      {/* Background Controls */}
      {!isCountdownRunning &&
        recordingState !== "active" &&
        recordingState !== "paused" && (
          <BackgroundController
            canvasRef={canvasRef}
            segmenterRef={segmenterRef}
            bgImageRef={bgImageRef}
            isBlurEnabledRef={isBlurEnabledRef}
            backgroundImagesRef={backgroundImagesRef}
          />
        )}
    </div>
  );
};

export default RecordingScreen;
