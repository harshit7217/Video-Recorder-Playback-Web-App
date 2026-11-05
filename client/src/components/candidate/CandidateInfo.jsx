import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  useMapEvents,
} from "react-leaflet";
import { useNavigate } from "react-router";
import { useEffect, useState } from "react";

const CandidateInfo = ({ candidate, setCandidate }) => {
  const navigate = useNavigate();
  if (!candidate) {
    return null;
  }

  const handleLogout = () => {
    setCandidate(null);
    localStorage.removeItem("candidate");
    navigate("/register-candidate");
  };

  const defaultPosition = [28.44373061164518, 77.05585275554049];

  function LocationMarker({ username }) {
    const [position, setPosition] = useState(null);

    useEffect(() => {
      const fetchingCandidateDetails = async () => {
        if (!username) {
          return;
        }

        try {
          const response = await fetch(
            `http://localhost:3001/api/candidates/details?username=${encodeURIComponent(username)}`,
            {
              method: "GET",
              headers: {
                "Content-Type": "application/json",
              },
            },
          );

          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }

          const result = await response.json();
          console.log(result);
          const candidateLocation = result?.candidate;

          if (
            candidateLocation &&
            Number.isFinite(candidateLocation.latitude) &&
            Number.isFinite(candidateLocation.longitude)
          ) {
            setPosition({
              lat: candidateLocation.latitude,
              lng: candidateLocation.longitude,
              name: candidateLocation.name ?? "Candidate location",
            });
          }
        } catch (error) {
          console.error(error);
        }
      };

      fetchingCandidateDetails();
    }, [username]);

    const map = useMapEvents({
      click() {
        map.locate();
      },
      async locationfound(e) {
        map.flyTo(e.latlng, map.getZoom());

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

          const updateResponse = await fetch(
            "http://localhost:3001/api/candidates/location",
            {
              method: "PUT",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                lat: e.latlng.lat,
                lng: e.latlng.lng,
                name: locationName,
                username: username,
              }),
            },
          );

          if (!updateResponse.ok) {
            throw new Error(`HTTP error! status: ${updateResponse.status}`);
          }

          const updatedCandidate = await updateResponse.json();
          console.log(updatedCandidate);
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
