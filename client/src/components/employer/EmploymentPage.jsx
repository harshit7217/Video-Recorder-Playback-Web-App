import Map from "./map/Map.jsx";
import { useEffect, useMemo, useState } from "react";
import { defaultLocation } from "../utils/defaultLoction.js";

const EmploymentPage = () => {
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

    const storedEmployer = localStorage.getItem("employer");
    const employerId = storedEmployer ? JSON.parse(storedEmployer)._id : null;

    try {
      await fetch(
        `http://localhost:3001/api/employers/${selectedMarkerSnapshot._id}?employerId=${employerId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            ...selectedMarkerSnapshot,
            employerId,
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
      const storedEmployer = localStorage.getItem("employer");
      const employerId = storedEmployer ? JSON.parse(storedEmployer)._id : null;

      const url = employerId
        ? `http://localhost:3001/api/employers?employerId=${employerId}`
        : "http://localhost:3001/api/employers";

      const response = await fetch(url);
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
    <div>
      <Map
        selectedMarker={selectedMarker}
        updateSelectedMarkerRadius={updateSelectedMarkerRadius}
        positions={positions}
        selectedMarkerId={selectedMarkerId}
        setPositions={setPositions}
        setSelectedMarkerId={setSelectedMarkerId}
      />
    </div>
  );
};

export default EmploymentPage;
