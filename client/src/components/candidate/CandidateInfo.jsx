import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  useMapEvents,
} from "react-leaflet";
import { useNavigate } from "react-router";
import { useEffect, useState } from "react";
import { defaultPosition } from "./../utils/defaultPosition.js";
import Modal from "react-modal";
import ModalDetails from "./ModalDetails.jsx";
import { fullUrl } from "../../url";

Modal.setAppElement("#root");

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
    const [modalIsOpenCircle, setmodalIsOpenCircle] = useState(false);
    const [isCircle, setIsCircle] = useState(true);
    const url = window.location.href;

    useEffect(() => {
      if (fullUrl("api/candidate/circle") === url) {
        setIsCircle(true);
      } else {
        setIsCircle(false);
      }
    }, [url]);

    function closeModal() {
      setmodalIsOpenCircle(false);
    }

    useEffect(() => {
      const fetchingCandidateDetails = async () => {
        if (!username) {
          return;
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

        if (position !== null) return;

        try {
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?lat=${e.latlng.lat}&lon=${e.latlng.lng}&format=jsonv2`,
          );
          const result = await response.json();
          const locationName = result?.display_name || "Candidate location";
          const mapState =
            result?.address?.state ||
            result?.address?.province ||
            result?.address?.region ||
            "";

          setPosition({
            lat: e.latlng.lat,
            lng: e.latlng.lng,
            name: locationName,
            state: mapState,
          });
          setmodalIsOpenCircle(true);
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
        <Modal
          isOpen={modalIsOpenCircle}
          onRequestClose={closeModal}
          className="w-full max-w-xl outline-none"
          overlayClassName="fixed inset-0 z-[1000] flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm"
          style={{
            overlay: { backgroundColor: "transparent" },
            content: {
              position: "relative",
              inset: "auto",
              overflow: "visible",
              border: "none",
              background: "transparent",
              padding: 0,
              width: "100%",
              maxWidth: "36rem",
            },
          }}
        >
          <ModalDetails
            closeModal={closeModal}
            mapLocation={position}
            isCircle={isCircle}
          />
        </Modal>
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
