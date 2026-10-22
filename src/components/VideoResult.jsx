const VideoResult = ({
  showPreview,
  handleDeleteVideo,
  handleRecordAgain,
  setShowPreview,
  videoList,
  videoUrlList,
  videoIndex,
}) => {
  return (
    <div className="space-y-6">
      {/* Action Bar */}
      <div className="flex flex-wrap items-center justify-center gap-2">
        {showPreview && (
          <button
            onClick={handleDeleteVideo}
            className="cursor-pointer rounded-xl border border-red-200 bg-red-50 px-5 py-2.5 text-sm font-semibold text-red-600 transition hover:bg-red-100"
          >
            Delete
          </button>
        )}

        <button
          onClick={handleRecordAgain}
          className="cursor-pointer rounded-xl bg-[#676FA3] px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-[#555E91]"
        >
          Record Again
        </button>

        <button
          onClick={() => setShowPreview(!showPreview)}
          className="cursor-pointer rounded-xl border border-[#DCDFF0] bg-white px-5 py-2.5 text-sm font-semibold text-[#676FA3] transition hover:bg-[#F5F6FF]"
        >
          {showPreview ? "Current Video" : "Previous Videos"}
        </button>
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
