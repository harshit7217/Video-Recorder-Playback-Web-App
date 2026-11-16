const RadiusStatus = ({
  radiusStatus,
  radiusStatusStyles,
  radiusStatusValue,
  locationLabel,
  outsideRadiusText,
  waitingForMap,
}) => {
  return (
    <section className="flex items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white p-3">
      <div className="flex min-w-0 items-center gap-3">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600">
          <svg
            aria-hidden="true"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.7"
            className="h-4 w-4"
          >
            <circle cx="12" cy="12" r="9" />
            <circle cx="12" cy="12" r="4" />
            <path d="M12 3v5m0 8v5m9-9h-5M8 12H3" />
          </svg>
        </div>
        <div className="min-w-0">
          <h3 className="text-sm font-semibold text-slate-900">
            {locationLabel} location radius
          </h3>
          <p className="mt-0.5 text-[11px] text-slate-500">
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
      <span
        className={`shrink-0 rounded-full px-2.5 py-1 text-[11px] font-semibold ring-1 ring-inset ${radiusStatusStyles[radiusStatusValue]}`}
        role={radiusStatus?.error ? "alert" : "status"}
      >
        {radiusStatusValue === "checking"
          ? "Checking"
          : radiusStatusValue === "unavailable"
            ? "Unavailable"
            : radiusStatusValue === "within"
              ? "Within radius"
              : "Outside radius"}
      </span>
    </section>
  );
};

export default RadiusStatus;
