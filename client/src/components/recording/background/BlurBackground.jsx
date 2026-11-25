const BlurBackground = ({
  blurOn,
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
      blurOn
        ? "border-violet-400 bg-gradient-to-br from-violet-50 to-purple-50 shadow-md shadow-violet-100/60 ring-2 ring-violet-400/10 dark:border-violet-500 dark:from-violet-950/40 dark:to-purple-950/30 dark:shadow-none"
        : "border-slate-200 bg-white hover:border-violet-300 hover:bg-violet-50/30 hover:shadow-sm dark:border-slate-700 dark:bg-slate-800 dark:hover:border-violet-500/50"
    }
    ${modelStatus === "loading" ? "cursor-not-allowed opacity-60" : ""}
  `}
    >
      {/* Selected Indicator */}
      {blurOn && (
        <div
          className="
      absolute right-3 top-3
      flex h-5 w-5 items-center
      justify-center rounded-full
      bg-violet-600 text-white shadow-sm
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
        checked={blurOn}
        onChange={() => toggleBg("blur")}
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
        blurOn
          ? "bg-violet-600 text-white shadow-md shadow-violet-200 dark:shadow-none"
          : "bg-violet-50 text-violet-600 group-hover:bg-violet-100 dark:bg-slate-700 dark:text-violet-400 dark:group-hover:bg-violet-500/20"
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
          blurOn
            ? "text-violet-900 dark:text-violet-200"
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
      {blurOn && (
        <div
          className="
      mt-3 border-t border-violet-200/70
      pt-2 dark:border-violet-500/20
    "
        >
          <span
            className="
        text-[10px] font-bold uppercase
        tracking-wider text-violet-700
        dark:text-violet-300
      "
          >
            Blur Background Selected
          </span>
        </div>
      )}
    </label>
  );
};

export default BlurBackground;
