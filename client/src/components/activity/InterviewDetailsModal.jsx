const InterviewDetailsModal = ({
  selectedId,
  closeEntryDetailsModal,
  selectedActivityDetails,
}) => {
  const activityDetailCards = selectedActivityDetails.map((detail, index) => (
    <div
      key={detail.id ?? `${detail.eventName}-${detail.timestamp}-${index}`}
      className="group relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:border-indigo-200 hover:shadow-lg sm:p-5"
    >
      {/* Subtle hover accent */}
      <div className="absolute inset-x-0 top-0 h-1 origin-left scale-x-0 bg-gradient-to-r from-indigo-500 to-violet-500 transition-transform duration-300 group-hover:scale-x-100" />

      <div className="flex items-start gap-3 sm:gap-4">
        {/* Event Icon */}
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 ring-1 ring-indigo-100 transition-colors group-hover:bg-indigo-100 sm:h-12 sm:w-12">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            className="h-5 w-5 sm:h-6 sm:w-6"
            aria-hidden="true"
          >
            <circle cx="12" cy="12" r="9" />
            <path d="M12 7v5l3 2" />
          </svg>
        </div>

        {/* Content */}
        <div className="min-w-0 flex-1">
          {/* Title and Badge */}
          <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
            <div className="min-w-0">
              <p className="mb-1 text-[10px] font-bold uppercase tracking-wider text-indigo-500">
                Activity record
              </p>

              <h4 className="break-words text-sm font-bold leading-5 text-slate-900 sm:text-base">
                {detail.eventName}
              </h4>
            </div>

            <span className="w-fit shrink-0 rounded-full border border-indigo-100 bg-indigo-50 px-3 py-1 text-[10px] font-bold text-indigo-700 sm:text-xs">
              Activity {index + 1}
            </span>
          </div>

          {/* Description */}
          <div className="mt-3 rounded-xl bg-slate-50 p-3">
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Reason
            </p>

            <p className="mt-1 break-words text-xs leading-5 text-slate-600 sm:text-sm sm:leading-6">
              {detail.reason || "No reason provided"}
            </p>
          </div>

          {/* Timestamp */}
          <div className="mt-3 flex flex-wrap items-center gap-2 border-t border-slate-100 pt-3">
            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-500">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                className="h-4 w-4"
                aria-hidden="true"
              >
                <rect x="3" y="5" width="18" height="16" rx="2" />
                <path d="M16 3v4M8 3v4M3 10h18" />
              </svg>
            </div>

            <div className="min-w-0">
              <p className="text-[10px] font-medium text-slate-400">
                Recorded at
              </p>
              <p className="break-words text-xs font-semibold text-slate-700">
                {detail.timestamp}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  ));
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-3 backdrop-blur-sm sm:p-5">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="event-modal-title"
        className="flex max-h-[92dvh] w-full max-w-2xl flex-col overflow-hidden rounded-2xl border border-white/70 bg-white shadow-2xl sm:rounded-3xl"
      >
        {/* HEADER */}
        <header className="relative shrink-0 overflow-hidden bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 px-5 py-5 sm:px-6 sm:py-6">
          <div className="absolute -right-12 -top-16 h-48 w-48 rounded-full bg-indigo-500/20 blur-3xl" />

          <div className="relative flex items-center justify-between gap-4">
            <div className="flex min-w-0 items-center gap-3">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-white/10 text-indigo-300">
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.7"
                  className="h-6 w-6"
                  aria-hidden="true"
                >
                  <circle cx="12" cy="12" r="9" />
                  <path d="M12 7v5l3 2" />
                </svg>
              </div>

              <div className="min-w-0">
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-indigo-300">
                  Activity History
                </p>

                <h3
                  id="event-modal-title"
                  className="mt-1 text-lg font-bold text-white sm:text-xl"
                >
                  Event Details
                </h3>

                <p className="mt-1 text-xs text-slate-400">
                  Review recorded activities for this ID
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={closeEntryDetailsModal}
              aria-label="Close details"
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-slate-300 transition hover:bg-white/10 hover:text-white focus:outline-none focus:ring-2 focus:ring-white/60"
            >
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                className="h-5 w-5"
                aria-hidden="true"
              >
                <path d="m6 6 12 12M18 6 6 18" />
              </svg>
            </button>
          </div>

          {/* SELECTED ID */}
          <div className="relative mt-5 flex flex-col gap-2 rounded-xl border border-white/10 bg-white/[0.07] p-3 sm:flex-row sm:items-center sm:justify-between sm:px-4">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                Selected ID
              </p>

              <p className="mt-1 break-all text-sm font-bold text-white">
                {selectedId}
              </p>
            </div>

            <span className="w-fit rounded-lg bg-indigo-400/15 px-3 py-1.5 text-[10px] font-bold text-indigo-200 ring-1 ring-indigo-300/20">
              Selected Record
            </span>
          </div>
        </header>

        {/* BODY */}
        <main className="min-h-0 flex-1 overflow-y-auto overscroll-contain bg-slate-50/80 p-4 sm:p-6">
          {/* ACTIVITY SUMMARY */}
          <div className="mb-5 flex items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.7"
                  className="h-5 w-5"
                  aria-hidden="true"
                >
                  <path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01" />
                </svg>
              </div>

              <div>
                <p className="text-xs font-semibold text-slate-500">
                  Activity records
                </p>
                <p className="mt-0.5 text-sm font-bold text-slate-900">
                  Event timeline
                </p>
              </div>
            </div>

            <div className="shrink-0 rounded-xl bg-indigo-50 px-3 py-2 text-center">
              <p className="text-xl font-bold tabular-nums text-indigo-700">
                {selectedActivityDetails.length}
              </p>
              <p className="text-[9px] font-bold uppercase tracking-wider text-indigo-500">
                Total
              </p>
            </div>
          </div>

          {/* ACTIVITY LIST */}
          {selectedActivityDetails.length > 0 ? (
            <div className="space-y-3 sm:space-y-4">{activityDetailCards}</div>
          ) : (
            /* EMPTY STATE */
            <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-white px-5 py-14 text-center">
              <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-400">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.7"
                  className="h-8 w-8"
                  aria-hidden="true"
                >
                  <circle cx="12" cy="12" r="9" />
                  <path d="M12 8v4m0 4h.01" />
                </svg>
              </div>

              <h4 className="text-base font-bold text-slate-800">
                No events found
              </h4>

              <p className="mt-2 max-w-xs text-xs leading-5 text-slate-500 sm:text-sm">
                There are no activity details available for this ID yet.
              </p>
            </div>
          )}
        </main>

        {/* FOOTER */}
        <footer className="shrink-0 border-t border-slate-200 bg-white px-4 py-3 sm:px-6 sm:py-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <span className="h-2 w-2 shrink-0 rounded-full bg-emerald-500" />

              <span>
                {selectedActivityDetails.length}{" "}
                {selectedActivityDetails.length === 1
                  ? "activity found"
                  : "activities found"}
              </span>
            </div>

            <button
              type="button"
              onClick={closeEntryDetailsModal}
              className="w-full rounded-xl bg-indigo-600 px-6 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 sm:w-auto"
            >
              Close
            </button>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default InterviewDetailsModal;
