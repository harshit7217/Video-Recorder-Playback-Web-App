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
import { apiUrl, readApiResponse } from "../../../api";
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
  const isCircle = fullUrl("/api/interviewer/circle") === url;
  const purpleOptions = { color: "purple" };
  const [polygonBoundary, setPolygonBoundary] = useState([]);

  useEffect(() => {
    const employer = JSON.parse(localStorage.getItem("employer"));
    if (!employer?._id) return;

    const loadSavedBoundaries = async () => {
      try {
        const response = await fetch(
          apiUrl(
            `api/employers/country-details?employerId=${encodeURIComponent(employer._id)}`,
          ),
        );
        const polygons = await readApiResponse(
          response,
          "Unable to load saved city boundaries",
        );

        if (!Array.isArray(polygons)) {
          throw new Error("Saved city boundaries response is not a list");
        }

        const boundaries = polygons.flatMap((polygon) => {
          if (!Array.isArray(polygon.boundary)) {
            throw new Error("Saved city boundary has an invalid format");
          }
          return polygon.boundary;
        });

        setPolygonBoundary(boundaries);
      } catch (error) {
        console.error("Loading saved city boundaries failed:", error.message);
      }
    };

    loadSavedBoundaries();
  }, []);

  return (
    
<section className="min-h-screen w-full overflow-x-hidden bg-slate-50 px-3 py-4 sm:px-5 sm:py-6 lg:px-8">
  <div className="mx-auto w-full max-w-[1800px]">

    {/* WORKSPACE */}
    <div className="grid grid-cols-1 items-start gap-5 xl:grid-cols-[320px_minmax(0,1fr)]">

      {/* LEFT SIDEBAR */}
      <aside className="min-w-0 w-full">
        <div className="rounded-2xl border border-slate-200 bg-white p-3 shadow-sm sm:p-4">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-slate-900">
                Search Controls
              </h2>
              <p className="mt-1 text-xs text-slate-500">
                Configure your geographic search area
              </p>
            </div>

            <span className="rounded-lg bg-indigo-50 px-3 py-1.5 text-xs font-semibold text-indigo-600">
              Settings
            </span>
          </div>

          <div className="min-w-0">
            {isCircle ? (
              <CircleComponent
                selectedMarker={selectedMarker}
                updateSelectedMarkerRadius={updateSelectedMarkerRadius}
              />
            ) : (
              <PolygonComponent
                setPolygonBoundary={setPolygonBoundary}
              />
            )}
          </div>
        </div>
      </aside>

      {/* RIGHT MAP PANEL */}
      <div className="flex min-w-0 flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">

        {/* MAP HEADER */}
        <div className="border-b border-slate-100 px-4 py-4 sm:px-6">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">

            <div className="flex min-w-0 items-center gap-3">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M3 6l6-3 6 3 6-3v15l-6 3-6-3-6 3V6z M9 3v15m6-12v15"
                  />
                </svg>
              </div>

              <div className="min-w-0">
                <h3 className="text-base font-bold text-slate-900">
                  Interactive Map
                </h3>
                <p className="mt-1 text-xs text-slate-500">
                  Visualize and manage geographic search areas
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-2 rounded-lg border border-indigo-100 bg-indigo-50 px-3 py-2 text-xs font-semibold text-indigo-700">
                <span className="h-2 w-2 rounded-full bg-indigo-500" />
                {isCircle ? "Circle Mode" : "Polygon Mode"}
              </span>

              <span className="inline-flex items-center gap-2 rounded-lg border border-emerald-100 bg-emerald-50 px-3 py-2 text-xs font-semibold text-emerald-700">
                <span className="h-2 w-2 rounded-full bg-emerald-500" />
                Live Map
              </span>
            </div>
          </div>
        </div>

        {/* MAP AREA */}
        <div className="relative h-[55vh] min-h-[400px] w-full bg-slate-100 sm:h-[65vh] sm:min-h-[500px] lg:h-[72vh] lg:min-h-[600px]">

          <MapContainer
            center={[
              selectedMarker?.lat ?? defaultLocation.lat,
              selectedMarker?.lng ?? defaultLocation.lng,
            ]}
            zoom={13}
            scrollWheelZoom={true}
            zoomControl={false}
            className="z-0 h-full w-full"
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
                    fillOpacity:
                      position.id === selectedMarkerId ? 0.2 : 0.1,
                    weight:
                      position.id === selectedMarkerId ? 2 : 1.5,
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

          {/* ACTIVE RADIUS */}
          {isCircle && (
            <div className="absolute left-3 top-3 z-[1000] max-w-[calc(100%-5rem)] sm:left-5 sm:top-5">
              <div className="rounded-xl border border-white bg-white/95 px-3 py-2.5 shadow-lg backdrop-blur-md sm:px-4 sm:py-3">
                <div className="mb-1 flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-blue-600" />
                  <p className="text-[9px] font-bold uppercase tracking-wider text-slate-400 sm:text-[10px]">
                    Active Search Radius
                  </p>
                </div>

                <p className="text-lg font-bold text-blue-600 sm:text-xl">
                  {selectedMarker?.radius ?? 500}
                  <span className="ml-1 text-xs font-semibold text-slate-500">
                    meters
                  </span>
                </p>

                <p className="mt-1 text-[10px] text-slate-400">
                  {selectedMarker
                    ? "Selected marker coverage"
                    : "Default radius"}
                </p>
              </div>
            </div>
          )}

          {/* MAP PROVIDER */}
          <div className="absolute right-12 top-3 z-[1000] sm:right-14 sm:top-5">
            <div className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white/95 px-2.5 py-2 shadow-md backdrop-blur-md sm:px-3">
              <svg className="h-4 w-4 shrink-0 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  d="M3 6l6-3 6 3 6-3v15l-6 3-6-3-6 3V6z"
                  strokeWidth="1.8"
                  strokeLinejoin="round"
                />
              </svg>
              <span className="text-[10px] font-semibold text-slate-600 sm:text-xs">
                OpenStreetMap
              </span>
            </div>
          </div>

          {/* MAP LEGEND */}
          <div className="absolute bottom-3 left-3 z-[1000] sm:bottom-5 sm:left-5">
            <div className="min-w-[155px] rounded-xl border border-white bg-white/95 p-3 shadow-lg backdrop-blur-md sm:min-w-[190px] sm:p-4">

              <div className="mb-3 flex items-center justify-between">
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                  Map Legend
                </p>
                <svg className="h-4 w-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path d="M4 6h16M4 12h16M4 18h16" strokeWidth="1.8" strokeLinecap="round" />
                </svg>
              </div>

              <div className="space-y-2.5">
                {isCircle ? (
                  <>
                    <div className="flex items-center gap-2.5">
                      <span className="h-3 w-3 rounded-full bg-blue-600 ring-4 ring-blue-100" />
                      <span className="text-[11px] font-medium text-slate-700">
                        Selected radius
                      </span>
                    </div>

                    <div className="flex items-center gap-2.5">
                      <span className="h-3 w-3 rounded-full bg-blue-300" />
                      <span className="text-[11px] font-medium text-slate-700">
                        Other search areas
                      </span>
                    </div>
                  </>
                ) : (
                  <div className="flex items-center gap-2.5">
                    <span className="h-3 w-3 rounded-sm bg-purple-500" />
                    <span className="text-[11px] font-medium text-slate-700">
                      City boundary
                    </span>
                  </div>
                )}

                <div className="flex items-center gap-2.5 border-t border-slate-100 pt-2">
                  <span className="h-3 w-3 rounded-full bg-emerald-500" />
                  <span className="text-[11px] font-medium text-slate-700">
                    Map locations
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* MAP FOOTER */}
        <div className="border-t border-slate-100 bg-white px-4 py-3 sm:px-6">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">

            <div className="flex items-start gap-2">
              <svg className="mt-0.5 h-4 w-4 shrink-0 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  d="M12 11v5m0-8h.01M22 12a10 10 0 11-20 0 10 10 0 0120 0z"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                />
              </svg>

              <p className="text-xs leading-relaxed text-slate-500">
                Click on the map to create markers and configure geographic coverage.
              </p>
            </div>

            <div className="flex items-center gap-2 text-[10px] font-medium text-slate-400">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
              Map tiles provided by OpenStreetMap
            </div>
          </div>
        </div>

      </div>
    </div>
  </div>
</section>

  );
};

export default Map;
