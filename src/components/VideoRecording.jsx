import React, { useState, useRef } from "react";

const VideoRecording = (props) => {
  const videoRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const [isRecording, setIsRecording] = useState(false);
  const [stream, setStream] = useState(null);
  const [videoUrl, setVideoUrl] = useState(null);
  const [recorderState, setRecorderState] = useState("inactive");

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

  const handleResumeRecording = () => {
    if (
      mediaRecorderRef.current &&
      mediaRecorderRef.current.state === "paused"
    ) {
      mediaRecorderRef.current.resume();
      setRecorderState("active");
    }
  };

  const handleDataAvailable = async (e) => {
    const blob = new Blob([e.data], { type: "video/mp4" });
    const url = URL.createObjectURL(blob);
    setVideoUrl(url);
  };

  const resetVideo = async () => {
    setVideoUrl(null);
  };

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
              <video
                src={videoUrl}
                width="400"
                controls
                loop
                className="rounded border-solid border-2"
              />
            </div>
            <div>
              <div className="flex justify-around my-[20px]">
                <button
                  onClick={resetVideo}
                  className="bg-PiWhiteBackground text-PiButton border-solid border-2 border-PiButton rounded py-[0.25rem] px-[0.75rem]"
                >
                  Cancel
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
