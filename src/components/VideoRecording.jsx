import React, { useState, useRef, useEffect } from "react";

const VideoRecording = () => {
  const videoRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const [isRecording, setIsRecording] = useState(false);
  const [stream, setStream] = useState(null);
  const [videoUrl, setVideoUrl] = useState(null);
  const [recorderState, setRecorderState] = useState("inactive");
  const [videoUrlList, setVideoUrlList] = useState([]);
  const [showPreview, setShowPreview] = useState(false);
  //   Creating a counter time for max length of the recording
  const [count, setCount] = useState(300);
  //   duration of recording video
  const [duration, setDuration] = useState(300);
  // formated a time of recording video duration
  const formattedRefs = useRef("");
  // Storing the latest data for previous videos
  const [blobSize, setBlobSize] = useState(0);
  // the video length will not be less than 5 sec.
  const [minDuration, setMinDuration] = useState(0);
  // starting countdown
  const [checking, setChecking] = useState(false);
  const [start, setStart] = useState(3);

  //   starting the video
  const handleStartRecording = async () => {
    mediaRecorderRef.current.start();
    setRecorderState("active");
    setStream(stream);
    setMinDuration(0);
  };

  //   handling the stop of video
  async function handleStop() {
    if (!mediaRecorderRef.current) return;

    mediaRecorderRef.current.stop();

    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
    }

    setRecorderState("inactive");
    setIsRecording(false);
  }

  //   handling the pause of recording
  const handlePauseRecording = () => {
    if (
      mediaRecorderRef.current &&
      mediaRecorderRef.current.state === "recording"
    ) {
      mediaRecorderRef.current.pause();
      setRecorderState("pause");
    }
  };

  //   handling the resume recording
  const handleResumeRecording = () => {
    if (
      mediaRecorderRef.current &&
      mediaRecorderRef.current.state === "paused"
    ) {
      mediaRecorderRef.current.resume();
      setRecorderState("active");
    }
  };

  function handleUrl(e) {
    const blob = new Blob([e.data], { type: "video/mp4" });
    setBlobSize(blob.size);
    const url2 = URL.createObjectURL(blob);
    return url2;
  }

  const setHandleUrl = (type, e) => {
    if (type == "stop") {
      const url = handleUrl(e);
      setVideoUrl(url);
    }
  };

  const handleDataAvailable = async (e) => {
    setHandleUrl("stop", e);
  };

  //   Handling record again video
  const handleRecordAgain = () => {
    storingData();
    setVideoUrl(null);
    setShowPreview(false);
  };

  function storingData() {
    length();

    const videoSize = `${(blobSize / (1024 * 1024)).toFixed(2)} MB`;
    setVideoUrlList((prev) => {
      const duplicate = prev.some((item) => item.url === videoUrl);

      if (duplicate) {
        return prev;
      }
      return [
        {
          url: videoUrl,
          size: videoSize,
          duration: formattedRefs.current,
          createdAt: new Date().toLocaleTimeString(),
        },
        ...prev,
      ];
    });
  }

  //   Showing the previous videos
  const handlePreviousVideo = () => {
    storingData();
    setShowPreview(true);
  };

  //   Showing the only current value
  const handleCurrentVideo = () => {
    setShowPreview(false);
  };

  //   Creating a list of previous video
  const videoList = videoUrlList.map((video) => (
    <li
      key={video.url}
      className="snap-center shrink-0 w-full h-full flex flex-col justify-center items-center"
    >
      <video
        src={video.url}
        width={400}
        controls
        loop
        className="w-[42vw] h-[60vh] shadow-2xl rounded gap-10"
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

  //   handling the delete button to deleteing the current video
  const handleDeleteVideo = () => {
    const updatedList = videoUrlList.filter((video) => video.url !== videoUrl);
    setVideoUrlList(updatedList);
    setVideoUrl(null);
  };

  // formatted the video length
  function length() {
    // video duration
    const exactTime = 300 - duration;
    const durationMinutes = Math.floor(exactTime / 60);
    let durationSeconds = exactTime % 60;
    const durationFormattedMintues = String(durationMinutes).padStart(2, "0");
    if (durationSeconds < 10) {
      durationSeconds = String(durationSeconds).padStart(2, "0");
    }
    formattedRefs.current = `${durationFormattedMintues}:${durationSeconds}`;
  }

  useEffect(() => {
    if (count <= 0 || !isRecording) {
      setCount(300);
      return;
    }

    if (recorderState === "pause") {
      return;
    }

    setTimeout(() => {
      setCount((count) => count - 1);
      setDuration(count);
    }, 1000);
  }, [count, isRecording, recorderState]);

  //   minutes left from count
  const minutes = Math.floor(count / 60);
  const remaningSeconds = count % 60;

  if (count === 0) {
    handleStop();
    setCount((count) => count - 1);
  }

  // set the minimum 5 sec duration for video

  useEffect(() => {
    if (minDuration > 5 || !isRecording) {
      return;
    }

    if (recorderState === "pause") {
      return;
    }

    setTimeout(() => {
      setMinDuration((temp) => temp + 1);
    }, 1000);
  }, [minDuration, isRecording, recorderState]);

  // Starting count down
  useEffect(() => {
    if (start < 0 || !checking) {
      setChecking(false);
      return;
    }

    if (start === 0) {
      handleStartRecording();
      setIsRecording(true);
    }

    setTimeout(() => {
      setStart((temp) => temp - 1);
    }, 1000);
  }, [start, checking]);

  const handleStart = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: true,
        video: true,
      }); // We are enabling both audio and video.
      videoRef.current.srcObject = stream;
      mediaRecorderRef.current = new MediaRecorder(stream);
      mediaRecorderRef.current.addEventListener(
        "dataavailable",
        handleDataAvailable,
      );
      setStart(3);
      setChecking(true);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="bg-[#FFFDEB] h-auto mt-3 flex justify-around">
      {!videoUrl ? (
        <>
          <div className="">
            {!isRecording ? (
              <div className="h-[100%] w-[30vw] shadow-2xl flex flex-col justify-center items-center">
                {checking ? (
                  <div className="w-[25vw] px-6 py-3 bg-[#EEF2FF] text-[#676FA3] font-medium rounded-lg text-l transition duration-200 shadow-md text-center">
                    Start in: 0{start} sec
                  </div>
                ) : (
                  <button
                    onClick={handleStart}
                    className="w-[25vw] px-6 py-3 bg-[#EEF2FF] hover:bg-[#676FA3] text-[#676FA3] hover:text-[#EEF2FF] cursor-pointer font-medium rounded-lg text-xl transition duration-200 shadow-md"
                  >
                    Start Recording Video
                  </button>
                )}
              </div>
            ) : (
              <div className="h-[100%] w-[30vw] shadow-2xl flex flex-col justify-center items-center gap-10">
                {minDuration > 5 ? (
                  <button
                    onClick={handleStop}
                    className="w-[25vw] px-6 py-3 bg-[#EEF2FF] hover:bg-[#676FA3] text-[#676FA3] hover:text-[#EEF2FF] cursor-pointer font-medium rounded-lg text-xl transition duration-200 shadow-md"
                  >
                    Stop Recording Video
                  </button>
                ) : (
                  <button
                    onClick={handleStop}
                    className="w-[25vw] px-6 py-3 bg-[#EEF2FF] hover:bg-[#676FA3] text-[#676FA3] hover:text-[#EEF2FF] cursor-pointer font-medium rounded-lg text-xl transition duration-200 shadow-md hidden"
                  >
                    Stop Recording Video
                  </button>
                )}
                <div className="w-[25vw] px-6 py-3 bg-[#EEF2FF] text-[#676FA3] font-medium rounded-lg text-l transition duration-200 shadow-md text-center">
                  TimeLeft: {minutes}:{remaningSeconds}
                </div>
                {recorderState === "active" ? (
                  <button
                    onClick={handlePauseRecording}
                    className="w-[25vw] px-6 py-3 bg-[#EEF2FF] hover:bg-[#676FA3] text-[#676FA3] hover:text-[#EEF2FF] cursor-pointer font-medium rounded-lg text-xl transition duration-200 shadow-md"
                  >
                    Pause Recording Video
                  </button>
                ) : (
                  <button
                    onClick={handleResumeRecording}
                    className="w-[25vw] px-6 py-3 bg-[#EEF2FF] hover:bg-[#676FA3] text-[#676FA3] hover:text-[#EEF2FF] cursor-pointer font-medium rounded-lg text-xl transition duration-200 shadow-md"
                  >
                    Resume Recording Video
                  </button>
                )}
              </div>
            )}
          </div>
        </>
      ) : null}

      {videoUrl ? (
        <>
          <div className="h-[85vh] w-[100%] shadow-2xl flex justify-around items-center">
            <div className="h-[85vh] w-[30vw] shadow-2xl flex flex-col justify-center items-center gap-10">
              {/* Delete Button */}
              {!showPreview ? (
                <button
                  onClick={handleDeleteVideo}
                  className="w-[25vw] px-6 py-3 bg-[#EEF2FF] hover:bg-[#676FA3] text-[#676FA3] hover:text-[#EEF2FF] cursor-pointer font-medium rounded-lg text-xl transition duration-200 shadow-md"
                >
                  Delete Video
                </button>
              ) : null}
              {/* Record Again Button */}
              <button
                onClick={handleRecordAgain}
                className="w-[25vw] px-6 py-3 bg-[#EEF2FF] hover:bg-[#676FA3] text-[#676FA3] hover:text-[#EEF2FF] cursor-pointer font-medium rounded-lg text-xl transition duration-200 shadow-md"
              >
                Record Again
              </button>
              {/* Previous Video */}
              {!showPreview ? (
                <button
                  onClick={handlePreviousVideo}
                  className="w-[25vw] px-6 py-3 bg-[#EEF2FF] hover:bg-[#676FA3] text-[#676FA3] hover:text-[#EEF2FF] cursor-pointer font-medium rounded-lg text-xl transition duration-200 shadow-md"
                >
                  Previous Video
                </button>
              ) : (
                <button
                  onClick={handleCurrentVideo}
                  className="w-[25vw] px-6 py-3 bg-[#EEF2FF] hover:bg-[#676FA3] text-[#676FA3] hover:text-[#EEF2FF] cursor-pointer font-medium rounded-lg text-xl transition duration-200 shadow-md"
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
                  <div className="h-[70vh] w-auto py-4">
                    <ul className="flex flex-col gap-10 h-full w-full overflow-y-auto snap-y snap-mandatory scroll-smooth py-2 px-1 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
                      {videoList}
                    </ul>
                  </div>
                </div>
              ) : (
                <video
                  src={videoUrl}
                  width="400"
                  controls
                  loop
                  className="w-[50vw] h-[85vh] shadow-2xl rounded"
                />
              )}
            </div>
          </div>
        </>
      ) : (
        <>
          <video
            ref={videoRef}
            width="400"
            autoPlay
            muted
            playsInline
            className="w-[50vw] h-[85vh] shadow-2xl rounded"
          />
        </>
      )}
    </div>
  );
};

export default VideoRecording;
