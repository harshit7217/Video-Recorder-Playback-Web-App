import {
  MapContainer,
  TileLayer,
  ZoomControl,
  Circle,
  Polygon,
} from "react-leaflet";
import "leaflet/dist/leaflet.css";
import LocationMarker from "./LocationMarker";
import { defaultLocation } from "../../utils/defaultLoction";
import { useEffect, useState } from "react";
import { fullUrl } from "../../../url";
import CircleComponent from "./Circle.jsx";
import PolygonComponent from "./Polygon.jsx";

const Map = ({
  selectedMarker,
  updateSelectedMarkerRadius,
  positions,
  selectedMarkerId,
  setPositions,
  setSelectedMarkerId,
}) => {
  const url = window.location.href;
  const purpleOptions = { color: "purple" };
  const [polygonBoundary, setPolygonBoundary] = useState([]);
  const [isCircle, setIsCircle] = useState(true);

  useEffect(() => {
    if (fullUrl("/api/interviewer/circle") === url) {
      setIsCircle(true);
    } else {
      setIsCircle(false);
    }
  }, [url]);

  return (
    <section className="w-full min-h-screen bg-[#f5f7fb] px-3 sm:px-5 lg:px-8 py-6">
      {/* MAP WORKSPACE */}
      <div className="grid grid-cols-1 lg:grid-cols-[300px_minmax(0,1fr)] gap-5 items-stretch">
        {/* LEFT CONTROL PANEL */}
        <aside className="min-w-0 w-full h-full">
          <div className="h-full min-h-[450px]">
            {isCircle ? (
              <CircleComponent
                selectedMarker={selectedMarker}
                updateSelectedMarkerRadius={updateSelectedMarkerRadius}
              />
            ) : (
              <PolygonComponent setPolygonBoundary={setPolygonBoundary} />
            )}
          </div>
        </aside>

        {/* RIGHT MAP PANEL */}
        <div className="min-w-0 bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
          {/* MAP HEADER */}
          <div className="px-4 sm:px-6 py-4 border-b border-slate-100">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeWidth="1.8"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M3 6l6-3 6 3 6-3v15l-6 3-6-3-6 3V6z"
                    />
                    <path strokeWidth="1.8" d="M9 3v15m6-12v15" />
                  </svg>
                </div>

                <div>
                  <h3 className="text-base font-bold text-slate-900">
                    Interactive Map
                  </h3>
                  <p className="text-xs text-slate-500 mt-1">
                    Visualize and manage geographic search areas
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                <span className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-600">
                  <svg
                    className="w-3.5 h-3.5 text-indigo-500"
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
                  {isCircle ? "Circle Mode" : "Polygon Mode"}
                </span>

                <span className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-emerald-50 border border-emerald-100 text-xs font-semibold text-emerald-700">
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                  Live Map
                </span>
              </div>
            </div>
          </div>

          {/* MAP AREA */}
          <div className="relative flex-1 min-h-[450px] lg:min-h-[650px] w-full bg-slate-100">
            <MapContainer
              center={[
                selectedMarker?.lat ?? defaultLocation.lat,
                selectedMarker?.lng ?? defaultLocation.lng,
              ]}
              zoom={13}
              scrollWheelZoom={true}
              zoomControl={false}
              className="h-full w-full z-0"
            >
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
                maxZoom={19}
              />

              {isCircle ? (
                positions.map((position) => (
                  <Circle
                    key={position.id || `${position.lat}-${position.lng}`}
                    center={[position.lat, position.lng]}
                    radius={position.radius}
                    pathOptions={{
                      color:
                        position.id === selectedMarkerId
                          ? "#2563eb"
                          : "#60a5fa",
                      fillColor:
                        position.id === selectedMarkerId
                          ? "#3b82f6"
                          : "#93c5fd",
                      fillOpacity: position.id === selectedMarkerId ? 0.2 : 0.1,
                      weight: position.id === selectedMarkerId ? 2 : 1.5,
                    }}
                  />
                ))
              ) : (
                <Polygon
                  pathOptions={purpleOptions}
                  positions={polygonBoundary}
                />
              )}

              <ZoomControl position="topright" />

              <LocationMarker
                positions={positions}
                setPositions={setPositions}
                selectedMarkerId={selectedMarkerId}
                setSelectedMarkerId={setSelectedMarkerId}
                isCircle={isCircle}
              />
            </MapContainer>

            {/* TOP LEFT MAP INFORMATION */}
            {isCircle && (
              <div className="absolute top-4 left-4 z-[1000] max-w-[calc(100%-5rem)]">
                <div className="bg-white/95 backdrop-blur-md border border-white rounded-xl shadow-lg px-4 py-3">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="w-2 h-2 rounded-full bg-blue-600" />
                    <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      Active Search Radius
                    </p>
                  </div>

                  <p className="text-xl font-bold text-blue-600">
                    {selectedMarker?.radius ?? 500}
                    <span className="text-xs font-semibold text-slate-500 ml-1">
                      meters
                    </span>
                  </p>

                  <p className="text-[10px] text-slate-400 mt-1">
                    {selectedMarker
                      ? "Selected marker coverage"
                      : "Default radius"}
                  </p>
                </div>
              </div>
            )}

            {/* MAP LEGEND */}
            <div className="absolute bottom-4 left-4 z-[1000]">
              <div className="bg-white/95 backdrop-blur-md border border-white rounded-xl shadow-lg p-4 min-w-[190px]">
                <div className="flex items-center justify-between mb-3">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                    Map Legend
                  </p>

                  <svg
                    className="w-4 h-4 text-slate-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      d="M4 6h16M4 12h16M4 18h16"
                      strokeWidth="1.8"
                      strokeLinecap="round"
                    />
                  </svg>
                </div>

                <div className="space-y-3">
                  {isCircle && (
                    <>
                      <div className="flex items-center gap-3">
                        <span className="w-3 h-3 rounded-full bg-blue-600 ring-4 ring-blue-100" />
                        <span className="text-xs font-medium text-slate-700">
                          Selected radius
                        </span>
                      </div>

                      <div className="flex items-center gap-3">
                        <span className="w-3 h-3 rounded-full bg-blue-300" />
                        <span className="text-xs font-medium text-slate-700">
                          Other search areas
                        </span>
                      </div>
                    </>
                  )}

                  {!isCircle && (
                    <div className="flex items-center gap-3">
                      <span className="w-3 h-3 rounded-sm bg-purple-500" />
                      <span className="text-xs font-medium text-slate-700">
                        City boundary
                      </span>
                    </div>
                  )}

                  <div className="pt-2 border-t border-slate-100 flex items-center gap-3">
                    <span className="w-3 h-3 rounded-full bg-emerald-500" />
                    <span className="text-xs font-medium text-slate-700">
                      Map locations
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* MAP MODE INDICATOR */}
            <div className="absolute top-4 right-14 z-[1000]">
              <div className="bg-white/95 backdrop-blur-md border border-slate-200 rounded-lg shadow-md px-3 py-2 flex items-center gap-2">
                <svg
                  className="w-4 h-4 text-indigo-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    d="M3 6l6-3 6 3 6-3v15l-6 3-6-3-6 3V6z"
                    strokeWidth="1.8"
                    strokeLinejoin="round"
                  />
                </svg>
                <span className="text-[11px] font-semibold text-slate-600">
                  OpenStreetMap
                </span>
              </div>
            </div>
          </div>

          {/* MAP FOOTER */}
          <div className="px-4 sm:px-6 py-3 bg-white border-t border-slate-100">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
              <div className="flex items-center gap-2">
                <svg
                  className="w-4 h-4 text-blue-500 shrink-0"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    d="M12 11v5m0-8h.01M22 12a10 10 0 11-20 0 10 10 0 0120 0z"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                  />
                </svg>
                <p className="text-xs text-slate-500">
                  Click on the map to create markers and configure geographic
                  coverage.
                </p>
              </div>

              <div className="flex items-center gap-2 text-[11px] text-slate-400">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                Map tiles provided by OpenStreetMap
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Map;
