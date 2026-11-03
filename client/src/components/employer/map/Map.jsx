import { MapContainer, TileLayer, ZoomControl, Circle } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import LocationMarker from "./LocationMarker";
import RadiusForm from "./RadiusForm";
import { useMemo, useState, useEffect } from "react";

const defaultLocation = {
  id: "default-position",
  lat: 28.44373061164518,
  lng: 77.05585275554049,
  radius: 500,
  name: "Shaheed Major Vikas Yadav Marg, Sector 39, Gurgaon, Haryana, 101301, India",
};

const Map = () => {
  const [positions, setPositions] = useState([defaultLocation]);
  const [selectedMarkerId, setSelectedMarkerId] = useState(defaultLocation.id);

  const selectedMarker = useMemo(
    () =>
      positions.find((position) => position.id === selectedMarkerId) ??
      positions[0],
    [positions, selectedMarkerId],
  );

  const updateSelectedMarkerRadius = async (value) => {
    const parsedValue = Number(value);
    const safeRadius = Number.isFinite(parsedValue)
      ? Math.max(500, parsedValue)
      : 500;

    setPositions((prev) =>
      prev.map((position) =>
        position.id === selectedMarkerId
          ? { ...position, radius: safeRadius }
          : position,
      ),
    );

    const selectedMarkerSnapshot = positions.find(
      (position) => position.id === selectedMarkerId,
    );

    if (!selectedMarkerSnapshot?._id) {
      return;
    }

    try {
      await fetch(
        `http://localhost:3001/api/employers/${selectedMarkerSnapshot._id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            ...selectedMarkerSnapshot,
            radius: safeRadius,
            name: selectedMarkerSnapshot.name ?? "Selected position",
          }),
        },
      );
    } catch (error) {
      console.error("Error updating employer radius:", error);
    }
  };

  useEffect(() => {
    const fetchEmployers = async () => {
      const response = await fetch("http://localhost:3001/api/employers");
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      const normalizedPositions = data.map((employer) => ({
        ...employer,
        id: employer.id ?? employer._id ?? `${employer.lat}-${employer.lng}`,
      }));
      setPositions(normalizedPositions);
      if (normalizedPositions.length > 0) {
        setSelectedMarkerId(normalizedPositions[0].id);
      }
    };

    fetchEmployers().catch((error) => {
      console.error("Error fetching employers:", error);
    });
  }, []);

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
                radius={selectedMarker?.radius ?? 500}
                setRadius={updateSelectedMarkerRadius}
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
              ))}

              <ZoomControl position="topright" />
              <LocationMarker
                positions={positions}
                setPositions={setPositions}
                selectedMarkerId={selectedMarkerId}
                setSelectedMarkerId={setSelectedMarkerId}
              />
            </MapContainer>

            {/* Radius Indicator */}
            <div className="absolute bottom-4 left-4 z-[1000] bg-white/95 backdrop-blur-md rounded-xl shadow-md border border-gray-100 px-3 py-2">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-blue-500" />
                <span className="text-xs font-semibold text-gray-700">
                  Search radius: {selectedMarker?.radius ?? 500} meters
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
