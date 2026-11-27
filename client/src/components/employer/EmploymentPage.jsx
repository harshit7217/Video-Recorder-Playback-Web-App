import { apiUrl } from "../../api";
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

    async () => {
      try {
        await fetch(
          apiUrl(
            `/api/employers/${selectedMarkerSnapshot._id}?employerId=${employerId}`,
          ),
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
  };

  useEffect(() => {
    const fetchEmployers = async () => {
      const storedEmployer = localStorage.getItem("employer");
      const employerId = storedEmployer ? JSON.parse(storedEmployer)._id : null;

      const url = employerId
        ? apiUrl(`/api/employers?employerId=${employerId}`)
        : apiUrl("/api/employers");

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
    <div className="mx-auto w-full max-w-7xl overflow-hidden rounded-2xl bg-white shadow-lg shadow-slate-200/40 dark:bg-slate-900">
      {/* Map Header */}
      <div className="flex flex-col gap-3 bg-gradient-to-r from-indigo-50 to-white px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6 dark:from-slate-800 dark:to-slate-900">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-indigo-600 text-white shadow-md shadow-indigo-200 dark:shadow-none">
            <svg
              className="h-6 w-6"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
            >
              <path d="M20 10c0 5-8 12-8 12S4 15 4 10a8 8 0 1 1 16 0Z" />
              <circle cx="12" cy="10" r="2.5" />
            </svg>
          </div>

          <div>
            <h2 className="text-base font-bold text-slate-900 sm:text-lg dark:text-white">
              Location Monitoring
            </h2>

            <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
              Manage and monitor selected locations
            </p>
          </div>
        </div>

        <div className="inline-flex w-fit items-center gap-2 rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400">
          <span className="h-2 w-2 rounded-full bg-emerald-500" />
          Map Available
        </div>
      </div>

      {/* Map Content */}
      <div className="p-3 sm:p-5 md:p-6">
        <div className="relative w-full overflow-hidden rounded-xl bg-slate-100 dark:bg-slate-800">
          <div className="min-h-[350px] w-full sm:min-h-[420px] md:min-h-[500px] lg:min-h-[580px]">
            <Map
              selectedMarker={selectedMarker}
              updateSelectedMarkerRadius={updateSelectedMarkerRadius}
              positions={positions}
              selectedMarkerId={selectedMarkerId}
              setPositions={setPositions}
              setSelectedMarkerId={setSelectedMarkerId}
            />
          </div>
        </div>

        {/* Footer Information */}
        <div className="mt-4 flex flex-col gap-2 text-xs text-slate-500 sm:flex-row sm:items-center sm:justify-between dark:text-slate-400">
          <span>Select a marker to manage its location and radius.</span>

          <span className="font-medium text-indigo-600 dark:text-indigo-400">
            Interactive Location Map
          </span>
        </div>
      </div>
    </div>
  );
};

export default EmploymentPage;
