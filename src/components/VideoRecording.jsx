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
  //   Creating a counter time fpr max length of the recording
  const [count, setCount] = useState(300);
  //   duration of recording video
  const [duration, setDuration] = useState(300);
  // formated a time of recording video duration
  const formattedRefs = useRef("");
  // Storing the latest data for previous videos
  const [blobSize, setBlobSize] = useState(0);
  // the video length will not be less than 5 sec.
  const [minDuration, setMinDuration] = useState(0);

  //   starting the video
  const handleStartRecording = async () => {
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
      mediaRecorderRef.current.start();
      setRecorderState("active");
      setIsRecording(true);
      setStream(stream);
      setMinDuration(0);
    } catch (err) {
      console.error(err);
    }
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
        ...prev,
        {
          url: videoUrl,
          size: videoSize,
          duration: formattedRefs.current,
          createdAt: new Date().toLocaleTimeString(),
        },
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
    <li key={video.url}>
      <video
        src={video.url}
        width={400}
        controls
        loop
        className="rounded border-solid border-2"
      />
      <div>
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

    const time = setTimeout(() => {
      setCount((count) => count - 1);
      setDuration(count);
    }, 1000);
    return () => time;
  }, [count, isRecording, recorderState]);

  //   minutes left from count
  const minutes = Math.floor(count / 60);
  const remaningSeconds = count % 60;

  if (count === 0) {
    handleStop();
    setCount((count) => count - 1);
  }

  useEffect(() => {
    if (minDuration > 5 || !isRecording) {
      return;
    }
    const time = setTimeout(() => {
      setMinDuration((temp) => temp + 1);
    }, 1000);
  }, [minDuration, isRecording]);

  return (
    <div className="bg-gray color-white">
      {!videoUrl ? (
        <>
          <div className="text-center m-[1rem]">
            {!isRecording ? (
              <button
                onClick={handleStartRecording}
                className=" bg-PiWhiteBackground text-PiButton border-solid border-2 border-PiButton  p-[8px] mr-[15px] rounded-3xl text-center "
              >
                Start Recording Video
              </button>
            ) : (
              <div>
                {minDuration > 5 ? (
                  <button
                    onClick={handleStop}
                    className="  text-black border-solid border-2 bg-PiButton  p-[8px] mr-[15px] rounded-3xl text-center "
                  >
                    Stop Recording Video
                  </button>
                ) : (
                  <button
                    onClick={handleStop}
                    className="  text-black border-solid border-2 bg-PiButton  p-[8px] mr-[15px] rounded-3xl text-center invisible"
                  >
                    Stop Recording Video
                  </button>
                )}
                <div>
                  <span>
                    TimeLeft: {minutes}:{remaningSeconds}
                  </span>
                </div>
                {recorderState === "active" ? (
                  <button
                    onClick={handlePauseRecording}
                    className="  text-black border-solid border-2 bg-PiButton  p-[8px] mr-[15px] rounded-3xl text-center "
                  >
                    Pause Recording Video
                  </button>
                ) : (
                  <button
                    onClick={handleResumeRecording}
                    className="  text-black border-solid border-2 bg-PiButton  p-[8px] mr-[15px] rounded-3xl text-center "
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
          <div>
            {showPreview ? (
              <div>
                <h1>Preview</h1>
                <ul>{videoList}</ul>
              </div>
            ) : (
              <div>
                <h1>Video</h1>
                <video
                  src={videoUrl}
                  width="400"
                  controls
                  loop
                  className="rounded border-solid border-2"
                />
              </div>
            )}
            <div>
              <div className="flex justify-around my-[20px]">
                {/* Delete Button */}
                <button
                  onClick={handleDeleteVideo}
                  className="bg-PiWhiteBackground text-PiButton border-solid border-2 border-PiButton rounded py-[0.25rem] px-[0.75rem]"
                >
                  Delete Video
                </button>

                {/* Record Again Button */}
                <button
                  onClick={handleRecordAgain}
                  className="bg-PiWhiteBackground text-PiButton border-solid border-2 border-PiButton rounded py-[0.25rem] px-[0.75rem]"
                >
                  Record Again
                </button>

                {/* Previous Video */}
                {!showPreview ? (
                  <button
                    onClick={handlePreviousVideo}
                    className="bg-PiWhiteBackground text-PiButton border-solid border-2 border-PiButton rounded py-[0.25rem] px-[0.75rem]"
                  >
                    Previous Video
                  </button>
                ) : (
                  <button
                    onClick={handleCurrentVideo}
                    className="bg-PiWhiteBackground text-PiButton border-solid border-2 border-PiButton rounded py-[0.25rem] px-[0.75rem]"
                  >
                    Current Video
                  </button>
                )}
              </div>
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
            className="rounded border-solid border-2"
          />
        </>
      )}
    </div>
  );
};

export default VideoRecording;
