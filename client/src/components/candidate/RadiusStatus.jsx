const RadiusStatus = ({
  radiusStatus,
  radiusStatusStyles,
  radiusStatusValue,
  locationLabel,
  outsideRadiusText,
  waitingForMap,
}) => {
  return (
    <section className="group flex w-full items-center justify-between gap-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition-all duration-200 hover:border-indigo-200 hover:shadow-md sm:p-5">
      {/* LEFT CONTENT */}
      <div className="flex min-w-0 items-center gap-3.5">
        {/* ICON */}
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 ring-1 ring-indigo-100">
          <svg
            aria-hidden="true"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.7"
            className="h-5 w-5"
          >
            <circle cx="12" cy="12" r="9" />
            <circle cx="12" cy="12" r="4" />
            <path d="M12 3v5m0 8v5m9-9h-5M8 12H3" />
          </svg>
        </div>

        {/* TEXT */}
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-sm font-bold text-slate-900 sm:text-base">
              {locationLabel} Location Radius
            </h3>
            <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
              GEO CHECK
            </span>
          </div>

          <p className="mt-1.5 text-xs leading-relaxed text-slate-500 sm:text-sm">
            {radiusStatus?.loading
              ? waitingForMap
                ? "Waiting for the map location radius check"
                : `Checking the ${locationLabel.toLowerCase()} location against the interviewer radius`
              : radiusStatus?.error
                ? "The radius check could not be completed"
                : radiusStatus?.isWithinRadius
                  ? `The ${locationLabel.toLowerCase()} location is within the interviewer radius`
                  : outsideRadiusText ||
                    `The ${locationLabel.toLowerCase()} location is outside the interviewer radius`}
          </p>
        </div>
      </div>

      {/* STATUS */}
      <div className="shrink-0">
        <span
          className={`inline-flex items-center gap-2 rounded-xl px-3 py-2 text-[11px] font-bold ring-1 ring-inset sm:px-4 sm:py-2.5 sm:text-xs ${radiusStatusStyles[radiusStatusValue]}`}
          role={radiusStatus?.error ? "alert" : "status"}
        >
          <span
            className={`h-2 w-2 rounded-full ${
              radiusStatusValue === "checking"
                ? "animate-pulse bg-current"
                : "bg-current"
            }`}
          />
          {radiusStatusValue === "checking"
            ? "Checking"
            : radiusStatusValue === "unavailable"
              ? "Unavailable"
              : radiusStatusValue === "within"
                ? "Within Radius"
                : "Outside Radius"}
        </span>
      </div>
    </section>
  );
};

export default RadiusStatus;
