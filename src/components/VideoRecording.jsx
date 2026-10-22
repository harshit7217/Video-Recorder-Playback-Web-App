import { useState, useRef, useEffect, useCallback, use } from "react";
import VideoDuration from "./VideoDuration.jsx";
import { emitRecordingEvent } from "../socket.js";
import { FullScreen, useFullScreenHandle } from "react-full-screen";
import VideoRecordingHeader from "./VideoRecordingHeader.jsx";
import VideoRecordingScreen from "./VideoRecordingScreen.jsx";
import VideoResult from "./VideoResult.jsx";

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

const VideoRecording = ({ socketStatus }) => {
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
  const bgImageRef = useRef([]);
  const normalOnRef = useRef(true);
  const cancelRef = useRef(false);

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
    handleStop("cancelled");
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

  const handleFullScreen = useFullScreenHandle();

  const handleCopyAndPaste = (status) => {
    status === "copy"
      ? emitRecordingEvent("event", {
          reason: "user copied text to clipboard",
          eventName: "text:copy",
        })
      : emitRecordingEvent("event", {
          reason: "user pasted text to clipboard",
          eventName: "text:paste",
        });
  };

  function onResize() {
    emitRecordingEvent("event", {
      reason: "window dimensions changed ",
      eventName: "window:size",
    });
  }

  useEffect(() => {
    onResize();
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  const onFocus = () => {
    emitRecordingEvent("event", {
      reason: "user returned to window",
      eventName: "window:OnFocus",
    });
  };

  const onBlur = () => {
    emitRecordingEvent("event", {
      reason: "user switched to another window",
      eventName: "window:onBlur",
    });
  };

  useEffect(() => {
    window.addEventListener("focus", onFocus);
    window.addEventListener("blur", onBlur);

    onFocus();
    return () => {
      window.removeEventListener("focus", onFocus);
      window.removeEventListener("blur", onBlur);
    };
  }, []);

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
          <strong>Video Duration:</strong>{" "}
          <VideoDuration videoUrl={video.url} />
        </span>
        <span>
          <strong>Created At:</strong> {video.createdAt}
        </span>
      </div>
    </li>
  ));

  return (
    <FullScreen
      handle={handleFullScreen}
      className="min-h-[500px] w-full bg-gradient-to-br from-[#FFFDEB] via-white to-[#F5F6FF] px-4 py-6 md:px-8"
    >
      <div
        className="mx-auto w-full max-w-5xl"
        onCopy={() => handleCopyAndPaste("copy")}
        onPaste={() => handleCopyAndPaste("paste")}
      >
        {/* Main Recorder Card */}
        <div className="overflow-hidden rounded-3xl border border-[#E7E8F5] bg-white shadow-[0_20px_60px_rgba(103,111,163,0.12)]">
          {/* Header */}
          <VideoRecordingHeader
            socketStatus={socketStatus}
            isRecording={isRecording}
            handleFullScreen={handleFullScreen}
          />

          {/* Content */}
          <div className="p-4 sm:p-6 md:p-8">
            {/* ================= START SCREEN ================= */}
            {!videoUrlList[videoIndex] && (
              <VideoRecordingScreen
                isRecording={isRecording}
                videoRef={videoRef}
                canvasRef={canvasRef}
                checking={checking}
                handleStart={handleStart}
                recorderState={recorderState}
                modelStatus={modelStatus}
                normalOn={normalOn}
                blurOn={blurOn}
                bgImageState={bgImageState}
                start={start}
                timeParser={timeParser}
                count={count}
                minDuration={minDuration}
                handlePauseOrResumingRecording={handlePauseOrResumingRecording}
                handleStop={handleStop}
                handleCancel={handleCancel}
                toggleBg={toggleBg}
              />
            )}

            {/* ================= VIDEO RESULT ================= */}
            {videoUrlList[videoIndex] && (
              <VideoResult
                showPreview={showPreview}
                handleDeleteVideo={handleDeleteVideo}
                handleRecordAgain={handleRecordAgain}
                setShowPreview={setShowPreview}
                videoList={videoList}
                videoUrlList={videoUrlList}
                videoIndex={videoIndex}
              />
            )}
          </div>
        </div>
      </div>
    </FullScreen>
  );
};

export default VideoRecording;
