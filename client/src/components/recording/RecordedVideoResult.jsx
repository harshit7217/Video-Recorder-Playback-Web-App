import Button from "./../ui/Button";
import PreviousVideoList from "./frame/PreviousVideoList";
import VideoFrame from "./frame/VideoFrame";
import { useCallback, useState } from "react";

const RecordedVideoResult = ({
  recordedVideos,
  currentVideoIndex,
  setCurrentVideoIndex,
  setRecordedVideos,
}) => {
  const [isPreviewVisible, setIsPreviewVisible] = useState(false);

  //   Handling record again video
  const handleRecordAgainClick = useCallback(() => {
    setCurrentVideoIndex((prev) => prev + 1);
    setIsPreviewVisible(false);
  });

  //   handling the delete button to deleteing the current video
  const handleDeleteCurrentVideo = useCallback(() => {
    const remaningVideos = recordedVideos.filter(
      (video) => video.url !== recordedVideos[currentVideoIndex].url,
    );
    setRecordedVideos(remaningVideos);
    setCurrentVideoIndex((currentVideoIndex) => currentVideoIndex - 1);
  });

  return (
    <div className="space-y-6">
      {/* Action Bar */}
      <div className="flex flex-wrap items-center justify-center gap-2">
        {isPreviewVisible && (
          <Button label={"Delete"} onClick={handleDeleteCurrentVideo} />
        )}
        <Button label={"Record Again"} onClick={handleRecordAgainClick} />

        <Button
          label={isPreviewVisible ? "Current Video" : "Previous Videos"}
          onClick={() => setIsPreviewVisible(!isPreviewVisible)}
        />
      </div>

      {/* Video Content */}
      {isPreviewVisible ? (
        <PreviousVideoList recordedVideos={recordedVideos} />
      ) : (
        <VideoFrame
          recordedVideos={recordedVideos}
          currentVideoIndex={currentVideoIndex}
        />
      )}
    </div>
  );
};

export default RecordedVideoResult;
