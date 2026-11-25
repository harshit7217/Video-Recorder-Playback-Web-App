const CountdownOverlay = ({ secondsUntilStart }) => {
  return (
    <div className="flex w-full justify-center px-3">
      <div
        className="
    inline-flex items-center gap-3
    rounded-2xl
    bg-gradient-to-r from-white via-indigo-50 to-violet-50
    px-5 py-3.5
    shadow-lg shadow-indigo-200/30
    backdrop-blur-md
    dark:from-slate-800 dark:via-indigo-950 dark:to-violet-950
    sm:gap-4 sm:px-7 sm:py-4
  "
      >
        {/* Countdown Icon */}
        <div
          className="
      flex h-10 w-10 shrink-0
      items-center justify-center
      rounded-xl bg-indigo-600
      text-white shadow-md shadow-indigo-200
      dark:shadow-none
    "
        >
          <svg
            className="h-5 w-5 animate-pulse"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <circle cx="12" cy="12" r="9" />
            <path d="M12 7v5l3 2" />
          </svg>
        </div>

        {/* Countdown Text */}
        <div className="flex flex-col">
          <span
            className="
        text-[10px] font-bold uppercase
        tracking-[0.18em] text-slate-500
        dark:text-slate-400 sm:text-xs
      "
          >
            Get Ready
          </span>

          <span
            className="
        text-sm font-semibold text-slate-800
        dark:text-slate-100 sm:text-base
      "
          >
            Starting in
          </span>
        </div>

        {/* Countdown Number */}
        <div
          className="
      flex h-12 min-w-12 items-center
      justify-center rounded-xl
      bg-gradient-to-br from-indigo-600 to-violet-600
      px-3 text-xl font-extrabold
      tabular-nums text-white
      shadow-md shadow-indigo-300/30
      dark:shadow-none
      sm:h-14 sm:min-w-14 sm:text-2xl
    "
        >
          {secondsUntilStart}
          <span className="ml-0.5 text-xs font-semibold">s</span>
        </div>
      </div>
    </div>
  );
};

export default CountdownOverlay;
