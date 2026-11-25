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
    <div className="w-full space-y-6 sm:space-y-8">
      {/* Section Header */}
      <div
        className="
    flex flex-col gap-3
    sm:flex-row sm:items-center sm:justify-between
  "
      >
        <div>
          <div className="flex items-center gap-2">
            <div
              className="
          flex h-10 w-10 items-center justify-center
          rounded-xl bg-indigo-50 text-indigo-600
          dark:bg-indigo-500/10 dark:text-indigo-400
        "
            >
              <svg
                className="h-5 w-5"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
              >
                <rect x="3" y="5" width="18" height="14" rx="2" />
                <path d="m10 9 5 3-5 3z" />
              </svg>
            </div>

            <div>
              <h2
                className="
            text-lg font-bold text-slate-900
            dark:text-white sm:text-xl
          "
              >
                Recording Results
              </h2>

              <p
                className="
            text-xs text-slate-500
            dark:text-slate-400 sm:text-sm
          "
              >
                Manage and review your interview recordings.
              </p>
            </div>
          </div>
        </div>

        {/* Recording Count */}
        <div
          className="
      flex w-fit items-center gap-2
      rounded-full border border-indigo-100
      bg-indigo-50 px-3.5 py-2
      text-xs font-semibold text-indigo-700
      dark:border-indigo-500/20
      dark:bg-indigo-500/10 dark:text-indigo-300
    "
        >
          <svg
            className="h-4 w-4"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
          >
            <path d="M4 6h16M4 12h16M4 18h16" />
          </svg>
          {recordedVideos.length} Recordings
        </div>
      </div>

      {/* Action Bar */}
      <div
        className="
    flex flex-col gap-3
    rounded-2xl border border-slate-200
    bg-slate-50/80 p-3
    dark:border-slate-700
    dark:bg-slate-900/50
    sm:flex-row sm:items-center sm:justify-between
    sm:p-4
  "
      >
        {/* View Switcher */}
        <div
          className="
      grid grid-cols-2 gap-1
      rounded-xl border border-slate-200
      bg-white p-1
      dark:border-slate-700 dark:bg-slate-800
    "
        >
          <button
            type="button"
            onClick={() => setIsPreviewVisible(true)}
            className={`
          flex items-center justify-center gap-2
          rounded-lg px-3 py-2.5
          text-xs font-semibold transition-all
          sm:px-4
          ${
            isPreviewVisible
              ? "bg-indigo-600 text-white shadow-md shadow-indigo-200/50 dark:shadow-none"
              : "text-slate-500 hover:bg-slate-50 hover:text-slate-800 dark:text-slate-400 dark:hover:bg-slate-700"
          }
        `}
          >
            <svg
              className="h-4 w-4"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
            >
              <rect x="3" y="3" width="8" height="8" rx="1" />
              <rect x="13" y="3" width="8" height="8" rx="1" />
              <rect x="3" y="13" width="8" height="8" rx="1" />
              <rect x="13" y="13" width="8" height="8" rx="1" />
            </svg>
            Previous Videos
          </button>

          <button
            type="button"
            onClick={() => setIsPreviewVisible(false)}
            className={`
          flex items-center justify-center gap-2
          rounded-lg px-3 py-2.5
          text-xs font-semibold transition-all
          sm:px-4
          ${
            !isPreviewVisible
              ? "bg-indigo-600 text-white shadow-md shadow-indigo-200/50 dark:shadow-none"
              : "text-slate-500 hover:bg-slate-50 hover:text-slate-800 dark:text-slate-400 dark:hover:bg-slate-700"
          }
        `}
          >
            <svg
              className="h-4 w-4"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
            >
              <path d="m8 5 11 7-11 7z" />
            </svg>
            Current Video
          </button>
        </div>

        {/* Action Buttons */}
        <div
          className="
      flex flex-wrap items-center
      gap-2 sm:justify-end
    "
        >
          {isPreviewVisible && (
            <Button label={"Delete"} onClick={handleDeleteCurrentVideo} />
          )}

          <Button label={"Record Again"} onClick={handleRecordAgainClick} />
        </div>
      </div>

      {/* Video Content Card */}
      <div
        className="
    overflow-hidden rounded-2xl
    border border-slate-200
    bg-white shadow-sm
    dark:border-slate-700
    dark:bg-slate-800
  "
      >
        {/* Content Header */}
        <div
          className="
      flex flex-wrap items-center
      justify-between gap-3
      border-b border-slate-100
      px-4 py-4
      dark:border-slate-700
      sm:px-6
    "
        >
          <div>
            <h3
              className="
          text-sm font-bold text-slate-900
          dark:text-white
        "
            >
              {isPreviewVisible ? "Previous Recordings" : "Current Recording"}
            </h3>

            <p
              className="
          mt-1 text-xs text-slate-500
          dark:text-slate-400
        "
            >
              {isPreviewVisible
                ? "Review your recorded interview videos."
                : "Watch and review your latest recording."}
            </p>
          </div>

          <span
            className="
        rounded-lg bg-slate-100
        px-3 py-1.5 text-[10px]
        font-semibold uppercase tracking-wider
        text-slate-500
        dark:bg-slate-700 dark:text-slate-300
      "
          >
            {isPreviewVisible ? "Library" : "Preview"}
          </span>
        </div>

        {/* Video Display */}
        <div className="p-3 sm:p-5 md:p-6">
          {isPreviewVisible ? (
            <PreviousVideoList recordedVideos={recordedVideos} />
          ) : (
            <VideoFrame
              recordedVideos={recordedVideos}
              currentVideoIndex={currentVideoIndex}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default RecordedVideoResult;
