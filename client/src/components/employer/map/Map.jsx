import { MapContainer, TileLayer, ZoomControl, Circle } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import LocationMarker from "./LocationMarker";
import RadiusForm from "./RadiusForm";
import { useMemo, useState } from "react";

const defaultPosition = {
  lat: 28.44373061164518,
  lng: 77.05585275554049,
  radius: 500,
  name: "Shaheed Major Vikas Yadav Marg, Sector 39, Gurgaon, Haryana, 101301, India",
};

const Map = () => {
  const [positions, setPositions] = useState([defaultPosition]);
  const [selectedPositionIndex, setSelectedPositionIndex] = useState(0);

  const selectedPosition = useMemo(
    () => positions[selectedPositionIndex] ?? positions[0],
    [positions, selectedPositionIndex],
  );

  const updateSelectedRadius = (value) => {
    const parsedValue = Number(value);
    const safeRadius = Number.isFinite(parsedValue)
      ? Math.max(500, parsedValue)
      : 500;

    setPositions((prev) =>
      prev.map((position, index) =>
        index === selectedPositionIndex
          ? { ...position, radius: safeRadius }
          : position,
      ),
    );
  };

  return (
    <section className="w-full max-w-none mx-0 px-2 sm:px-4 lg:px-6 py-5 sm:py-8">
      <div className="w-full grid grid-cols-1 lg:grid-cols-[300px_minmax(0,1fr)] gap-5 lg:gap-6 items-stretch">
        {/* Left Sidebar */}
        <aside className="w-full min-w-0">
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-4 sm:p-5 h-full flex flex-col">
            <div className="mb-5">
              <h2 className="text-lg font-bold text-gray-900 mb-2">
                Search Area
              </h2>
              <p className="text-sm text-gray-500">
                Select a position on the map and update its radius.
              </p>
            </div>

            <div className="border-t border-gray-100 pt-5">
              <RadiusForm
                radius={selectedPosition?.radius ?? 500}
                setRadius={updateSelectedRadius}
              />
            </div>

            <div className="mt-auto pt-5">
              <div className="p-3 rounded-xl bg-blue-50 border border-blue-100">
                <p className="text-xs font-semibold text-blue-800 mb-1">
                  Search tip
                </p>
                <p className="text-xs text-blue-700 leading-relaxed">
                  Click a marker to choose a point, then change that
                  point&apos;s radius to refine the search area.
                </p>
              </div>
            </div>
          </div>
        </aside>

        {/* Right Map Section */}
        <div className="w-full min-w-0 min-h-[350px] overflow-hidden rounded-2xl sm:rounded-3xl border border-gray-200 bg-white shadow-sm flex flex-col">
          {/* Map Header */}
          <div className="flex flex-wrap items-center justify-between gap-3 px-4 sm:px-5 py-4 border-b border-gray-100 shrink-0">
            <div>
              <h3 className="text-base font-bold text-gray-900">Map View</h3>
              <p className="text-xs text-gray-500 mt-1">
                Explore your selected search area
              </p>
            </div>

            <span className="inline-flex items-center gap-2 text-xs font-semibold bg-green-50 text-green-700 px-3 py-2 rounded-full">
              <span className="w-2 h-2 rounded-full bg-green-500" />
              Map Active
            </span>
          </div>

          {/* Map */}
          <div className="relative flex-1 min-h-[350px] w-full">
            <MapContainer
              center={[
                selectedPosition?.lat ?? defaultPosition.lat,
                selectedPosition?.lng ?? defaultPosition.lng,
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

              {positions.map((position, index) => (
                <Circle
                  key={`${position.lat}-${position.lng}-${index}`}
                  center={[position.lat, position.lng]}
                  radius={position.radius}
                  pathOptions={{
                    color:
                      index === selectedPositionIndex ? "#2563eb" : "#60a5fa",
                    fillColor:
                      index === selectedPositionIndex ? "#3b82f6" : "#93c5fd",
                    fillOpacity: index === selectedPositionIndex ? 0.2 : 0.1,
                    weight: index === selectedPositionIndex ? 2 : 1.5,
                  }}
                />
              ))}

              <ZoomControl position="topright" />
              <LocationMarker
                positions={positions}
                setPositions={setPositions}
                selectedPositionIndex={selectedPositionIndex}
                setSelectedPositionIndex={setSelectedPositionIndex}
              />
            </MapContainer>

            {/* Radius Indicator */}
            <div className="absolute bottom-4 left-4 z-[1000] bg-white/95 backdrop-blur-md rounded-xl shadow-md border border-gray-100 px-3 py-2">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-blue-500" />
                <span className="text-xs font-semibold text-gray-700">
                  Search radius: {selectedPosition?.radius ?? 500} meters
                </span>
              </div>
            </div>
          </div>

          {/* Map Footer */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 px-4 sm:px-5 py-3 bg-gray-50 border-t border-gray-100 shrink-0">
            <p className="text-xs text-gray-500">
              Move around the map to explore locations.
            </p>
            <p className="text-xs text-gray-400">
              © OpenStreetMap contributors
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Map;
