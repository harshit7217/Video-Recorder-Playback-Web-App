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
    <div
      className="
  mx-auto w-full max-w-5xl
  space-y-6 sm:space-y-8
  px-3 py-4 sm:px-6 sm:py-6
"
    >
      {/* Main Video Preview Card */}
      <div
        className="
    relative mx-auto w-full
    overflow-hidden rounded-2xl sm:rounded-3xl
    border border-slate-200/70
    bg-slate-950
    shadow-[0_20px_60px_-20px_rgba(15,23,42,0.3)]
    dark:border-slate-700
  "
      >
        {/* Preview Header */}
        <div
          className="
      absolute left-0 right-0 top-0 z-10
      flex items-center justify-between gap-3
      bg-gradient-to-b from-black/60 to-transparent
      px-4 py-4 sm:px-6 sm:py-5
    "
        >
          <div className="flex min-w-0 items-center gap-2.5">
            <span
              className="
          flex h-8 w-8 shrink-0 items-center justify-center
          rounded-lg border border-white/15
          bg-white/10 text-white backdrop-blur-md
        "
            >
              <svg
                className="h-4 w-4"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
              >
                <rect x="3" y="5" width="18" height="14" rx="2" />
                <path d="m10 9 5 3-5 3z" />
              </svg>
            </span>

            <div className="min-w-0">
              <p className="truncate text-xs font-semibold text-white sm:text-sm">
                Interview Recording
              </p>
              <p className="text-[10px] text-white/60 sm:text-xs">
                Camera Preview
              </p>
            </div>
          </div>

          {/* Recording Status */}
          {isRecordingActive ? (
            <div
              className="
          flex shrink-0 items-center gap-2
          rounded-full border border-red-400/30
          bg-red-500/15 px-3 py-1.5
          text-[10px] font-bold uppercase
          tracking-wider text-red-200
          backdrop-blur-md sm:text-xs
        "
            >
              <span className="h-2 w-2 animate-pulse rounded-full bg-red-500" />
              Recording
            </div>
          ) : (
            <div
              className="
          flex shrink-0 items-center gap-2
          rounded-full border border-white/15
          bg-white/10 px-3 py-1.5
          text-[10px] font-medium
          text-white/80 backdrop-blur-md sm:text-xs
        "
            >
              <span className="h-2 w-2 rounded-full bg-emerald-400" />
              Preview Ready
            </div>
          )}
        </div>

        {/* Timer */}
        {isRecordingActive && (
          <RecordingTimer remainingSeconds={remainingSeconds} />
        )}

        {/* Hidden Source Video */}
        <HiddenVideoFrame videoElementRef={videoElementRef} />

        {/* Camera Canvas */}
        <div
          className="
      relative aspect-video w-full
      overflow-hidden bg-[#11142B]
    "
        >
          <CanvasFrame canvasRef={canvasRef} />

          {/* Empty State */}
          {!isRecordingActive && !isCountdownRunning && (
            <div
              className="
          pointer-events-none absolute inset-0
          flex items-center justify-center
          bg-gradient-to-br from-indigo-950/30
          via-transparent to-violet-950/30
        "
            >
              <div
                className="
            mx-4 max-w-xs rounded-2xl
            border border-white/10
            bg-black/40 px-5 py-5
            text-center text-white
            shadow-xl backdrop-blur-md
            sm:px-8 sm:py-7
          "
              >
                <div
                  className="
              mx-auto mb-4 flex h-12 w-12
              items-center justify-center
              rounded-2xl bg-white/10
              ring-1 ring-white/15
            "
                >
                  <svg
                    className="h-6 w-6 text-indigo-200"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.7"
                  >
                    <rect x="3" y="5" width="18" height="14" rx="2" />
                    <path d="m10 9 5 3-5 3z" />
                  </svg>
                </div>

                <p className="text-sm font-semibold sm:text-base">
                  Camera Preview
                </p>

                <p className="mt-2 text-[11px] leading-5 text-white/65 sm:text-xs">
                  Get ready for your interview. Click the button below when
                  you're ready to begin.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Video Bottom Overlay */}
        <div
          className="
      pointer-events-none absolute
      bottom-0 left-0 right-0
      h-16 bg-gradient-to-t
      from-black/30 to-transparent
    "
        />
      </div>

      {/* Countdown Overlay */}
      {isCountdownRunning && (
        <div className="relative z-20">
          <CountdownOverlay secondsUntilStart={countdownSeconds} />
        </div>
      )}

      {/* Start Recording Button */}
      {!isRecordingActive && !isCountdownRunning && (
        <div
          className="
      flex flex-col items-center
      gap-3 py-2
    "
        >
          <Button label={"Start Recording"} onClick={startRecordingCountdown} />

          <p
            className="
        text-center text-xs
        text-slate-400 dark:text-slate-500
      "
          >
            Make sure your camera and background are ready.
          </p>
        </div>
      )}

      {/* Recording Controls */}
      {isRecordingActive && (
        <div
          className="
      rounded-2xl border border-slate-200
      bg-white p-4 shadow-sm
      dark:border-slate-700 dark:bg-slate-800
      sm:p-6
    "
        >
          <div
            className="
        mb-4 flex flex-wrap
        items-center justify-between gap-3
      "
          >
            <div>
              <h3
                className="
            text-sm font-bold text-slate-900
            dark:text-slate-100 sm:text-base
          "
              >
                Recording Controls
              </h3>

              <p
                className="
            mt-1 text-[11px] text-slate-500
            dark:text-slate-400 sm:text-xs
          "
              >
                Manage your interview recording.
              </p>
            </div>

            <span
              className="
          rounded-full bg-red-50
          px-3 py-1.5 text-[10px]
          font-semibold text-red-600
          dark:bg-red-950/40 dark:text-red-400
        "
            >
              {recordingState === "active" ? "● Recording" : "Ⅱ Paused"}
            </span>
          </div>

          <div
            className="
        flex flex-wrap items-center
        justify-center gap-3
        sm:justify-start
      "
          >
            {/* Stop */}
            {minimumRecordingDurationSeconds == 5 && (
              <Button
                label={"Stop Recording"}
                onClick={() => handleStop("stopped")}
              />
            )}

            {/* Pause / Resume */}
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

            {/* Cancel */}
            <Button
              label={"Cancel Recording"}
              onClick={() => cancelRecording()}
            />
          </div>
        </div>
      )}

      {/* Background Controls */}
      {!isCountdownRunning &&
        recordingState !== "active" &&
        recordingState !== "paused" && (
          <div
            className="
        overflow-hidden rounded-2xl
        border border-slate-200
        bg-white shadow-sm
        dark:border-slate-700 dark:bg-slate-800
      "
          >
            <div
              className="
          border-b border-slate-100
          px-4 py-4
          dark:border-slate-700
          sm:px-6
        "
            >
              <div className="flex items-center gap-3">
                <div
                  className="
              flex h-9 w-9 items-center
              justify-center rounded-xl
              bg-indigo-50 text-indigo-600
              dark:bg-indigo-500/10 dark:text-indigo-400
            "
                >
                  <svg
                    className="h-5 w-5"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                  >
                    <rect x="3" y="3" width="18" height="18" rx="3" />
                    <circle cx="9" cy="9" r="2" />
                    <path d="m21 15-5-5L5 21" />
                  </svg>
                </div>

                <div>
                  <h3
                    className="
                text-sm font-bold text-slate-900
                dark:text-slate-100
              "
                  >
                    Background Settings
                  </h3>

                  <p
                    className="
                mt-0.5 text-[11px]
                text-slate-500 dark:text-slate-400
              "
                  >
                    Customize your interview background.
                  </p>
                </div>
              </div>
            </div>

            <div className="p-4 sm:p-6">
              <BackgroundController
                canvasRef={canvasRef}
                segmenterRef={segmenterRef}
                bgImageRef={bgImageRef}
                isBlurEnabledRef={isBlurEnabledRef}
                backgroundImagesRef={backgroundImagesRef}
              />
            </div>
          </div>
        )}
    </div>
  );
};

export default RecordingScreen;
