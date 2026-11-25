const VideoFrame = ({ recordedVideos, currentVideoIndex }) => {
  return (
    <div
      className="
  group relative mx-auto w-full
  overflow-hidden rounded-2xl
  border border-slate-200
  bg-slate-950
  shadow-[0_15px_45px_-15px_rgba(15,23,42,0.3)]
  dark:border-slate-700
  sm:rounded-3xl
"
    >
      {/* Video Header */}
      <div
        className="
    absolute left-0 right-0 top-0 z-10
    flex items-center justify-between
    bg-gradient-to-b from-black/70 to-transparent
    px-4 py-4 sm:px-6
  "
      >
        <div className="flex items-center gap-2.5">
          <div
            className="
        flex h-8 w-8 items-center
        justify-center rounded-lg
        bg-white/15 text-white
        backdrop-blur-md
      "
          >
            <svg
              className="h-4 w-4"
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
            <p className="text-xs font-semibold text-white sm:text-sm">
              Interview Recording
            </p>
            <p className="text-[10px] text-white/60">Video Preview</p>
          </div>
        </div>

        <span
          className="
      rounded-full border border-emerald-400/30
      bg-emerald-500/15 px-3 py-1.5
      text-[10px] font-semibold
      uppercase tracking-wider text-emerald-300
      backdrop-blur-md
    "
        >
          Recorded
        </span>
      </div>

      {/* Video Player */}
      <video
        src={recordedVideos[currentVideoIndex].url}
        controls
        loop
        autoPlay
        playsInline
        preload="metadata"
        className="
      block aspect-video w-full
      bg-black object-contain
      outline-none
    "
      />

      {/* Bottom Accent */}
      <div
        className="
    h-1 w-full
    bg-gradient-to-r
    from-indigo-500 via-violet-500 to-purple-400
  "
      />
    </div>
  );
};

export default VideoFrame;
