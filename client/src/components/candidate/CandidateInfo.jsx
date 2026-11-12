import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  useMapEvents,
} from "react-leaflet";
import { useNavigate } from "react-router";
import { useEffect, useState } from "react";
import { apiUrl, readApiResponse } from "../../api";
import { defaultPosition } from "./../utils/defaultPosition.js";

const CandidateInfo = () => {
  const navigate = useNavigate();
  const [candidate, setCandidate] = useState(() => {
    try {
      const savedCandidate = localStorage.getItem("candidate");
      return savedCandidate ? JSON.parse(savedCandidate) : null;
    } catch (error) {
      console.error("Error reading saved candidate:", error);
      return null;
    }
  });

  const handleLogout = () => {
    localStorage.removeItem("candidate");
    navigate("/");
  };

  function LocationMarker({ username }) {
    const [position, setPosition] = useState(null);
    const [isEligible, setIsEligible] = useState(false);

    useEffect(() => {
      if (position === null) return;
      const checkingTheRadius = async () => {
        try {
          const response = await fetch(apiUrl("/api/candidates/check-radius"), {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              lat: position.lat,
              lng: position.lng,
              employerId: "6aedaaa31678958d084176f4",
            }),
          });

          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }

          const result = await response.json();
          const isWithinRadius = result?.isWithinRadius === true;

          if (isWithinRadius) {
            setIsEligible(true);
          }
        } catch (err) {
          console.error(err);
        }
      };

      checkingTheRadius();
    }, [position]);

    useEffect(() => {
      if (isEligible) {
        navigate("/api/candidate/recording");
      }
    }, [isEligible, navigate]);

    useEffect(() => {
      const fetchingCandidateDetails = async () => {
        if (!username) {
          return;
        }
      };

      fetchingCandidateDetails();
    }, [username]);

    useEffect(() => {
      const fetchIpGeolocation = async () => {
        try {
          const response = await fetch(apiUrl("api/ip/geolocation"));
          const result = await readApiResponse(
            response,
            "IP geolocation lookup failed",
          );
          console.log(result);
        } catch (error) {
          console.error("IP geolocation lookup failed:", error);
        }
      };

      fetchIpGeolocation();
    }, []);

    const map = useMapEvents({
      click() {
        map.locate();
      },
      async locationfound(e) {
        map.flyTo(e.latlng, map.getZoom());

        if (position !== null) return;

        try {
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?lat=${e.latlng.lat}&lon=${e.latlng.lng}&format=jsonv2`,
          );
          const result = await response.json();
          const locationName = result?.display_name || "Candidate location";

          setPosition({
            lat: e.latlng.lat,
            lng: e.latlng.lng,
            name: locationName,
          });
        } catch (error) {
          console.error(error);
        }
      },
    });

    if (!position) {
      return null;
    }

    return (
      <Marker position={[position.lat, position.lng]}>
        <Popup>{position.name}</Popup>
      </Marker>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <button
          type="button"
          onClick={handleLogout}
          className="rounded-lg border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100 dark:border-slate-600 dark:text-slate-200 dark:hover:bg-slate-700"
        >
          Logout
        </button>
      </div>

      <div className="h-[500px] w-full overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-800">
        <MapContainer
          center={defaultPosition}
          zoom={13}
          scrollWheelZoom={false}
          className="h-full w-full"
          style={{ height: "100%", width: "100%" }}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <LocationMarker username={candidate.username} />
        </MapContainer>
      </div>
    </div>
  );
};

export default CandidateInfo;
