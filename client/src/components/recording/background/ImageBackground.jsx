const ImageBackground = ({
  bgImageState,
  toggleBg,
  modelStatus,
  icon,
  label,
  subtitle,
}) => {
  return (
    <label
      className={`
    group relative block w-full
    cursor-pointer overflow-hidden
    rounded-2xl border p-3.5
    transition-all duration-300 sm:p-4
    ${
      bgImageState
        ? "border-amber-400 bg-gradient-to-br from-amber-50 to-orange-50 shadow-md shadow-amber-100/60 ring-2 ring-amber-400/10 dark:border-amber-500 dark:from-amber-950/40 dark:to-orange-950/30 dark:shadow-none"
        : "border-slate-200 bg-white hover:border-amber-300 hover:bg-amber-50/30 hover:shadow-sm dark:border-slate-700 dark:bg-slate-800 dark:hover:border-amber-500/50"
    }
    ${modelStatus === "loading" ? "cursor-not-allowed opacity-60" : ""}
  `}
    >
      {/* Selected Indicator */}
      {bgImageState && (
        <div
          className="
      absolute right-3 top-3
      flex h-5 w-5 items-center
      justify-center rounded-full
      bg-amber-500 text-white shadow-sm
    "
        >
          <svg
            className="h-3 w-3"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="3"
          >
            <path d="m5 12 4 4L19 6" />
          </svg>
        </div>
      )}

      <input
        type="checkbox"
        checked={bgImageState}
        onChange={toggleBg}
        disabled={modelStatus === "loading"}
        className="sr-only"
      />

      <div className="flex items-center gap-3.5">
        {/* Icon Container */}
        <div
          className={`
      flex h-11 w-11 shrink-0
      items-center justify-center
      rounded-xl text-xl
      transition-all duration-300
      ${
        bgImageState
          ? "bg-amber-500 text-white shadow-md shadow-amber-200 dark:shadow-none"
          : "bg-amber-50 text-amber-600 group-hover:bg-amber-100 dark:bg-slate-700 dark:text-amber-400 dark:group-hover:bg-amber-500/20"
      }
    `}
        >
          {icon}
        </div>

        {/* Content */}
        <div className="min-w-0 flex-1 pr-5">
          <p
            className={`
        text-sm font-bold transition-colors
        ${
          bgImageState
            ? "text-amber-900 dark:text-amber-200"
            : "text-slate-800 dark:text-slate-100"
        }
      `}
          >
            {label}
          </p>

          <p
            className="
        mt-1 text-xs leading-5
        text-slate-500 dark:text-slate-400
      "
          >
            {subtitle}
          </p>
        </div>
      </div>

      {/* Selected Footer */}
      {bgImageState && (
        <div
          className="
      mt-3 pt-2
    "
        >
          <span
            className="
        text-[10px] font-bold uppercase
        tracking-wider text-amber-700
        dark:text-amber-300
      "
          >
            Image Background Selected
          </span>
        </div>
      )}
    </label>
  );
};

export default ImageBackground;
