import VideoDuration from "../VideoDuration";

const PreviousVideoList = ({ recordedVideos }) => {
  const videoList = recordedVideos.map((video) => (
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
  );
};

export default PreviousVideoList;
