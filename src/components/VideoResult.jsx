import Button from "./Button";
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
  );
};

export default VideoResult;
