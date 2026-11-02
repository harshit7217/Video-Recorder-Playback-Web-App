import { Marker, Popup, useMapEvents } from "react-leaflet";

const LocationMarker = ({
  positions,
  setPositions,
  setSelectedPositionIndex,
}) => {
  const updateLocationName = async (index, lat, lng) => {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=jsonv2`,
      );
      const data = await response.json();

      setPositions((prev) =>
        prev.map((position, positionIndex) =>
          positionIndex === index
            ? {
                ...position,
                name: data.display_name || "Selected position",
              }
            : position,
        ),
      );
    } catch (err) {
      console.error(err);
    }
  };

  useMapEvents({
    click(e) {
      const newPosition = {
        lat: e.latlng.lat,
        lng: e.latlng.lng,
        radius: 500,
        name: "Selected position",
      };

      const newIndex = positions.length;
      setPositions((prev) => [...prev, newPosition]);
      setSelectedPositionIndex(newIndex);
      updateLocationName(newIndex, e.latlng.lat, e.latlng.lng);
    },
  });

  const removePosition = (indexToRemove) => {
    setPositions((prev) => {
      const nextPositions = prev.filter((_, index) => index !== indexToRemove);
      setSelectedPositionIndex((currentIndex) => {
        if (nextPositions.length === 0) {
          return 0;
        }

        if (currentIndex >= nextPositions.length) {
          return nextPositions.length - 1;
        }

        return currentIndex;
      });
      return nextPositions;
    });
  };

  return positions === null
    ? null
    : positions.map((pos, index) => (
        <Marker
          key={`${pos.lat}-${pos.lng}-${index}`}
          position={[pos.lat, pos.lng]}
          eventHandlers={{
            click: () => setSelectedPositionIndex(index),
            dblclick: () => removePosition(index),
          }}
        >
          <Popup>{pos.name || "Selected position"}</Popup>
        </Marker>
      ));
};

export default LocationMarker;
