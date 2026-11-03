import { Marker, Popup, useMapEvents } from "react-leaflet";
import { useEffect, useState } from "react";

const createMarkerId = () => {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return crypto.randomUUID();
  }

  return `marker-${Date.now()}-${Math.random().toString(16).slice(2)}`;
};

const LocationMarker = ({
  positions,
  setPositions,
  selectedPositionId,
  setSelectedPositionId,
}) => {
  const [newData, setNewData] = useState({});

  const updateLocationName = async (positionId, lat, lng) => {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=jsonv2`,
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      const resolvedName = data?.display_name?.trim() || "Selected position";
      const nextLocationData = {
        clientId: positionId,
        lat,
        lng,
        name: resolvedName,
        radius: 500,
      };

      setNewData(nextLocationData);
      setPositions((prev) =>
        prev.map((position) =>
          position.id === positionId
            ? {
                ...position,
                name: resolvedName,
                radius: 500,
              }
            : position,
        ),
      );

      return nextLocationData;
    } catch (err) {
      console.error(err);
      const fallbackLocationData = {
        clientId: positionId,
        lat,
        lng,
        name: "Selected position",
        radius: 500,
      };

      setNewData(fallbackLocationData);
      setPositions((prev) =>
        prev.map((position) =>
          position.id === positionId
            ? {
                ...position,
                name: "Selected position",
                radius: 500,
              }
            : position,
        ),
      );

      return fallbackLocationData;
    }
  };

  useMapEvents({
    click(e) {
      const positionId = createMarkerId();
      const clickedPosition = {
        id: positionId,
        lat: e.latlng.lat,
        lng: e.latlng.lng,
        radius: 500,
        name: "Selected position",
      };

      setSelectedPositionId(positionId);
      setPositions((prev) => [...prev, clickedPosition]);
      updateLocationName(positionId, e.latlng.lat, e.latlng.lng);
    },
  });

  useEffect(() => {
    if (
      newData.clientId &&
      Number.isFinite(newData.lat) &&
      Number.isFinite(newData.lng) &&
      newData.name
    ) {
      const fetchEmployers = async () => {
        const response = await fetch(
          "http://localhost:3001/api/employers/post",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(newData),
          },
        );
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();

        setPositions((prev) =>
          prev.map((position) =>
            position.id === newData.clientId
              ? { ...position, _id: data._id }
              : position,
          ),
        );
      };

      fetchEmployers().catch((error) => {
        console.error("Error fetching employers:", error);
      });
    }
  }, [newData, setPositions]);

  const removePosition = async (positionId) => {
    const positionToRemove = positions.find(
      (position) => position.id === positionId,
    );

    if (positionToRemove?._id) {
      try {
        await fetch(
          `http://localhost:3001/api/employers/${positionToRemove._id}`,
          {
            method: "DELETE",
          },
        );
      } catch (error) {
        console.error("Error deleting employer:", error);
      }
    }

    setPositions((prev) => {
      const nextPositions = prev.filter(
        (position) => position.id !== positionId,
      );

      if (nextPositions.length === 0) {
        setSelectedPositionId(null);
        return nextPositions;
      }

      if (selectedPositionId === positionId) {
        setSelectedPositionId(nextPositions[0].id);
      }

      return nextPositions;
    });
  };

  return positions === null
    ? null
    : positions.map((pos) => (
        <Marker
          key={pos.id || `${pos.lat}-${pos.lng}`}
          position={[pos.lat, pos.lng]}
          eventHandlers={{
            click: () => setSelectedPositionId(pos.id),
            dblclick: () => removePosition(pos.id),
          }}
        >
          <Popup>{pos.name || "Selected position"}</Popup>
        </Marker>
      ));
};

export default LocationMarker;
