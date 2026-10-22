import { useCallback, useEffect, useState, useRef } from "react";
import { emitRecordingEvent } from "../socket.js";
import Button from "./Button.jsx";
import BackgroundControllers from "./BackgroundControllers.jsx";

const MIME_CANDIDATES = [
  "video/webm;codecs=vp9,opus",
  "video/webm;codecs=vp8,opus",
  "video/webm",
  "video/mp4",
];

const pickMimeType = () =>
  MIME_CANDIDATES.find((t) => window.MediaRecorder?.isTypeSupported?.(t)) || "";

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
          <Button title={"Start Recording"} onClick={handleStart} />
        </div>
      )}

      {/* Recording Controls */}
      {isRecording && (
        <div className="flex flex-wrap items-center justify-center gap-3">
          {minDuration == 5 && (
            <Button
              title={"Stop Recording"}
              onClick={() => handleStop("stopped")}
            />
          )}

          {recorderState === "active" ? (
            <Button
              title={"Pause Recording"}
              onClick={() => handlePauseOrResumingRecording("active")}
            />
          ) : (
            <Button
              title={"Resume Recording"}
              onClick={() => handlePauseOrResumingRecording("paused")}
            />
          )}
          <Button title={"Cancel Recording"} onClick={() => handleCancel()} />
        </div>
      )}

      {/* Background Controls */}
      {!checking &&
        recorderState !== "active" &&
        recorderState !== "paused" && (
          <BackgroundControllers
            modelStatus={modelStatus}
            normalOn={normalOn}
            blurOn={blurOn}
            bgImageState={bgImageState}
            setModelStatus={setModelStatus}
            canvasRef={canvasRef}
            segmenterRef={segmenterRef}
            bgImageRef={bgImageRef}
            blurOnRef={blurOnRef}
            backgroundImageRef={backgroundImageRef}
            normalOnRef={normalOnRef}
            setBgImageState={setBgImageState}
            setNormalOn={setNormalOn}
            setBlurOn={setBlurOn}
          />
        )}
    </div>
  );
};

export default VideoRecordingScreen;
