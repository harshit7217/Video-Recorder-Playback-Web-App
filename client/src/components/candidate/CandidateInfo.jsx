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
  const savedCandidate = localStorage.getItem("candidate");
  const [candidate, setCandidate] = useState(() => {
    return savedCandidate ? JSON.parse(savedCandidate) : null;
  });

  const handleLogout = () => {
    localStorage.removeItem("candidate");
    setCandidate(null);
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
    <div className="min-h-screen space-y-5 bg-slate-50 p-3 dark:bg-slate-950 sm:p-5 lg:p-7">
      {/* HEADER */}
      <div className="overflow-hidden rounded-2xl bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 p-5 shadow-lg sm:rounded-3xl sm:p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-white/10 text-indigo-300">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.7"
                className="h-6 w-6"
              >
                <path d="M20 10c0 5-8 11-8 11S4 15 4 10a8 8 0 1 1 16 0Z" />
                <circle cx="12" cy="10" r="2.5" />
              </svg>
            </div>

            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-indigo-300">
                Location Monitoring
              </p>

              <h1 className="mt-1 text-xl font-bold text-white sm:text-2xl">
                Candidate Location
              </h1>

              <p className="mt-1 text-xs text-slate-400">
                View the candidate's current reported location
              </p>
            </div>
          </div>

          {/* LOGOUT */}
          <button
            type="button"
            onClick={handleLogout}
            className="flex w-full items-center justify-center gap-2 rounded-xl border border-white/15 bg-white/10 px-5 py-2.5 text-sm font-semibold text-white transition hover:border-rose-400/40 hover:bg-rose-500/15 hover:text-rose-200 focus:outline-none focus:ring-2 focus:ring-white/50 sm:w-auto"
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              className="h-4 w-4"
            >
              <path d="M10 17l5-5-5-5m5 5H3m9-9h7a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-7" />
            </svg>
            Logout
          </button>
        </div>
      </div>

      {/* MAP SECTION */}
      <section className="overflow-hidden rounded-2xl bg-white shadow-sm dark:bg-slate-900 sm:rounded-3xl">
        {/* MAP HEADER */}
        <div className="flex flex-col gap-3 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-300">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.7"
                className="h-5 w-5"
              >
                <path d="m3 6 6-3 6 3 6-3v15l-6 3-6-3-6 3V6Z" />
                <path d="M9 3v15m6-12v15" />
              </svg>
            </div>

            <div>
              <h2 className="text-sm font-bold text-slate-900 dark:text-white">
                Location Map
              </h2>
              <p className="mt-0.5 text-[11px] text-slate-500 dark:text-slate-400">
                Geographic view of candidate location
              </p>
            </div>
          </div>

          <span className="flex w-fit items-center gap-2 rounded-full bg-emerald-50 px-3 py-1.5 text-[10px] font-bold text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300">
            <span className="h-2 w-2 rounded-full bg-emerald-500" />
            Map Available
          </span>
        </div>

        {/* MAP */}
        <div className="relative h-[350px] w-full bg-slate-100 sm:h-[450px] lg:h-[550px]">
          <MapContainer
            center={defaultPosition}
            zoom={13}
            scrollWheelZoom={false}
            className="h-full w-full"
            style={{ height: "100%", width: "100%", zIndex: 0 }}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />

            <LocationMarker username={candidate.username} />
          </MapContainer>
        </div>

        {/* MAP FOOTER */}
        <div className="flex flex-col gap-2 bg-white px-4 py-3 dark:bg-slate-900 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-300">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.7"
                className="h-4 w-4"
              >
                <circle cx="12" cy="12" r="9" />
                <path d="M12 7v5l3 2" />
              </svg>
            </div>

            <p className="text-xs text-slate-500 dark:text-slate-400">
              Location information for{" "}
              <span className="font-semibold text-slate-800 dark:text-slate-200">
                {candidate.username}
              </span>
            </p>
          </div>

          <p className="text-[10px] text-slate-400">
            Map data © OpenStreetMap contributors
          </p>
        </div>
      </section>
    </div>
  );
};

export default CandidateInfo;
