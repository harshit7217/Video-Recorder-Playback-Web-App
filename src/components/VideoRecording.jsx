import React, { useState, useRef, useEffect, useCallback, use } from "react";

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

const VideoRecording = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [videoIndex, setVideoIndex] = useState(-1);
  const [recorderState, setRecorderState] = useState("inactive");
  const [videoUrlList, setVideoUrlList] = useState([]);
  const [showPreview, setShowPreview] = useState(false);
  const [count, setCount] = useState(299);
  const [minDuration, setMinDuration] = useState(1);
  const [checking, setChecking] = useState(false);
  const [start, setStart] = useState(3);
  const [normalOn, setNormalOn] = useState(true);
  const [blurOn, setBlurOn] = useState(false);
  const [bgImageState, setBgImageState] = useState([false, false]);
  const [modelStatus, setModelStatus] = useState("idle");

  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const streamRef = useRef(null);
  const segmenterRef = useRef(null);
  const rafRef = useRef(null);
  const runningRef = useRef(false);
  const busyRef = useRef(false);
  const blurOnRef = useRef(false);
  const backgroundImageRef = useRef([]);
  const timerRef = useRef(0);
  const bgImageRef = useRef([]);
  const normalOnRef = useRef(true);
  const cancelRef = useRef(false);

  // Starting the app it calling the opening function
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
      timerRef.current = count - 1;
      setCount((count) => count - 1);
      if (count > 295) {
        setMinDuration((temp) => temp + 1);
      }
    }, 1000);
    return () => clearTimeout(timeout);
  }, [count, isRecording, recorderState]);

  useEffect(() => {
    return () => {
      segmenterRef.current?.close?.();
    };
  }, []);

  useEffect(() => {
    if (!checking) return;

    if (start <= 0) {
      const recorder = mediaRecorderRef.current;
      if (recorder && recorder.state === "inactive") {
        recorder.start();
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

  // opening using to start a audio and video of representing
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

      // Video comes from the canvas (blur included, if it's on);
      // audio comes straight from the mic.
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
    }
  };

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

  const stopLoop = useCallback(() => {
    runningRef.current = false;
    cancelAnimationFrame(rafRef.current);
  }, []);

  const handleUrl = useCallback((e) => {
    const mimeType = mediaRecorderRef.current?.mimeType || "video/webm";
    const blob = new Blob([e.data], { type: mimeType });
    const url = URL.createObjectURL(blob);
    return [url, blob.size];
  });

  const handleDataAvailable = async (e, message) => {
    const [url, size] = handleUrl(e);
    const time = 299 - timerRef.current;
    const timeFormat = timeParser(time);
    const videoSize = `${(size / (1024 * 1024)).toFixed(2)} MB`;
    if (message) {
      setVideoUrlList((prev) =>
        prev.concat({
          url: url,
          size: videoSize,
          duration: timeFormat,
          createdAt: new Date().toLocaleTimeString(),
        }),
      );
      setVideoIndex(
        videoIndex + 1 === videoUrlList.length ? videoIndex + 1 : videoIndex,
      );
    }
  };

  // This arrow function helps to set up the 3 sec count down then starting the recording.
  const handleStart = useCallback(() => {
    setStart(3);
    setChecking(true);
    cancelRef.current = true;
  });

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

  //   Handling record again video
  const handleRecordAgain = useCallback(() => {
    setVideoIndex((prev) => prev + 1);
    setShowPreview(false);
  });

  //   handling the stop of video
  const handleStop = async () => {
    if (!mediaRecorderRef.current) return;
    mediaRecorderRef.current.stop();
    stopLoop();
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
    }
    setRecorderState("inactive");
    setIsRecording(false);
  };

  const handlePauseOrResumingRecording = useCallback((recordingState) => {
    if (recordingState === "active") {
      if (
        mediaRecorderRef.current &&
        mediaRecorderRef.current.state === "recording"
      ) {
        mediaRecorderRef.current.pause();
        setRecorderState("paused");
      }
    } else if (recordingState === "paused") {
      if (
        mediaRecorderRef.current &&
        mediaRecorderRef.current.state === "paused"
      ) {
        mediaRecorderRef.current.resume();
        setRecorderState("active");
      }
    }
  });

  //   handling the delete button to deleteing the current video
  const handleDeleteVideo = useCallback(() => {
    const updatedList = videoUrlList.filter(
      (video) => video.url !== videoUrlList[videoIndex].url,
    );
    setVideoUrlList(updatedList);
    setVideoIndex((videoIndex) => videoIndex - 1);
  });

  const handleCancel = useCallback(async () => {
    cancelRef.current = false;
    handleStop();
    opening();
  }, []);

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

  const toggleBg = useCallback(async (state, index) => {
    if (state === "normal") {
      handleToggleNormal();
    } else if (state === "blur") {
      handleToggleBlurBackground();
    } else if (state === "image") {
      handleToggleImageBackground(index);
    }
  }, []);

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

  const videoList = videoUrlList.map((video) => (
    <li
      key={video.url}
      className="snap-center shrink-0 w-full h-full flex flex-col justify-center items-center"
    >
      <video
        src={video.url}
        controls
        loop
        className="w-[300px] md:w-[600px]  rounded gap-10"
      />
      <div className="flex gap-10">
        <span>
          <strong>File Size :</strong> {video.size}
        </span>
        <span>
          <strong>Video Duration:</strong> {video.duration}
        </span>
        <span>
          <strong>Created At:</strong> {video.createdAt}
        </span>
      </div>
    </li>
  ));

  return (
    <div className="min-h-[500px] w-full bg-gradient-to-br from-[#FFFDEB] via-white to-[#F5F6FF] px-4 py-6 md:px-8">
      <div className="mx-auto w-full max-w-5xl">
        {/* Main Recorder Card */}
        <div className="overflow-hidden rounded-3xl border border-[#E7E8F5] bg-white shadow-[0_20px_60px_rgba(103,111,163,0.12)]">
          {/* Header */}
          <div className="flex flex-col gap-3 border-b border-[#EEF0F7] px-5 py-4 sm:flex-row sm:items-center sm:justify-between md:px-7">
            <div>
              <h2 className="text-lg font-semibold text-[#030164] md:text-xl">
                Video Recording
              </h2>
              <p className="mt-1 text-sm text-gray-500">
                Record your video and customize the background
              </p>
            </div>

            {isRecording && (
              <div className="flex items-center gap-2 self-start rounded-full bg-red-50 px-3 py-1.5 text-sm font-medium text-red-600">
                <span className="h-2 w-2 animate-pulse rounded-full bg-red-500" />
                Recording
              </div>
            )}
          </div>

          {/* Content */}
          <div className="p-4 sm:p-6 md:p-8">
            {/* ================= START SCREEN ================= */}
            {!videoUrlList[videoIndex] && (
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
                  <video
                    ref={videoRef}
                    playsInline
                    muted
                    style={{ display: "none" }}
                  />

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
                      Starting in{" "}
                      <span className="text-[#030164]">0{start}s</span>
                    </div>
                  </div>
                )}

                {/* Start Button */}
                {!isRecording && !checking && (
                  <div className="flex justify-center">
                    <button
                      onClick={handleStart}
                      className="group flex items-center gap-3 rounded-xl bg-[#676FA3] px-7 py-3.5 text-sm font-semibold text-white shadow-lg shadow-[#676FA3]/20 transition-all duration-200 hover:-translate-y-0.5 hover:bg-[#555E91] hover:shadow-xl active:translate-y-0"
                    >
                      <span className="flex h-8 w-8 items-center justify-center rounded-full bg-white/15">
                        <svg
                          className="h-4 w-4 fill-current"
                          viewBox="0 0 24 24"
                        >
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
                        onClick={handleStop}
                        className="rounded-xl border border-red-200 bg-red-50 px-5 py-3 text-sm font-semibold text-red-600 transition hover:bg-red-100"
                      >
                        Stop Recording
                      </button>
                    )}

                    {recorderState === "active" ? (
                      <button
                        onClick={() => handlePauseOrResumingRecording("active")}
                        className="rounded-xl bg-[#EEF2FF] px-5 py-3 text-sm font-semibold text-[#676FA3] transition hover:bg-[#676FA3] hover:text-white"
                      >
                        Pause Recording
                      </button>
                    ) : (
                      <button
                        onClick={() => handlePauseOrResumingRecording("paused")}
                        className="rounded-xl bg-[#676FA3] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#555E91]"
                      >
                        Resume Recording
                      </button>
                    )}
                    <button
                      onClick={() => handleCancel()}
                      className="rounded-xl bg-[#EEF2FF] px-5 py-3 text-sm font-semibold text-[#676FA3] transition hover:bg-[#676FA3] hover:text-white"
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
                              <p className="text-sm font-medium text-gray-800">
                                Normal
                              </p>
                              <p className="text-xs text-gray-500">
                                Original background
                              </p>
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
                              <p className="text-sm font-medium text-gray-800">
                                Blur
                              </p>
                              <p className="text-xs text-gray-500">
                                Soft background
                              </p>
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
                              <p className="text-sm font-medium text-gray-800">
                                Office
                              </p>
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
                              <p className="text-xs text-gray-500">
                                Bright background
                              </p>
                            </div>
                          </div>
                        </label>
                      </div>
                    </div>
                  )}
              </div>
            )}

            {/* ================= VIDEO RESULT ================= */}
            {videoUrlList[videoIndex] && (
              <div className="space-y-6">
                {/* Action Bar */}
                <div className="flex flex-wrap items-center justify-center gap-2">
                  {showPreview && (
                    <button
                      onClick={handleDeleteVideo}
                      className="rounded-xl border border-red-200 bg-red-50 px-5 py-2.5 text-sm font-semibold text-red-600 transition hover:bg-red-100"
                    >
                      Delete
                    </button>
                  )}

                  <button
                    onClick={handleRecordAgain}
                    className="rounded-xl bg-[#676FA3] px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-[#555E91]"
                  >
                    Record Again
                  </button>

                  <button
                    onClick={() => setShowPreview(!showPreview)}
                    className="rounded-xl border border-[#DCDFF0] bg-white px-5 py-2.5 text-sm font-semibold text-[#676FA3] transition hover:bg-[#F5F6FF]"
                  >
                    {showPreview ? "Current Video" : "Previous Videos"}
                  </button>
                </div>

                {/* Video Content */}
                {showPreview ? (
                  <div className="rounded-2xl border border-[#E8E9F3] bg-[#FAFAFD] p-4 md:p-6">
                    <div className="mb-5 flex items-center justify-between">
                      <div>
                        <h2 className="text-lg font-semibold text-[#030164]">
                          Previous Videos
                        </h2>
                        <p className="mt-1 text-sm text-gray-500">
                          Review your earlier recordings
                        </p>
                      </div>
                    </div>

                    <ul className="flex max-h-[600px] flex-col gap-5 overflow-y-auto scroll-smooth pr-2 [scrollbar-width:thin]">
                      {videoList}
                    </ul>
                  </div>
                ) : (
                  <div className="overflow-hidden rounded-2xl bg-black shadow-xl">
                    <video
                      src={videoUrlList[videoIndex].url}
                      controls
                      loop
                      autoPlay
                      className="aspect-video w-full object-contain"
                    />
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default VideoRecording;
