import { MapContainer, TileLayer, ZoomControl, Circle } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import LocationMarker from "./LocationMarker";
import RadiusForm from "./RadiusForm";
import { useEffect, useState } from "react";

const Map = () => {
  const [position, setPosition] = useState([
    {
      lat: 28.44373061164518,
      lng: 77.05585275554049,
    },
  ]);
  const [radius, setRadius] = useState(500);

  useEffect(() => {
    setRadius(500);
  }, [position]);

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
                Customize your search radius to explore nearby locations.
              </p>
            </div>

            <div className="border-t border-gray-100 pt-5">
              <RadiusForm radius={radius} setRadius={setRadius} />
            </div>

            <div className="mt-auto pt-5">
              <div className="p-3 rounded-xl bg-blue-50 border border-blue-100">
                <p className="text-xs font-semibold text-blue-800 mb-1">
                  Search tip
                </p>
                <p className="text-xs text-blue-700 leading-relaxed">
                  Increase the radius to discover more locations around your
                  selected point.
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
              center={[position[0].lat, position[0].lng]}
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

              <Circle
                center={[
                  position[position.length - 1].lat,
                  position[position.length - 1].lng,
                ]}
                radius={radius}
                pathOptions={{
                  color: "#2563eb",
                  fillColor: "#3b82f6",
                  fillOpacity: 0.15,
                  weight: 2,
                }}
              />

              <ZoomControl position="topright" />
              <LocationMarker position={position} setPosition={setPosition} />
            </MapContainer>

            {/* Radius Indicator */}
            <div className="absolute bottom-4 left-4 z-[1000] bg-white/95 backdrop-blur-md rounded-xl shadow-md border border-gray-100 px-3 py-2">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-blue-500" />
                <span className="text-xs font-semibold text-gray-700">
                  Search radius: {radius} meter
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
