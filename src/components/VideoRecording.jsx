import React, { useState, useRef, useEffect } from "react";

const VideoRecording = () => {
  const videoRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const [isRecording, setIsRecording] = useState(false);
  const [stream, setStream] = useState(null);
  const [videoUrl, setVideoUrl] = useState(null);
  const [previousVideoUrl, setPreviousVideoURL] = useState(null);
  const [recorderState, setRecorderState] = useState("inactive");

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
    } catch (err) {
      console.error(err);
    }
  };

  //   handling the stop of video
  const handleStopRecording = () => {
    mediaRecorderRef.current.stop();
    setRecorderState("inactive");
    setIsRecording(false);
    if (stream) {
      stream.getTracks().forEach((track) => {
        track.stop();
      });
    }
  };

  //   handling the pause of recording
  const handlePauseRecording = () => {
    if (
      mediaRecorderRef.current &&
      mediaRecorderRef.current.state === "recording"
    ) {
      mediaRecorderRef.current.pause();
      setRecorderState("pause");
      console.log(mediaRecorderRef.current);
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
    const url = URL.createObjectURL(blob);
    return url;
  }

  const setHandleUrl = (type, e, url) => {
    if (type == "stop") {
      const url = handleUrl(e);
      setVideoUrl(url);
    } else if (url) {
      setVideoUrl(url);
    }
  };

  const handleDataAvailable = async (e) => setHandleUrl("stop", e);

  //   Handling record again video
  const handleRecordAgain = () => {
    setPreviousVideoURL(videoUrl);
    setVideoUrl(null);
    handleStartRecording();
  };

  const handlePreviousVideo = () => setHandleUrl("prev", {}, previousVideoUrl);

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
                <button
                  onClick={handleStopRecording}
                  className="  text-black border-solid border-2 bg-PiButton  p-[8px] mr-[15px] rounded-3xl text-center "
                >
                  Stop Recording Video
                </button>
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
            <div className="text-center my-6">Preview</div>
            <div>
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
            </div>
            <div>
              <div className="flex justify-around my-[20px]">
                {/* Delete Button */}
                <button className="bg-PiWhiteBackground text-PiButton border-solid border-2 border-PiButton rounded py-[0.25rem] px-[0.75rem]">
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
                <button
                  onClick={handlePreviousVideo}
                  className="bg-PiWhiteBackground text-PiButton border-solid border-2 border-PiButton rounded py-[0.25rem] px-[0.75rem]"
                >
                  Previous Video
                </button>
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
