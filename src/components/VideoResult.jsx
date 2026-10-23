import Button from "./Button";
import PreviousVideoList from "./Frame/PreviousVideoList";
import VideoFrame from "./Frame/VideoFrame";
import VideoDuration from "./VideoDuration";
import { useCallback, useState } from "react";

const VideoResult = ({
  videoUrlList,
  videoIndex,
  setVideoIndex,
  setVideoUrlList,
}) => {
  const [showPreview, setShowPreview] = useState(false);

  //   Handling record again video
  const handleRecordAgain = useCallback(() => {
    setVideoIndex((prev) => prev + 1);
    setShowPreview(false);
  });

  //   handling the delete button to deleteing the current video
  const handleDeleteVideo = useCallback(() => {
    const updatedList = videoUrlList.filter(
      (video) => video.url !== videoUrlList[videoIndex].url,
    );
    setVideoUrlList(updatedList);
    setVideoIndex((videoIndex) => videoIndex - 1);
  });

  return (
    <div className="space-y-6">
      {/* Action Bar */}
      <div className="flex flex-wrap items-center justify-center gap-2">
        {showPreview && <Button title={"Delete"} onClick={handleDeleteVideo} />}
        <Button title={"Record Again"} onClick={handleRecordAgain} />

        <Button
          title={showPreview ? "Current Video" : "Previous Videos"}
          onClick={() => setShowPreview(!showPreview)}
        />
      </div>

      {/* Video Content */}
      {showPreview ? (
        <PreviousVideoList videoUrlList={videoUrlList} />
      ) : (
        <VideoFrame videoUrlList={videoUrlList} videoIndex={videoIndex} />
      )}
    </div>
  );
};

export default VideoResult;
