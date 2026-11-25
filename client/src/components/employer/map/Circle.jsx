import RadiusForm from "./RadiusForm";

const Circle = ({ selectedMarker, updateSelectedMarkerRadius }) => {
  return (
    <aside className="w-full min-w-0 h-full">
      <div className="flex h-full flex-col overflow-hidden rounded-2xl bg-white shadow-sm">
        {/* HEADER */}
        <div className="bg-gradient-to-r from-indigo-50/80 to-white p-4 sm:p-5">
          <div className="flex items-center justify-between gap-3">
            <div className="flex min-w-0 items-center gap-3">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-indigo-600 text-white shadow-md shadow-indigo-200">
                <svg
                  className="h-5 w-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <circle cx="12" cy="12" r="3" strokeWidth="1.8" />
                  <path
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    d="M12 2v3m0 14v3M2 12h3m14 0h3"
                  />
                </svg>
              </div>

              <div className="min-w-0">
                <h2 className="text-base font-bold text-slate-900">
                  Area Controls
                </h2>
                <p className="mt-0.5 text-xs text-slate-500">
                  Manage geographic search areas
                </p>
              </div>
            </div>

            <span className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1.5 text-[10px] font-bold text-emerald-700">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
              GIS Ready
            </span>
          </div>
        </div>

        {/* BODY */}
        <div className="flex-1 space-y-5 overflow-y-auto p-4 sm:p-5">
          {/* RADIUS CONFIGURATION */}
          <section>
            <div className="mb-3 flex items-center justify-between gap-2">
              <div>
                <h3 className="text-sm font-bold text-slate-800">
                  Search Radius
                </h3>
                <p className="mt-1 text-xs text-slate-500">
                  Configure your marker coverage distance
                </p>
              </div>

              <span className="rounded-lg bg-indigo-50 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-indigo-600">
                Coverage
              </span>
            </div>

            <div className="rounded-xl bg-gradient-to-br from-indigo-50/80 to-white p-4">
              <div className="mb-4 flex items-center justify-between gap-2">
                <div>
                  <p className="text-xs font-medium text-slate-500">
                    Configured Radius
                  </p>
                  <p className="mt-1 text-[10px] text-slate-400">
                    Current search distance
                  </p>
                </div>

                <div className="text-right">
                  <p className="text-2xl font-extrabold tracking-tight text-indigo-600">
                    {selectedMarker?.radius ?? 500}
                    <span className="ml-1 text-xs font-semibold text-slate-400">
                      m
                    </span>
                  </p>
                </div>
              </div>

              <div className="rounded-lg bg-white p-3 shadow-sm">
                <RadiusForm
                  radius={selectedMarker?.radius ?? 500}
                  setRadius={updateSelectedMarkerRadius}
                />
              </div>
            </div>
          </section>

          {/* AREA STATISTICS */}
          <section>
            <div className="mb-3 flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-800">
                Area Configuration
              </h3>
              <span className="text-[10px] font-medium text-slate-400">
                Live statistics
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {/* ACTIVE MARKER */}
              <div className="rounded-xl bg-slate-50 p-3 transition hover:bg-blue-50 hover:shadow-sm">
                <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
                  <svg
                    className="h-4 w-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <circle cx="12" cy="12" r="3" strokeWidth="1.8" />
                    <path strokeWidth="1.8" d="M12 2v3m0 14v3M2 12h3m14 0h3" />
                  </svg>
                </div>

                <p className="text-[11px] text-slate-500">Active Marker</p>

                <p
                  className={`mt-1 text-sm font-bold ${
                    selectedMarker ? "text-emerald-600" : "text-slate-400"
                  }`}
                >
                  {selectedMarker ? "Selected" : "None"}
                </p>
              </div>

              {/* RADIUS */}
              <div className="rounded-xl bg-slate-50 p-3 transition hover:bg-indigo-50 hover:shadow-sm">
                <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600">
                  <svg
                    className="h-4 w-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <circle cx="12" cy="12" r="9" strokeWidth="1.8" />
                    <circle cx="12" cy="12" r="3" strokeWidth="1.8" />
                  </svg>
                </div>

                <p className="text-[11px] text-slate-500">Radius Distance</p>

                <p className="mt-1 text-sm font-bold text-indigo-600">
                  {selectedMarker?.radius ?? 500} m
                </p>
              </div>
            </div>
          </section>

          {/* MARKER STATUS */}
          <section
            className={`rounded-xl p-4 ${
              selectedMarker
                ? "bg-emerald-50/70"
                : "bg-amber-50/70"
            }`}
          >
            <div className="flex items-center gap-2">
              <span
                className={`h-2.5 w-2.5 rounded-full ${
                  selectedMarker ? "bg-emerald-500" : "bg-amber-500"
                }`}
              />

              <h3
                className={`text-xs font-bold ${
                  selectedMarker ? "text-emerald-800" : "text-amber-800"
                }`}
              >
                {selectedMarker ? "Marker Active" : "Waiting for Marker"}
              </h3>
            </div>

            <p
              className={`mt-2 text-xs leading-relaxed ${
                selectedMarker ? "text-emerald-700" : "text-amber-700"
              }`}
            >
              {selectedMarker
                ? "Your marker is selected. Adjust the radius to customize its geographic coverage."
                : "No marker selected. Click anywhere on the map to add a marker and configure its search area."}
            </p>
          </section>

          {/* QUICK GUIDE */}
          <section className="rounded-xl bg-blue-50/70 p-4">
            <div className="mb-4 flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-100 text-blue-600">
                <svg
                  className="h-4 w-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <circle cx="12" cy="12" r="10" strokeWidth="1.8" />
                  <path
                    d="M12 11v5m0-8h.01"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                </svg>
              </div>

              <div>
                <h3 className="text-xs font-bold text-blue-900">Quick Guide</h3>
                <p className="text-[10px] text-blue-600">
                  How to configure your search area
                </p>
              </div>
            </div>

            <div className="space-y-3">
              {[
                "Click anywhere on the map to create a marker.",
                "Select the marker to configure its radius.",
                "Visualize the coverage area directly on the map.",
              ].map((instruction, index) => (
                <div key={index} className="flex items-start gap-2.5">
                  <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-blue-100 text-[10px] font-bold text-blue-700">
                    {index + 1}
                  </span>

                  <p className="text-xs leading-relaxed text-blue-800">
                    {instruction}
                  </p>
                </div>
              ))}
            </div>
          </section>
        </div>

        {/* FOOTER */}
        <div className="bg-slate-50 px-4 py-3 sm:px-5">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span className="text-[10px] font-medium text-slate-400">
              Geographic Area Settings
            </span>

            <span className="flex items-center gap-1.5 text-[10px] font-semibold text-emerald-600">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
              Live Configuration
            </span>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default Circle;
