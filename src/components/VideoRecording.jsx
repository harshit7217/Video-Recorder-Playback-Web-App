import React, { useState, useRef, useEffect, useCallback } from "react";

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
  const [count, setCount] = useState(300);
  const [minDuration, setMinDuration] = useState(1);
  const [checking, setChecking] = useState(false);
  const [start, setStart] = useState(3);
  const [blurOn, setBlurOn] = useState(false);
  const [officeBackgroundOn, setOfficeBackgroundOn] = useState(false);
  const [secondBackgroundOn, setSecondBackgroundOn] = useState(false);
  const [modelStatus, setModelStatus] = useState("idle");
  const [blurError, setBlurError] = useState("");
  const [officeBackgroundError, setOfficeBackgroundError] = useState("");
  const [secondBackgroundError, setSecondBackgroundError] = useState("");

  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const streamRef = useRef(null);
  const segmenterRef = useRef(null);
  const rafRef = useRef(null);
  const runningRef = useRef(false);
  const busyRef = useRef(false);
  const blurOnRef = useRef(false);
  const officeBackgroundRef = useRef(false);
  const secondBackgroundRef = useRef(false);
  const backgroundImageRef = useRef(null);
  const blurAmountRef = useRef(12);
  const secondBackgroundImageRef = useRef(null);
  const timerRef = useRef(0);

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
      setCount(300);
      return;
    }
    if (count === 0) {
      handleStop();
      setCount((count) => count - 1);
    }
    if (recorderState === "paused") {
      return;
    }
    setTimeout(() => {
      timerRef.current = count - 1;
      setCount((count) => count - 1);
      if (count > 295) {
        setMinDuration((temp) => temp + 1);
      }
    }, 1000);
  }, [count, isRecording, recorderState]);

  useEffect(() => {
    return () => {
      segmenterRef.current?.close?.();
    };
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
      video.muted = true; // avoid feedback from the hidden preview
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
        handleDataAvailable(e),
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
              officeBackgroundRef.current ||
              secondBackgroundRef.current) &&
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

  function handleUrl(e) {
    const mimeType = mediaRecorderRef.current?.mimeType || "video/webm";
    const blob = new Blob([e.data], { type: mimeType });
    const url = URL.createObjectURL(blob);
    return [url, blob.size];
  }

  const handleDataAvailable = async (e) => {
    const [url, size] = handleUrl(e);
    const time = 300 - timerRef.current;
    const timeFormat = timeParser(time);
    const videoSize = `${(size / (1024 * 1024)).toFixed(2)} MB`;
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
  };

  // This arrow function helps to set up the 3 sec count down then starting the recording.
  const handleStart = useCallback(() => {
    setStart(3);
    setChecking(true);
  });

  useEffect(() => {
    if (start < 0 || !checking) {
      setChecking(false);
      return;
    }

    if (start === 0) {
      mediaRecorderRef.current.start();
      setRecorderState("active");
      setMinDuration(1);
      setIsRecording(true);
    }

    setTimeout(() => {
      setStart((temp) => temp - 1);
    }, 1000);
  }, [start, checking]);

  // time limit - format
  const timeParser = (duration) => {
    const durationMinutes = Math.floor(duration / 60);
    let durationSeconds = duration % 60;
    const durationFormattedMintues = String(durationMinutes).padStart(2, "0");
    if (durationSeconds < 10) {
      durationSeconds = String(durationSeconds).padStart(2, "0");
    }
    return `${durationFormattedMintues}:${durationSeconds}`;
  };

  //   Handling record again video
  const handleRecordAgain = () => {
    setVideoIndex((prev) => prev + 1);
    setShowPreview(false);
  };

  //   handling the stop of video
  async function handleStop() {
    if (!mediaRecorderRef.current) return;
    mediaRecorderRef.current.stop();
    stopLoop();
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
    }
    setRecorderState("inactive");
    setIsRecording(false);
  }

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
  const handleDeleteVideo = () => {
    const updatedList = videoUrlList.filter(
      (video) => video.url !== videoUrlList[videoIndex].url,
    );
    setVideoUrlList(updatedList);
    setVideoIndex((videoIndex) => videoIndex - 1);
  };

  // Called by MediaPipe with the frame + a person mask.
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
    ctx.filter = `blur(${blurAmountRef.current}px)`;
    ctx.drawImage(results.image, 0, 0, width, height);

    ctx.restore();
  }, []);

  // Backgorund image
  const drawBackgroundImage = useCallback((results) => {
    const canvas = canvasRef.current;

    if (!canvas || !results?.image || !results?.segmentationMask) {
      return;
    }

    const backgroundImage = backgroundImageRef.current;

    // Background image hasn't loaded yet
    if (!backgroundImage) {
      return;
    }

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

  useEffect(() => {
    const image = new Image();
    image.crossOrigin = "anonymous";
    image.onload = () => {
      backgroundImageRef.current = image;
    };
    image.onerror = (error) => {
      console.error("Failed to load background image", error);
    };
    image.src =
      "https://images.pexels.com/photos/159839/office-home-house-desk-159839.jpeg";
    return () => {
      backgroundImageRef.current = null;
    };
  }, []);

  const drawSecondBackgroundImage = useCallback((results) => {
    const canvas = canvasRef.current;

    if (!canvas || !results?.image || !results?.segmentationMask) {
      return;
    }

    const backgroundImage = secondBackgroundImageRef.current;

    // Background image hasn't loaded yet
    if (!backgroundImage) {
      return;
    }

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

  // Background Image second

  useEffect(() => {
    const image = new Image();

    image.crossOrigin = "anonymous";

    image.onload = () => {
      secondBackgroundImageRef.current = image;
    };

    image.onerror = (error) => {
      console.error("Failed to load background image", error);
    };

    image.src =
      "https://as2.ftcdn.net/v2/jpg/12/43/81/49/1000_F_1243814925_JVTsWRfjqOi4gyB3yhDte9syfMAY8BJK.jpg";

    return () => {
      secondBackgroundImageRef.current = null;
    };
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
    } else if (officeBackgroundRef.current) {
      drawBackgroundImage(results);
    } else if (secondBackgroundRef.current) {
      drawSecondBackgroundImage(results);
    } else {
      drawOriginal(results);
    }
  };

  const toggleBlur = async () => {
    setBlurError("");
    const next = !blurOn;
    if (next) {
      try {
        await ensureSegmenter();
        officeBackgroundRef.current = false;
        setOfficeBackgroundOn(false);
        secondBackgroundRef.current = false;
        setSecondBackgroundOn(false);

        blurOnRef.current = true;
        setBlurOn(true);
      } catch (err) {
        setModelStatus("idle");
        setBlurError(err.message);
        return;
      }
    }
    blurOnRef.current = next;
    setBlurOn(next);
  };

  // toogle office background
  const toggleOfficeBackground = async () => {
    setOfficeBackgroundError("");
    const next = !officeBackgroundOn;
    if (next) {
      try {
        await ensureSegmenter();
        blurOnRef.current = false;
        setBlurOn(false);
        secondBackgroundRef.current = false;
        setSecondBackgroundOn(false);

        officeBackgroundRef.current = true;
        setOfficeBackgroundOn(true);
      } catch (err) {
        setModelStatus("idle");
        setOfficeBackgroundError(err.message);
        return;
      }
    }
    officeBackgroundRef.current = next;
    setOfficeBackgroundOn(next);
  };

  // toggle second backgrond
  const toggleSecondBackground = async () => {
    setSecondBackgroundError("");
    const next = !secondBackgroundOn;
    if (next) {
      try {
        await ensureSegmenter();
        officeBackgroundRef.current = false;
        setOfficeBackgroundOn(false);
        secondBackgroundRef.current = true;
        setSecondBackgroundOn(true);

        blurOnRef.current = false;
        setBlurOn(false);
      } catch (err) {
        setModelStatus("idle");
        setSecondBackgroundError(err.message);
        return;
      }
    }
    secondBackgroundRef.current = next;
    setSecondBackgroundOn(next);
  };

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
    <div className="bg-[#FFFDEB] mt-3 gap-5 flex justify-center items-center flex-col">
      {!videoUrlList[videoIndex] ? (
        <>
          <div>
            {!isRecording ? (
              <div className=" flex flex-col mt-2 ">
                {checking ? (
                  <div className="text-xs sm:text-s md:text-md lg:text-lg xl:text-xl px-6 py-3 bg-[#EEF2FF] text-[#676FA3] font-medium rounded-lg text-l transition duration-200  text-center">
                    Start in: 0{start} sec
                  </div>
                ) : (
                  <button
                    onClick={handleStart}
                    className="text-xs sm:text-s md:text-md lg:text-lg xl:text-xl px-6 py-3 bg-[#EEF2FF] hover:bg-[#676FA3] text-[#676FA3] hover:text-[#EEF2FF] cursor-pointer font-medium rounded-lg text-xl transition duration-200 "
                  >
                    Start Recording Video
                  </button>
                )}
              </div>
            ) : (
              <div className="w-[100%] mt-2">
                <div className="text-xs sm:text-s md:text-md lg:text-lg xl:text-xl  text-[#676FA3] font-medium rounded-lg transition duration-200 text-center absolute top-[22vh] md:top-[17vh] xl:top-[23vh] left-[70vw] md:left-[85vw] lg:left-[75vw] xl:left-[65vw]">
                  TimeLeft: {timeParser(count)}
                </div>
                <div className=" flex justify-left items-center gap-2">
                  {minDuration > 5 ? (
                    <button
                      onClick={handleStop}
                      className="text-xs sm:text-s md:text-s lg:text-lg xl:text-xl  px-6 py-3 bg-[#EEF2FF] hover:bg-[#676FA3] text-[#676FA3] hover:text-[#EEF2FF] cursor-pointer font-medium rounded-lg transition duration-200 "
                    >
                      Stop Recording Video
                    </button>
                  ) : null}
                  {recorderState === "active" ? (
                    <button
                      onClick={() => handlePauseOrResumingRecording("active")}
                      className="text-xs sm:text-s md:text-md lg:text-lg xl:text-xl  px-6 py-3 bg-[#EEF2FF] hover:bg-[#676FA3] text-[#676FA3] hover:text-[#EEF2FF] cursor-pointer font-medium rounded-lg transition duration-200 "
                    >
                      Pause Recording Video
                    </button>
                  ) : (
                    <button
                      onClick={() => handlePauseOrResumingRecording("paused")}
                      className="text-xs sm:text-s md:text-md lg:text-lg xl:text-xl  px-6 py-3 bg-[#EEF2FF] hover:bg-[#676FA3] text-[#676FA3] hover:text-[#EEF2FF] cursor-pointer font-medium rounded-lg text-xl transition duration-200 "
                    >
                      Resume Recording Video
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        </>
      ) : null}

      {videoUrlList[videoIndex] ? (
        <>
          <div className=" flex flex-col justify-around items-center gap-10">
            <div className="flex justify-center items-center gap-5 mt-2">
              {/* Delete Button */}
              {showPreview ? (
                <button
                  onClick={handleDeleteVideo}
                  className="text-xs sm:text-s md:text-md lg:text-lg xl:text-xl  px-6 py-3 bg-[#EEF2FF] hover:bg-[#676FA3] text-[#676FA3] hover:text-[#EEF2FF] cursor-pointer font-medium rounded-lg  transition duration-200 "
                >
                  Delete Video
                </button>
              ) : null}
              {/* Record Again Button */}
              <button
                onClick={handleRecordAgain}
                className="text-xs sm:text-s md:text-md lg:text-lg xl:text-xl  px-6 py-3 bg-[#EEF2FF] hover:bg-[#676FA3] text-[#676FA3] hover:text-[#EEF2FF] cursor-pointer font-medium rounded-lg transition duration-200 "
              >
                Record Again
              </button>
              {/* Previous Video */}
              {!showPreview ? (
                <button
                  onClick={() => setShowPreview(true)}
                  className="text-xs sm:text-s md:text-md lg:text-lg xl:text-xl  px-6 py-3 bg-[#EEF2FF] hover:bg-[#676FA3] text-[#676FA3] hover:text-[#EEF2FF] cursor-pointer font-medium rounded-lg transition duration-200 "
                >
                  Previous Video
                </button>
              ) : (
                <button
                  onClick={() => setShowPreview(false)}
                  className="text-xs sm:text-s md:text-md lg:text-lg xl:text-xl  px-6 py-3 bg-[#EEF2FF] hover:bg-[#676FA3] text-[#676FA3] hover:text-[#EEF2FF] cursor-pointer font-medium rounded-lg transition duration-200 "
                >
                  Current Video
                </button>
              )}
            </div>

            <div>
              {showPreview ? (
                <div>
                  <h2 className="text-center text-xl font-medium text-[#030164]">
                    Previous Video
                  </h2>
                  <div className="w-[320px] m-2 md:w-[768px] py-4">
                    <ul className="flex flex-col gap-10 h-full w-full overflow-y-auto snap-y snap-mandatory scroll-smooth py-2 px-1 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
                      {videoList}
                    </ul>
                  </div>
                </div>
              ) : (
                <video
                  src={videoUrlList[videoIndex].url}
                  controls
                  loop
                  autoPlay
                  className="w-[400px] md:w-[800px]  rounded"
                />
              )}
            </div>
          </div>
        </>
      ) : (
        <div className="w-[320px] m-2 md:w-[768px] flex flex-col justify-center items-center gap-3">
          {/* Hidden source video; the canvas is what's shown and recorded */}
          <video ref={videoRef} playsInline muted style={{ display: "none" }} />
          <canvas
            ref={canvasRef}
            className="w-[320px] md:w-[768px] rounded"
            style={{ transform: "scaleX(-1)" }}
          />

          {/* Background blur controls */}
          {recorderState === "active" ||
            (!checking && (
              <div className="flex flex-wrap items-center justify-center gap-4">
                <label className="flex items-center gap-2 text-[#676FA3] font-medium cursor-pointer">
                  <input
                    type="checkbox"
                    checked={blurOn}
                    onChange={toggleBlur}
                    disabled={modelStatus === "loading"}
                  />
                  Blur background
                </label>
                <label className="flex items-center gap-2 text-[#676FA3] font-medium cursor-pointer">
                  <input
                    type="checkbox"
                    checked={officeBackgroundOn}
                    onChange={toggleOfficeBackground}
                    disabled={modelStatus === "loading"}
                  />
                  Office Background
                </label>
                <label className="flex items-center gap-2 text-[#676FA3] font-medium cursor-pointer">
                  <input
                    type="checkbox"
                    checked={secondBackgroundOn}
                    onChange={toggleSecondBackground}
                    disabled={modelStatus === "loading"}
                  />
                  Sunflower Background
                </label>
                {modelStatus === "loading" && (
                  <span className="text-sm text-[#676FA3]">Loading model…</span>
                )}
              </div>
            ))}
          {(blurError || officeBackgroundError || secondBackgroundError) && (
            <p className="text-sm text-red-600" role="alert">
              {blurError}
            </p>
          )}
        </div>
      )}
    </div>
  );
};

export default VideoRecording;
