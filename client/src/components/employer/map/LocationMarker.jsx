import { Marker, Popup, useMapEvents } from "react-leaflet";
import { useEffect, useState } from "react";
import { apiUrl } from "../../../api";

const createMarkerId = () => {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return crypto.randomUUID();
  }

  return `marker-${Date.now()}-${Math.random().toString(16).slice(2)}`;
};

const LocationMarker = ({
  positions,
  setPositions,
  selectedMarkerId,
  setSelectedMarkerId,
}) => {
  const [employerPayload, setEmployerPayload] = useState({});

  const resolveMarkerLocationName = async (positionId, lat, lng) => {
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

      setEmployerPayload(nextLocationData);
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

      setEmployerPayload(fallbackLocationData);
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

      setSelectedMarkerId(positionId);
      setPositions((prev) => [...prev, clickedPosition]);
      resolveMarkerLocationName(positionId, e.latlng.lat, e.latlng.lng);
    },
  });

  useEffect(() => {
    if (
      employerPayload.clientId &&
      Number.isFinite(employerPayload.lat) &&
      Number.isFinite(employerPayload.lng) &&
      employerPayload.name
    ) {
      const saveEmployerLocation = async () => {
        const storedEmployer = localStorage.getItem("employer");
        const employerId = storedEmployer ? JSON.parse(storedEmployer)._id : null;

        if (!employerId) {
          console.error("Employer not logged in; cannot save location");
          return;
        }

        const response = await fetch(apiUrl("/api/employers/post"), {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            employerId,
            lat: employerPayload.lat,
            lng: employerPayload.lng,
            radius: employerPayload.radius,
            name: employerPayload.name,
          }),
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();

        setPositions((prev) =>
          prev.map((position) =>
            position.id === employerPayload.clientId
              ? {
                  ...position,
                  _id: data._id,
                  employerId,
                  lat: employerPayload.lat,
                  lng: employerPayload.lng,
                  radius: employerPayload.radius,
                  name: employerPayload.name,
                }
              : position,
          ),
        );
      };

      saveEmployerLocation().catch((error) => {
        console.error("Error saving employer location:", error);
      });
    }
  }, [employerPayload, setPositions]);

  const deleteMarkerAndEmployer = async (positionId) => {
    const positionToRemove = positions.find(
      (position) => position.id === positionId,
    );

    if (positionToRemove?._id) {
      try {
        const storedEmployer = localStorage.getItem("employer");
        const employerId = storedEmployer ? JSON.parse(storedEmployer)._id : null;

        await fetch(
          apiUrl(
            `/api/employers/${positionToRemove._id}?employerId=${employerId}`,
          ),
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
        setSelectedMarkerId(null);
        return nextPositions;
      }

      if (selectedMarkerId === positionId) {
        setSelectedMarkerId(nextPositions[0].id);
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
            click: () => setSelectedMarkerId(pos.id),
            dblclick: () => deleteMarkerAndEmployer(pos.id),
          }}
        >
          <Popup>{pos.name || "Selected position"}</Popup>
        </Marker>
      ));
};

export default LocationMarker;
