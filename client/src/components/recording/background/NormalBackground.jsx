const NormalBackground = ({
  normalOn,
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
    transition-all duration-300
    sm:p-4
    ${
      normalOn
        ? "border-indigo-500 bg-gradient-to-br from-indigo-50 to-violet-50 shadow-md shadow-indigo-100/60 ring-2 ring-indigo-500/10 dark:border-indigo-400 dark:from-indigo-950/50 dark:to-violet-950/30 dark:shadow-none"
        : "border-slate-200 bg-white hover:border-indigo-300 hover:bg-indigo-50/30 hover:shadow-sm dark:border-slate-700 dark:bg-slate-800 dark:hover:border-indigo-500/50"
    }
    ${modelStatus === "loading" ? "cursor-not-allowed opacity-60" : ""}
  `}
    >
      {/* Active Indicator */}
      {normalOn && (
        <div
          className="
      absolute right-3 top-3
      flex h-5 w-5 items-center
      justify-center rounded-full
      bg-indigo-600 text-white
      shadow-sm dark:bg-indigo-500
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
        checked={normalOn}
        onChange={toggleBg}
        disabled={modelStatus === "loading"}
        className="sr-only"
      />

      <div className="flex items-center gap-3.5">
        {/* Icon */}
        <div
          className={`
      flex h-11 w-11 shrink-0
      items-center justify-center
      rounded-xl text-xl
      transition-all duration-300
      ${
        normalOn
          ? "bg-indigo-600 text-white shadow-md shadow-indigo-200 dark:shadow-none"
          : "bg-slate-100 text-slate-600 group-hover:bg-indigo-100 group-hover:text-indigo-600 dark:bg-slate-700 dark:text-slate-300 dark:group-hover:bg-indigo-500/20 dark:group-hover:text-indigo-300"
      }
    `}
        >
          {icon}
        </div>

        {/* Text */}
        <div className="min-w-0 flex-1 pr-5">
          <p
            className={`
        text-sm font-bold transition-colors
        ${
          normalOn
            ? "text-indigo-800 dark:text-indigo-200"
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

      {/* Bottom Active Label */}
      {normalOn && (
        <div
          className="
      mt-3 border-t border-indigo-200/70
      pt-2 dark:border-indigo-400/20
    "
        >
          <span
            className="
        text-[10px] font-bold uppercase
        tracking-wider text-indigo-600
        dark:text-indigo-300
      "
          >
            Selected Background
          </span>
        </div>
      )}
    </label>
  );
};

export default NormalBackground;
