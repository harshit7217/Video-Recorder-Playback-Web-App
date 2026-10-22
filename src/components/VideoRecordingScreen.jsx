import { useCallback, useEffect, useState, useRef } from "react";
import { emitRecordingEvent } from "../socket.js";

const MEDIAPIPE_URL =
  "https://cdn.jsdelivr.net/npm/@mediapipe/selfie_segmentation";

const MIME_CANDIDATES = [
  "video/webm;codecs=vp9,opus",
  "video/webm;codecs=vp8,opus",
  "video/webm",
  "video/mp4",
];

const pickMimeType = () =>
  MIME_CANDIDATES.find((t) => window.MediaRecorder?.isTypeSupported?.(t)) || "";

function loadSegmentationScript() {
  if (window.SelfieSegmentation) return Promise.resolve();
  return new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.src = `${MEDIAPIPE_URL}/selfie_segmentation.js`;
    script.crossOrigin = "anonymous";
    script.onload = resolve;
    script.onerror = () =>
      reject(
        new Error("Could not load the blur model. Check your connection."),
      );
    document.head.appendChild(script);
  });
}

const VideoRecordingScreen = ({
  isRecording,
  videoRef,
  canvasRef,
  setIsRecording,
  videoIndex,
  setVideoUrlList,
  setVideoIndex,
  videoUrlList,
  bgImageRef,
}) => {
  const [minDuration, setMinDuration] = useState(1);
  const [checking, setChecking] = useState(false);
  const [recorderState, setRecorderState] = useState("inactive");
  const [start, setStart] = useState(3);
  const [count, setCount] = useState(299);
  const [bgImageState, setBgImageState] = useState([false, false]);
  const [normalOn, setNormalOn] = useState(true);
  const [blurOn, setBlurOn] = useState(false);
  const [modelStatus, setModelStatus] = useState("idle");

  const busyRef = useRef(false);
  const cancelRef = useRef(false);
  const mediaRecorderRef = useRef(null);
  const runningRef = useRef(false);
  const rafRef = useRef(null);
  const streamRef = useRef(null);
  const blurOnRef = useRef(false);
  const backgroundImageRef = useRef([]);
  const segmenterRef = useRef(null);
  const normalOnRef = useRef(true);

  // This draw image
  const drawPlain = useCallback(() => {
    const canvas = canvasRef.current;
    const video = videoRef.current;
    if (!canvas || !video) return;
    const ctx = canvas.getContext("2d");
    ctx.filter = "none";
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
  }, []);

  // Using for background
  const startLoop = useCallback(() => {
    runningRef.current = true;

    const loop = async () => {
      if (!runningRef.current) return;
      const video = videoRef.current;

      if (video && video.readyState >= 2 && !busyRef.current) {
        busyRef.current = true;
        try {
          if (
            (blurOnRef.current ||
              backgroundImageRef.current[0] ||
              backgroundImageRef.current[1]) &&
            segmenterRef.current
          ) {
            await segmenterRef.current.send({ image: video });
          } else {
            drawPlain();
          }
        } catch (err) {
          console.error("Frame error:", err);
        } finally {
          busyRef.current = false;
        }
      }
      rafRef.current = requestAnimationFrame(loop);
    };

    rafRef.current = requestAnimationFrame(loop);
  }, [drawPlain]);

  const handleUrl = useCallback((e) => {
    const mimeType = mediaRecorderRef.current?.mimeType || "video/webm";
    const blob = new Blob([e.data], { type: mimeType });
    const url = URL.createObjectURL(blob);
    return [url, blob.size];
  });

  const handleDataAvailable = async (e, message) => {
    const [url, size] = handleUrl(e);
    const videoSize = `${(size / (1024 * 1024)).toFixed(2)} MB`;
    if (message) {
      setVideoUrlList((prev) =>
        prev.concat({
          url: url,
          size: videoSize,
          createdAt: new Date().toLocaleTimeString(),
        }),
      );
      setVideoIndex(
        videoIndex + 1 === videoUrlList.length ? videoIndex + 1 : videoIndex,
      );
    }
  };

  const opening = async () => {
    try {
      const userStream = await navigator.mediaDevices.getUserMedia({
        audio: true,
        video: true,
      });
      streamRef.current = userStream;

      const video = videoRef.current;
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
        handleDataAvailable(e, cancelRef.current),
      );
    } catch (err) {
      console.error(err);
    } finally {
      emitRecordingEvent("event", {
        reason: "device_initialized_successfully",
        eventName: "camera:connected",
      });
    }
  };

  // This arrow function helps to set up the 3 sec count down then starting the recording.
  const handleStart = useCallback(() => {
    setStart(3);
    setChecking(true);
    cancelRef.current = true;
  });

  const handlePauseOrResumingRecording = useCallback((recordingState) => {
    if (recordingState === "active") {
      if (
        mediaRecorderRef.current &&
        mediaRecorderRef.current.state === "recording"
      ) {
        mediaRecorderRef.current.pause();
        emitRecordingEvent("event", {
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
        emitRecordingEvent("event", {
          reason: "user requested resume",
          eventName: "recording:resumed",
        });
        setRecorderState("active");
      }
    }
  });

  const handleCancel = useCallback(async () => {
    cancelRef.current = false;
    handleStop("cancelled");
    opening();
  }, []);

  const stopLoop = useCallback(() => {
    runningRef.current = false;
    cancelAnimationFrame(rafRef.current);
  }, []);

  //   handling the stop of video
  const handleStop = async (reason = "recording:stopped") => {
    const recorder = mediaRecorderRef.current;
    if (!recorder || recorder.state === "inactive") return;
    emitRecordingEvent("event", {
      reason: "user requested stop",
      eventName: "recording:stopped",
    });
    recorder.stop();
    stopLoop();
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
    }
    setRecorderState("inactive");
    setIsRecording(false);
    emitRecordingEvent("event", {
      reason: "connection lost",
      eventName: "camera:disconnected",
    });
  };

  const ensureSegmenter = async () => {
    if (segmenterRef.current) return;
    setModelStatus("loading");
    await loadSegmentationScript();
    const segmenter = new window.SelfieSegmentation({
      locateFile: (file) => `${MEDIAPIPE_URL}/${file}`,
    });
    segmenter.setOptions({ modelSelection: 1 }); // 1 = faster landscape model
    segmenter.onResults(handleSegmentationResults);
    await segmenter.initialize();
    segmenterRef.current = segmenter;
    setModelStatus("ready");
  };

  const drawBlurred = useCallback((results) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const { width, height } = canvas;
    const ctx = canvas.getContext("2d");
    ctx.save();
    ctx.clearRect(0, 0, width, height);
    // Keep only the person from the sharp frame.
    ctx.drawImage(results.segmentationMask, 0, 0, width, height);
    ctx.globalCompositeOperation = "source-in";
    ctx.drawImage(results.image, 0, 0, width, height);
    // Fill in a blurred copy of the frame behind them.
    ctx.globalCompositeOperation = "destination-over";
    ctx.filter = `blur(12px)`;
    ctx.drawImage(results.image, 0, 0, width, height);
    ctx.restore();
  }, []);

  // Backgorund image
  const drawBgImage = useCallback((results, index) => {
    const canvas = canvasRef.current;
    if (!canvas || !results?.image || !results?.segmentationMask) return;

    const backgroundImage = bgImageRef.current[index];
    if (!backgroundImage) return;

    const { width, height } = canvas;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.save();
    ctx.clearRect(0, 0, width, height);
    ctx.drawImage(results.segmentationMask, 0, 0, width, height);
    ctx.globalCompositeOperation = "source-in";
    ctx.drawImage(results.image, 0, 0, width, height);
    ctx.globalCompositeOperation = "destination-over";
    ctx.drawImage(backgroundImage, 0, 0, width, height);
    ctx.restore();
  }, []);

  const handleSegmentationResults = (results) => {
    if (blurOnRef.current) {
      drawBlurred(results);
    } else if (backgroundImageRef.current[0]) {
      drawBgImage(results, 0);
    } else if (backgroundImageRef.current[1]) {
      drawBgImage(results, 1);
    } else {
      drawOriginal(results);
    }
  };

  const handleToggleNormal = useCallback(async () => {
    const next = !blurOn;
    if (next) {
      try {
        await ensureSegmenter();
        backgroundImageRef.current.forEach((_, i) => {
          backgroundImageRef.current[i] = false;
        });
        setBgImageState((prev) => prev.map(() => false));

        blurOnRef.current = false;
        setBlurOn(false);
      } catch (err) {
        setModelStatus("idle");
        return;
      }
    }
    normalOnRef.current = next;
    setNormalOn(next);
  }, []);

  const handleToggleImageBackground = useCallback(async (index) => {
    const next = !bgImageState[index];
    if (next) {
      try {
        await ensureSegmenter();
        blurOnRef.current = false;
        setBlurOn(false);
        normalOnRef.current = false;
        setNormalOn(false);
        backgroundImageRef.current.forEach((_, i) => {
          if (i !== index) {
            backgroundImageRef.current[i] = false;
          }
        });
        setBgImageState((prev) => prev.map((_, i) => i === index));
        backgroundImageRef.current[index] = true;
        setBgImageState((prev) => [...prev, (prev[index] = true)]);
      } catch (err) {
        setModelStatus("idle");
        return;
      }
    }
    backgroundImageRef.current[index] = next;
    setBgImageState((prev) => [...prev, (prev[index] = next)]);
  }, []);

  const handleToggleBlurBackground = useCallback(async () => {
    const next = !blurOn;
    if (next) {
      try {
        await ensureSegmenter();
        backgroundImageRef.current.forEach((_, i) => {
          backgroundImageRef.current[i] = false;
        });
        setBgImageState((prev) => prev.map(() => false));
        normalOnRef.current = false;
        setNormalOn(false);

        blurOnRef.current = true;
        setBlurOn(true);
      } catch (err) {
        setModelStatus("idle");
        return;
      }
    }
    blurOnRef.current = next;
    setBlurOn(next);
  }, []);

  const toggleBg = useCallback(async (state, index) => {
    if (state === "normal") {
      handleToggleNormal();
    } else if (state === "blur") {
      handleToggleBlurBackground();
    } else if (state === "image") {
      handleToggleImageBackground(index);
    }
  }, []);

  // time limit - format
  const timeParser = useCallback((duration) => {
    const durationMinutes = Math.floor(duration / 60);
    let durationSeconds = duration % 60;
    const durationFormattedMintues = String(durationMinutes).padStart(2, "0");
    if (durationSeconds < 10) {
      durationSeconds = String(durationSeconds).padStart(2, "0");
    }
    return `${durationFormattedMintues}:${durationSeconds}`;
  });

  useEffect(() => {
    if (count < 0 || !isRecording) {
      setCount(299);
      return;
    }
    if (count === 0) {
      handleStop();
      setCount((count) => count - 1);
    }
    if (recorderState === "paused") {
      return;
    }
    const timeout = setTimeout(() => {
      setCount((count) => count - 1);
      if (count > 295) {
        setMinDuration((temp) => temp + 1);
      }
    }, 1000);
    return () => clearTimeout(timeout);
  }, [count, isRecording, recorderState]);

  useEffect(() => {
    if (!checking) return;

    if (start <= 0) {
      const recorder = mediaRecorderRef.current;
      if (recorder && recorder.state === "inactive") {
        recorder.start();
        emitRecordingEvent("event", {
          reason: "user initiated recording",
          eventName: "recording:started",
        });
        setRecorderState("active");
        setMinDuration(1);
        setIsRecording(true);
      }
      setChecking(false);
      return;
    }

    const timer = setTimeout(() => setStart((s) => s - 1), 1000);
    return () => clearTimeout(timer);
  }, [start, checking]);

  useEffect(() => {
    opening();
    return () => {
      stopLoop();
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
        streamRef.current = null;
      }
    };
  }, [videoIndex]);

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
        {isRecording && (
          <div className="absolute right-4 top-4 z-20 flex items-center gap-2 rounded-full bg-black/60 px-4 py-2 text-sm font-medium text-white backdrop-blur-md">
            <span className="h-2 w-2 animate-pulse rounded-full bg-red-500" />
            {timeParser(count)}
          </div>
        )}

        {/* Hidden source video */}
        <video ref={videoRef} playsInline muted style={{ display: "none" }} />

        <canvas
          ref={canvasRef}
          className="aspect-video w-full object-cover"
          style={{ transform: "scaleX(-1)" }}
        />

        {/* Empty state */}
        {!isRecording && !checking && (
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
            <div className="rounded-2xl bg-black/30 px-5 py-3 text-center text-white backdrop-blur-sm">
              <p className="text-sm font-medium">Camera preview</p>
              <p className="mt-1 text-xs text-white/70">
                Click start when you're ready
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Countdown */}
      {checking && (
        <div className="flex justify-center">
          <div className="rounded-full bg-[#EEF2FF] px-6 py-3 text-base font-semibold text-[#676FA3] shadow-sm">
            Starting in <span className="text-[#030164]">0{start}s</span>
          </div>
        </div>
      )}

      {/* Start Button */}
      {!isRecording && !checking && (
        <div className="flex justify-center">
          <button
            onClick={handleStart}
            className="cursor-pointer group flex items-center gap-3 rounded-xl bg-[#676FA3] px-7 py-3.5 text-sm font-semibold text-white shadow-lg shadow-[#676FA3]/20 transition-all duration-200 hover:-translate-y-0.5 hover:bg-[#555E91] hover:shadow-xl active:translate-y-0"
          >
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-white/15">
              <svg className="h-4 w-4 fill-current" viewBox="0 0 24 24">
                <path d="M8 5v14l11-7z" />
              </svg>
            </span>
            Start Recording
          </button>
        </div>
      )}

      {/* Recording Controls */}
      {isRecording && (
        <div className="flex flex-wrap items-center justify-center gap-3">
          {minDuration == 5 && (
            <button
              onClick={() => handleStop("stopped")}
              className="cursor-pointer rounded-xl border border-red-200 bg-red-50 px-5 py-3 text-sm font-semibold text-red-600 transition hover:bg-red-100"
            >
              Stop Recording
            </button>
          )}

          {recorderState === "active" ? (
            <button
              onClick={() => handlePauseOrResumingRecording("active")}
              className="cursor-pointer rounded-xl bg-[#EEF2FF] px-5 py-3 text-sm font-semibold text-[#676FA3] transition hover:bg-[#676FA3] hover:text-white"
            >
              Pause Recording
            </button>
          ) : (
            <button
              onClick={() => handlePauseOrResumingRecording("paused")}
              className="cursor-pointer rounded-xl bg-[#676FA3] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#555E91]"
            >
              Resume Recording
            </button>
          )}
          <button
            onClick={() => handleCancel()}
            className="cursor-pointer rounded-xl bg-[#EEF2FF] px-5 py-3 text-sm font-semibold text-[#676FA3] transition hover:bg-[#676FA3] hover:text-white"
          >
            Cancel Recording
          </button>
        </div>
      )}

      {/* Background Controls */}
      {!checking &&
        recorderState !== "active" &&
        recorderState !== "paused" && (
          <div className="rounded-2xl border border-[#E8E9F3] bg-[#FAFAFD] p-4 md:p-5">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-semibold text-[#030164]">
                  Background
                </h3>
                <p className="mt-1 text-xs text-gray-500">
                  Choose how your background should appear
                </p>
              </div>

              {modelStatus === "loading" && (
                <div className="flex items-center gap-2 text-xs font-medium text-[#676FA3]">
                  <span className="h-3 w-3 animate-spin rounded-full border-2 border-[#676FA3]/30 border-t-[#676FA3]" />
                  Loading...
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-4">
              {/* Normal */}
              <label
                className={`cursor-pointer rounded-xl border p-3 transition ${
                  normalOn
                    ? "border-[#676FA3] bg-[#EEF2FF] shadow-sm"
                    : "border-gray-200 bg-white hover:border-[#676FA3]/40"
                }`}
              >
                <input
                  type="checkbox"
                  checked={normalOn}
                  onChange={() => toggleBg("normal")}
                  disabled={modelStatus === "loading"}
                  className="sr-only"
                />

                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gray-100 text-lg">
                    ◯
                  </div>

                  <div>
                    <p className="text-sm font-medium text-gray-800">Normal</p>
                    <p className="text-xs text-gray-500">Original background</p>
                  </div>
                </div>
              </label>

              {/* Blur */}
              <label
                className={`cursor-pointer rounded-xl border p-3 transition ${
                  blurOn
                    ? "border-[#676FA3] bg-[#EEF2FF] shadow-sm"
                    : "border-gray-200 bg-white hover:border-[#676FA3]/40"
                }`}
              >
                <input
                  type="checkbox"
                  checked={blurOn}
                  onChange={() => toggleBg("blur")}
                  disabled={modelStatus === "loading"}
                  className="sr-only"
                />

                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-50 text-lg">
                    ◌
                  </div>

                  <div>
                    <p className="text-sm font-medium text-gray-800">Blur</p>
                    <p className="text-xs text-gray-500">Soft background</p>
                  </div>
                </div>
              </label>

              {/* Office */}
              <label
                className={`cursor-pointer rounded-xl border p-3 transition ${
                  bgImageState[0]
                    ? "border-[#676FA3] bg-[#EEF2FF] shadow-sm"
                    : "border-gray-200 bg-white hover:border-[#676FA3]/40"
                }`}
              >
                <input
                  type="checkbox"
                  checked={bgImageState[0]}
                  onChange={() => toggleBg("image", 0)}
                  disabled={modelStatus === "loading"}
                  className="sr-only"
                />

                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-amber-50 text-lg">
                    🏢
                  </div>

                  <div>
                    <p className="text-sm font-medium text-gray-800">Office</p>
                    <p className="text-xs text-gray-500">
                      Professional setting
                    </p>
                  </div>
                </div>
              </label>

              {/* Sunflower */}
              <label
                className={`cursor-pointer rounded-xl border p-3 transition ${
                  bgImageState[1]
                    ? "border-[#676FA3] bg-[#EEF2FF] shadow-sm"
                    : "border-gray-200 bg-white hover:border-[#676FA3]/40"
                }`}
              >
                <input
                  type="checkbox"
                  checked={bgImageState[1]}
                  onChange={() => toggleBg("image", 1)}
                  disabled={modelStatus === "loading"}
                  className="sr-only"
                />

                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-yellow-50 text-lg">
                    🌻
                  </div>

                  <div>
                    <p className="text-sm font-medium text-gray-800">
                      Sunflower
                    </p>
                    <p className="text-xs text-gray-500">Bright background</p>
                  </div>
                </div>
              </label>
            </div>
          </div>
        )}
    </div>
  );
};

export default VideoRecordingScreen;
