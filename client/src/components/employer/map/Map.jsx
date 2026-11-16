import {
  MapContainer,
  TileLayer,
  ZoomControl,
  Circle,
  Polygon,
} from "react-leaflet";
import "leaflet/dist/leaflet.css";
import LocationMarker from "./LocationMarker";
import RadiusForm from "./RadiusForm";
import { defaultLocation } from "../../utils/defaultLoction";
import { useEffect, useState } from "react";

const Map = ({
  selectedMarker,
  updateSelectedMarkerRadius,
  positions,
  selectedMarkerId,
  setPositions,
  setSelectedMarkerId,
}) => {
  const [cityDetails, setCityDetails] = useState([]);
  const [boundary, setBoundary] = useState([]);
  const purpleOptions = { color: "purple" };
  const [cityName, setCityName] = useState("");
  const [temp, setTemp] = useState("");

  const fetching = async () => {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?q=${cityName}&format=geojson&polygon_geojson=1`,
      );
      const result = await response.json();
      setCityDetails(result.features);
    } catch (err) {
      console.error("Fetching boundary error:", err);
    }
  };

  useEffect(() => {
    fetching();
  }, [cityName]);

  const handleCityBoundary = (city) => {
    const ring = city.geometry.coordinates[0]; // outer ring
    const polygon = ring.map(([lng, lat]) => [lat, lng]);
    setBoundary(polygon);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setCityName(temp);
    fetching();
  };

  return (
    <section className="w-full min-h-screen bg-slate-50 px-3 sm:px-5 lg:px-8 py-6 space-y-6">
      {/* PAGE HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2 h-2 rounded-full bg-blue-600"></span>
            <span className="text-xs font-semibold uppercase tracking-wider text-blue-600">
              Location Intelligence
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">
            Explore City Boundaries
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Search cities, explore boundaries and configure geographic search
            areas.
          </p>
        </div>

        <div className="flex items-center gap-2 text-sm bg-white border border-slate-200 rounded-xl px-4 py-2.5 shadow-sm">
          <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
          <span className="font-medium text-slate-600">GIS Map Active</span>
        </div>
      </div>

      {/* CITY SEARCH SECTION */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-5">
          <div>
            <h2 className="text-lg font-bold text-slate-900">City Search</h2>
            <p className="text-sm text-slate-500 mt-1">
              Find a city and load its geographic boundary.
            </p>
          </div>

          <span className="text-xs font-semibold bg-blue-50 text-blue-700 px-3 py-1.5 rounded-full w-fit">
            {cityDetails.length} Cities Found
          </span>
        </div>

        <form
          onSubmit={handleSubmit}
          className="flex flex-col sm:flex-row gap-3"
        >
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-slate-400">
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <circle cx="11" cy="11" r="7" strokeWidth="2" />
                <path d="m16 16 4 4" strokeWidth="2" strokeLinecap="round" />
              </svg>
            </div>

            <input
              type="text"
              value={temp}
              onChange={(e) => setTemp(e.target.value)}
              placeholder="Search city name..."
              className="w-full pl-12 pr-4 py-3 rounded-xl bg-slate-50
          border border-slate-200 text-sm text-slate-800
          placeholder:text-slate-400 outline-none
          focus:bg-white focus:border-blue-500
          focus:ring-4 focus:ring-blue-500/10 transition"
            />
          </div>

          <button
            type="submit"
            className="flex items-center justify-center gap-2 px-7 py-3
        rounded-xl bg-blue-600 hover:bg-blue-700 text-white
        font-semibold text-sm shadow-sm transition-all
        active:scale-[0.98]"
          >
            Search Cities
          </button>
        </form>

        {/* CITY RESULTS */}
        {cityDetails.length > 0 && (
          <div className="mt-5 pt-5 border-t border-slate-100">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-3">
              Search Results
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
              {cityDetails.map((city, index) => (
                <button
                  key={index}
                  onClick={() => handleCityBoundary(city)}
                  className="group flex items-center gap-3 p-4 text-left
              rounded-xl border border-slate-200 bg-white
              hover:border-blue-400 hover:bg-blue-50/40
              hover:shadow-md transition-all duration-200"
                >
                  <div
                    className="w-11 h-11 shrink-0 rounded-xl bg-blue-50
                text-blue-600 flex items-center justify-center
                group-hover:bg-blue-600 group-hover:text-white transition"
                  >
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
                        d="M12 21s7-5.5 7-12a7 7 0 10-14 0c0 6.5 7 12 7 12z"
                      />
                      <circle cx="12" cy="9" r="2.5" strokeWidth="1.8" />
                    </svg>
                  </div>

                  <div className="flex-1 min-w-0">
                    <p
                      className="text-sm font-semibold text-slate-800
                  group-hover:text-blue-700 line-clamp-2"
                    >
                      {city.properties.display_name}
                    </p>
                    <p className="text-xs text-slate-400 mt-1">
                      View city boundary
                    </p>
                  </div>

                  <svg
                    className="w-4 h-4 shrink-0 text-slate-400
                group-hover:text-blue-600 group-hover:translate-x-1 transition"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      d="m9 18 6-6-6-6"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* MAP WORKSPACE */}
      <div className="grid grid-cols-1 lg:grid-cols-[280px_minmax(0,1fr)] gap-5 items-stretch">
        {/* LEFT SIDEBAR */}
        <aside className="min-w-0">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm h-full flex flex-col overflow-hidden">
            <div className="p-5 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
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
                  <h2 className="font-bold text-slate-900">Area Controls</h2>
                  <p className="text-xs text-slate-500">
                    Configure search location
                  </p>
                </div>
              </div>
            </div>

            <div className="p-5 flex-1 space-y-5">
              {/* RADIUS FORM */}
              <div>
                <h3 className="text-sm font-semibold text-slate-800 mb-1">
                  Search Radius
                </h3>
                <p className="text-xs text-slate-500 mb-4">
                  Adjust the selected marker's search coverage.
                </p>

                <RadiusForm
                  radius={selectedMarker?.radius ?? 500}
                  setRadius={updateSelectedMarkerRadius}
                />
              </div>

              {/* SELECTED MARKER INFO */}
              <div className="rounded-xl bg-slate-50 border border-slate-200 p-4">
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3">
                  Current Configuration
                </p>

                <div className="flex justify-between items-center mb-3">
                  <span className="text-xs text-slate-500">Active Marker</span>
                  <span className="text-xs font-semibold text-slate-800">
                    {selectedMarker ? "Selected" : "None"}
                  </span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-xs text-slate-500">Radius</span>
                  <span className="text-sm font-bold text-blue-600">
                    {selectedMarker?.radius ?? 500} m
                  </span>
                </div>
              </div>

              {/* INSTRUCTIONS */}
              <div className="rounded-xl bg-blue-50 border border-blue-100 p-4">
                <div className="flex items-center gap-2 mb-2">
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
                  <p className="text-xs font-bold text-blue-800">How to use</p>
                </div>
                <p className="text-xs text-blue-700 leading-relaxed">
                  Click anywhere on the map to add a marker. Select a marker to
                  update its search radius and visualize its coverage area.
                </p>
              </div>
            </div>
          </div>
        </aside>

        {/* RIGHT MAP */}
        <div className="min-w-0 bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
          {/* MAP HEADER */}
          <div className="flex flex-wrap items-center justify-between gap-3 px-4 sm:px-6 py-4 border-b border-slate-100">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
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
                <h3 className="font-bold text-slate-900">Interactive Map</h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Geographic boundary and radius visualization
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-100 px-3 py-2 rounded-full">
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
              <span className="text-xs font-semibold text-emerald-700">
                Live Map
              </span>
            </div>
          </div>

          {/* MAP CONTAINER */}
          <div className="relative flex-1 min-h-[450px] lg:min-h-[600px] w-full">
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

              {positions.map((position) => (
                <Circle
                  key={position.id || `${position.lat}-${position.lng}`}
                  center={[position.lat, position.lng]}
                  radius={position.radius}
                  pathOptions={{
                    color:
                      position.id === selectedMarkerId ? "#2563eb" : "#60a5fa",
                    fillColor:
                      position.id === selectedMarkerId ? "#3b82f6" : "#93c5fd",
                    fillOpacity: position.id === selectedMarkerId ? 0.2 : 0.1,
                    weight: position.id === selectedMarkerId ? 2 : 1.5,
                  }}
                />
              ))}

              <Polygon pathOptions={purpleOptions} positions={boundary} />

              <ZoomControl position="topright" />

              <LocationMarker
                positions={positions}
                setPositions={setPositions}
                selectedMarkerId={selectedMarkerId}
                setSelectedMarkerId={setSelectedMarkerId}
              />
            </MapContainer>

            {/* MAP LEGEND */}
            <div className="absolute bottom-4 left-4 z-[1000] bg-white/95 backdrop-blur-md rounded-xl border border-slate-200 shadow-lg p-3 space-y-2">
              <p className="text-[10px] uppercase font-bold tracking-wider text-slate-400">
                Map Legend
              </p>

              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-blue-600"></span>
                <span className="text-xs font-medium text-slate-700">
                  Selected radius
                </span>
              </div>

              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-blue-300"></span>
                <span className="text-xs font-medium text-slate-700">
                  Other search areas
                </span>
              </div>

              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-purple-500"></span>
                <span className="text-xs font-medium text-slate-700">
                  City boundary
                </span>
              </div>
            </div>

            {/* RADIUS BADGE */}
            <div className="absolute top-4 left-4 z-[1000] bg-white/95 backdrop-blur-md rounded-xl border border-slate-200 shadow-md px-4 py-3">
              <p className="text-[10px] uppercase tracking-wider font-bold text-slate-400">
                Active Search Radius
              </p>
              <p className="text-lg font-bold text-blue-600 mt-0.5">
                {selectedMarker?.radius ?? 500}{" "}
                <span className="text-xs font-semibold text-slate-500">
                  meters
                </span>
              </p>
            </div>
          </div>

          {/* MAP FOOTER */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 px-4 sm:px-6 py-3 bg-slate-50 border-t border-slate-100">
            <p className="text-xs text-slate-500">
              Select map locations to create and configure search areas.
            </p>
            <p className="text-xs text-slate-400">
              © OpenStreetMap contributors
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Map;
