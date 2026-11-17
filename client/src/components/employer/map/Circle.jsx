import RadiusForm from "./RadiusForm";

const Circle = ({ selectedMarker, updateSelectedMarkerRadius }) => {
  return (
    <aside className="min-w-0 h-full">
      <div className="h-full bg-white rounded-2xl border border-slate-200 shadow-sm flex flex-col overflow-hidden">
        {/* HEADER */}
        <div className="p-5 border-b border-slate-100">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                <svg
                  className="w-5 h-5"
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
              <div>
                <h2 className="text-base font-bold text-slate-900">
                  Area Controls
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Manage geographic search areas
                </p>
              </div>
            </div>

            <span className="flex items-center gap-1.5 text-[10px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-100 px-2.5 py-1.5 rounded-full whitespace-nowrap">
              <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full" />
              GIS Ready
            </span>
          </div>
        </div>

        {/* BODY */}
        <div className="p-5 flex-1 space-y-5">
          {/* RADIUS SECTION */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <h3 className="text-sm font-bold text-slate-800">
                Search Radius
              </h3>
              <span className="text-[10px] font-semibold uppercase tracking-wider text-indigo-600 bg-indigo-50 px-2 py-1 rounded-md">
                Coverage
              </span>
            </div>

            <p className="text-xs text-slate-500 mb-4">
              Define the coverage distance around your selected marker.
            </p>

            <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-4">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-medium text-slate-600">
                  Configured Radius
                </span>
                <span className="text-lg font-bold text-indigo-600">
                  {selectedMarker?.radius ?? 500}
                  <span className="text-xs font-semibold text-slate-400 ml-1">
                    m
                  </span>
                </span>
              </div>

              <RadiusForm
                radius={selectedMarker?.radius ?? 500}
                setRadius={updateSelectedMarkerRadius}
              />
            </div>
          </div>

          {/* CONFIGURATION */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-bold text-slate-800">
                Area Configuration
              </h3>
              <svg
                className="w-4 h-4 text-slate-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  d="M12 8v4l3 2m6-2a9 9 0 11-18 0 9 9 0 0118 0z"
                  strokeWidth="1.7"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-xl border border-slate-200 bg-white p-3.5">
                <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center mb-3">
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <circle cx="12" cy="12" r="3" strokeWidth="1.8" />
                    <path strokeWidth="1.8" d="M12 2v3m0 14v3M2 12h3m14 0h3" />
                  </svg>
                </div>
                <p className="text-[11px] text-slate-500 mb-1">Active Marker</p>
                <p
                  className={`text-sm font-bold ${selectedMarker ? "text-emerald-600" : "text-slate-400"}`}
                >
                  {selectedMarker ? "Selected" : "None"}
                </p>
              </div>

              <div className="rounded-xl border border-slate-200 bg-white p-3.5">
                <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center mb-3">
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <circle cx="12" cy="12" r="9" strokeWidth="1.8" />
                    <circle cx="12" cy="12" r="3" strokeWidth="1.8" />
                  </svg>
                </div>
                <p className="text-[11px] text-slate-500 mb-1">
                  Radius Distance
                </p>
                <p className="text-sm font-bold text-indigo-600">
                  {selectedMarker?.radius ?? 500} m
                </p>
              </div>
            </div>
          </div>

          {/* STATUS */}
          <div
            className={`rounded-xl border p-4 ${
              selectedMarker
                ? "bg-emerald-50/60 border-emerald-100"
                : "bg-amber-50/60 border-amber-100"
            }`}
          >
            <div className="flex items-center gap-2 mb-2">
              <span
                className={`w-2 h-2 rounded-full ${
                  selectedMarker ? "bg-emerald-500" : "bg-amber-500"
                }`}
              />
              <p
                className={`text-xs font-bold ${
                  selectedMarker ? "text-emerald-800" : "text-amber-800"
                }`}
              >
                {selectedMarker ? "Marker Active" : "Waiting for Marker"}
              </p>
            </div>
            <p
              className={`text-xs leading-relaxed ${
                selectedMarker ? "text-emerald-700" : "text-amber-700"
              }`}
            >
              {selectedMarker
                ? "Your marker is selected. Adjust the radius to customize its geographic coverage."
                : "No marker selected. Click anywhere on the map to add a marker and configure its search area."}
            </p>
          </div>

          {/* INSTRUCTIONS */}
          <div className="rounded-xl bg-blue-50 border border-blue-100 p-4">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-7 h-7 rounded-lg bg-blue-100 flex items-center justify-center">
                <svg
                  className="w-4 h-4 text-blue-600"
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
              <p className="text-xs font-bold text-blue-900">Quick Guide</p>
            </div>

            <div className="space-y-2.5 mt-3">
              <div className="flex gap-2.5">
                <span className="w-5 h-5 shrink-0 rounded-full bg-blue-100 text-blue-700 text-[10px] font-bold flex items-center justify-center">
                  1
                </span>
                <p className="text-xs text-blue-800 leading-relaxed">
                  Click anywhere on the map to create a marker.
                </p>
              </div>
              <div className="flex gap-2.5">
                <span className="w-5 h-5 shrink-0 rounded-full bg-blue-100 text-blue-700 text-[10px] font-bold flex items-center justify-center">
                  2
                </span>
                <p className="text-xs text-blue-800 leading-relaxed">
                  Select the marker to configure its radius.
                </p>
              </div>
              <div className="flex gap-2.5">
                <span className="w-5 h-5 shrink-0 rounded-full bg-blue-100 text-blue-700 text-[10px] font-bold flex items-center justify-center">
                  3
                </span>
                <p className="text-xs text-blue-800 leading-relaxed">
                  Visualize the coverage area directly on the map.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* FOOTER */}
        <div className="px-5 py-3 border-t border-slate-100 bg-slate-50/70">
          <div className="flex items-center justify-between">
            <span className="text-[11px] text-slate-400">
              Geographic Area Settings
            </span>
            <span className="text-[11px] font-medium text-slate-500">
              Live Configuration
            </span>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default Circle;
