import VideoDuration from "../VideoDuration";

const PreviousVideoList = ({ recordedVideos }) => {
  const videoList = recordedVideos.map((video) => (
    <li
      key={video.url}
      className="
    group flex w-full shrink-0
    snap-center flex-col
    overflow-hidden rounded-2xl
    border border-slate-200
    bg-white shadow-sm
    transition-all duration-300
    hover:-translate-y-1 hover:shadow-xl
    dark:border-slate-700 dark:bg-slate-800
  "
    >
      {/* Video Preview */}
      <div
        className="
    relative w-full overflow-hidden
    bg-slate-950
  "
      >
        {/* Video Label */}
        <div
          className="
      absolute left-3 top-3 z-10
      flex items-center gap-2
      rounded-full border border-white/15
      bg-black/50 px-3 py-1.5
      text-[10px] font-semibold
      text-white backdrop-blur-md
    "
        >
          <span className="h-2 w-2 rounded-full bg-emerald-400" />
          Recorded Video
        </div>

        <video
          src={video.url}
          controls
          loop
          playsInline
          preload="metadata"
          className="
        block aspect-video w-full
        bg-black object-contain
        outline-none
      "
        />
      </div>

      {/* Video Information */}
      <div className="p-4 sm:p-5">
        {/* Card Heading */}
        <div
          className="
      mb-4 flex items-center
      justify-between gap-2
    "
        >
          <div>
            <h3
              className="
          text-sm font-bold
          text-slate-900
          dark:text-white
        "
            >
              Interview Recording
            </h3>

            <p
              className="
          mt-1 text-[11px]
          text-slate-400
        "
            >
              Recording details
            </p>
          </div>

          <div
            className="
        rounded-lg bg-indigo-50
        px-2.5 py-1.5
        text-[10px] font-semibold
        text-indigo-600
        dark:bg-indigo-500/10
        dark:text-indigo-300
      "
          >
            Video
          </div>
        </div>

        {/* Metadata Grid */}
        <div
          className="
      grid grid-cols-1 gap-3
      border-t border-slate-100 pt-4
      dark:border-slate-700
      min-[420px]:grid-cols-2
      lg:grid-cols-3
    "
        >
          {/* File Size */}
          <div
            className="
        flex min-w-0 items-center gap-3
        rounded-xl bg-slate-50 p-3
        dark:bg-slate-900/60
      "
          >
            <div
              className="
          flex h-9 w-9 shrink-0
          items-center justify-center
          rounded-lg bg-indigo-100
          text-indigo-600
          dark:bg-indigo-500/15
          dark:text-indigo-400
        "
            >
              <svg
                className="h-4 w-4"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
              >
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                <path d="M14 2v6h6M8 13h8M8 17h8" />
              </svg>
            </div>

            <div className="min-w-0">
              <p
                className="
            text-[10px] font-medium
            text-slate-400
          "
              >
                File Size
              </p>

              <p
                className="
            truncate text-xs font-bold
            text-slate-800
            dark:text-slate-200
          "
              >
                {video.size}
              </p>
            </div>
          </div>

          {/* Duration */}
          <div
            className="
        flex min-w-0 items-center gap-3
        rounded-xl bg-slate-50 p-3
        dark:bg-slate-900/60
      "
          >
            <div
              className="
          flex h-9 w-9 shrink-0
          items-center justify-center
          rounded-lg bg-violet-100
          text-violet-600
          dark:bg-violet-500/15
          dark:text-violet-400
        "
            >
              <svg
                className="h-4 w-4"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
              >
                <circle cx="12" cy="12" r="9" />
                <path d="M12 7v5l3 2" />
              </svg>
            </div>

            <div className="min-w-0">
              <p
                className="
            text-[10px] font-medium
            text-slate-400
          "
              >
                Video Duration
              </p>

              <p
                className="
            truncate text-xs font-bold
            text-slate-800
            dark:text-slate-200
          "
              >
                <VideoDuration videoUrl={video.url} />
              </p>
            </div>
          </div>

          {/* Created Date */}
          <div
            className="
        flex min-w-0 items-center gap-3
        rounded-xl bg-slate-50 p-3
        dark:bg-slate-900/60
        min-[420px]:col-span-2
        lg:col-span-1
      "
          >
            <div
              className="
          flex h-9 w-9 shrink-0
          items-center justify-center
          rounded-lg bg-emerald-100
          text-emerald-600
          dark:bg-emerald-500/15
          dark:text-emerald-400
        "
            >
              <svg
                className="h-4 w-4"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
              >
                <rect x="3" y="5" width="18" height="16" rx="2" />
                <path d="M16 3v4M8 3v4M3 11h18" />
              </svg>
            </div>

            <div className="min-w-0">
              <p
                className="
            text-[10px] font-medium
            text-slate-400
          "
              >
                Created At
              </p>

              <p
                className="
            truncate text-xs font-bold
            text-slate-800
            dark:text-slate-200
          "
              >
                {video.createdAt}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Accent */}
      <div
        className="
    h-1 w-full
    bg-gradient-to-r
    from-indigo-500 via-violet-500 to-purple-400
    opacity-70 transition-opacity
    group-hover:opacity-100
  "
      />
    </li>
  ));
  return (
    <div
      className="
  relative w-full overflow-hidden
  rounded-2xl border border-slate-200/80
  bg-white shadow-sm
  dark:border-slate-700 dark:bg-slate-800
  sm:rounded-3xl
"
    >
      {/* Header */}
      <div
        className="
    flex flex-col gap-3
    border-b border-slate-100
    bg-gradient-to-r from-white via-indigo-50/50 to-violet-50/50
    px-4 py-5
    dark:border-slate-700
    dark:from-slate-800 dark:via-slate-800 dark:to-indigo-950/30
    sm:flex-row sm:items-center sm:justify-between
    sm:px-6 sm:py-6
  "
      >
        {/* Heading */}
        <div className="flex items-center gap-3">
          <div
            className="
        flex h-11 w-11 shrink-0
        items-center justify-center
        rounded-xl bg-indigo-600
        text-white shadow-lg shadow-indigo-200/50
        dark:shadow-none
      "
          >
            <svg
              className="h-5 w-5"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
            >
              <rect x="3" y="3" width="18" height="18" rx="2" />
              <path d="M7 3v18M17 3v18M3 8h4m-4 8h4m10-8h4m-4 8h4" />
            </svg>
          </div>

          <div>
            <h2
              className="
          text-lg font-bold tracking-tight
          text-slate-900 dark:text-white
          sm:text-xl
        "
            >
              Previous Videos
            </h2>

            <p
              className="
          mt-1 text-xs text-slate-500
          dark:text-slate-400 sm:text-sm
        "
            >
              Review and manage your earlier recordings.
            </p>
          </div>
        </div>

        {/* Recording Count */}
        <div
          className="
      flex w-fit items-center gap-2
      rounded-full border border-indigo-100
      bg-indigo-50 px-3.5 py-2
      dark:border-indigo-500/20
      dark:bg-indigo-500/10
    "
        >
          <svg
            className="h-4 w-4 text-indigo-600 dark:text-indigo-400"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
          >
            <path d="M4 6h16M4 12h16M4 18h16" />
          </svg>

          <span
            className="
        text-xs font-semibold
        text-indigo-700 dark:text-indigo-300
      "
          >
            {recordedVideos.length} Videos
          </span>
        </div>
      </div>

      {/* Video List Content */}
      <div
        className="
    bg-slate-50/60
    p-3 dark:bg-slate-900/30
    sm:p-5 md:p-6
  "
      >
        <ul
          className="
      flex max-h-[600px]
      flex-col gap-4
      overflow-y-auto scroll-smooth
      overscroll-contain
      pr-1 sm:gap-5 sm:pr-2
      [scrollbar-width:thin]
      [scrollbar-color:#A5B4FC_transparent]
    "
        >
          {videoList}
        </ul>
      </div>

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

export default PreviousVideoList;
