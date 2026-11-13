import { useEffect, useState } from "react";
import { apiUrl, readApiResponse } from "../../api";
import { useNavigate } from "react-router";

const ModalDetails = ({ closeModal, mapLocation }) => {
  const navigate = useNavigate();
  const [geolocation, setGeolocation] = useState({
    loading: true,
    error: "",
    data: null,
  });
  const [vpnDetection, setVpnDetection] = useState({
    loading: true,
    error: "",
    isVpn: null,
  });

  useEffect(() => {
    const controller = new AbortController();

    const fetchIpGeolocation = async () => {
      try {
        const response = await fetch(apiUrl("api/ip/geolocation"), {
          signal: controller.signal,
        });
        const result = await readApiResponse(
          response,
          "IP geolocation lookup failed",
        );
        console.log(result);
        setGeolocation({ loading: false, error: "", data: result });
      } catch (error) {
        if (error.name !== "AbortError") {
          setGeolocation({
            loading: false,
            error: error.message,
            data: null,
          });
        }
      }
    };

    const fetchVPNDetection = async () => {
      try {
        const response = await fetch(apiUrl("api/vpn/detection"), {
          signal: controller.signal,
        });
        const result = await readApiResponse(
          response,
          "VPN Detection lookup failed",
        );
        setVpnDetection({
          loading: false,
          error: "",
          isVpn:
            typeof result === "boolean"
              ? result
              : typeof result?.isVpn === "boolean"
                ? result.isVpn
                : null,
        });
      } catch (error) {
        if (error.name !== "AbortError") {
          setVpnDetection({
            loading: false,
            error: error.message,
            isVpn: null,
          });
        }
      }
    };

    fetchIpGeolocation();
    fetchVPNDetection();

    return () => controller.abort();
  }, []);

  const location = geolocation.data?.location;
  const details = [
    ["IP address", geolocation.data?.ip],
    ["City", location?.city],
    ["State / region", location?.stateProv],
    ["Country", location?.country],
    ["Internet provider", geolocation.data?.isp],
  ].filter(([, value]) => value);

  const vpnStatus = vpnDetection.loading
    ? "checking"
    : vpnDetection.error || vpnDetection.isVpn === null
      ? "unavailable"
      : vpnDetection.isVpn
        ? "detected"
        : "clear";

  const vpnStatusStyles = {
    checking: "bg-amber-50 text-amber-700 ring-amber-200",
    unavailable: "bg-slate-100 text-slate-600 ring-slate-200",
    detected: "bg-rose-50 text-rose-700 ring-rose-200",
    clear: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  };

  const normalizeState = (state) =>
    typeof state === "string" ? state.trim().toLowerCase() : "";
  const ipState = normalizeState(location?.stateProv);
  const mapState = normalizeState(mapLocation?.state);
  const statesMatch = Boolean(ipState && mapState && ipState === mapState);

  let recordingBlockReason = "";
  if (geolocation.loading) {
    recordingBlockReason = "Checking the IP location...";
  } else if (geolocation.error) {
    recordingBlockReason = "Could not verify the IP location.";
  } else if (!ipState || !mapState) {
    recordingBlockReason = "Could not determine both location states.";
  } else if (!statesMatch) {
    recordingBlockReason = "The IP state and map location state do not match.";
  } else if (vpnDetection.loading) {
    recordingBlockReason = "Checking VPN status...";
  } else if (vpnDetection.error || vpnDetection.isVpn === null) {
    recordingBlockReason = "Could not verify VPN status.";
  } else if (vpnDetection.isVpn) {
    recordingBlockReason = "VPN detected. Turn it off to continue.";
  }

  const canStartRecording = recordingBlockReason === "";

  const handleRecording = () => {
    if (!canStartRecording) return;
    navigate("/api/candidate/recording");
  };

  return (
    <div className="overflow-hidden rounded-3xl border border-white/70 bg-white text-slate-900 shadow-2xl shadow-slate-950/25">
      <header className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-950 px-6 py-6 text-white sm:px-8 sm:py-7">
        <div className="absolute -right-10 -top-16 h-48 w-48 rounded-full bg-indigo-400/10 blur-2xl" />
        <div className="relative flex items-start justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white/10 text-indigo-200 ring-1 ring-white/15">
              <svg
                aria-hidden="true"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.7"
                className="h-6 w-6"
              >
                <path d="M12 3 19 6v5c0 4.5-2.9 8.2-7 10-4.1-1.8-7-5.5-7-10V6l7-3Z" />
                <path d="m9 12 2 2 4-4" />
              </svg>
            </div>
            <div>
              <p className="text-xs font-semibold tracking-[0.18em] text-indigo-200">
                SECURITY CHECK
              </p>
              <h2 className="mt-1 text-xl font-semibold tracking-tight sm:text-2xl">
                Connection details
              </h2>
              <p className="mt-1.5 max-w-sm text-sm leading-5 text-slate-300">
                Review the network information detected for this session.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={closeModal}
            aria-label="Close connection details"
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-slate-300 transition hover:bg-white/10 hover:text-white focus:outline-none focus:ring-2 focus:ring-white/60"
          >
            <svg
              aria-hidden="true"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              className="h-5 w-5"
            >
              <path d="m6 6 12 12M18 6 6 18" />
            </svg>
          </button>
        </div>
      </header>

      <div className="space-y-5 p-5 sm:p-8">
        {mapLocation && (
          <section className="rounded-2xl border border-indigo-100 bg-indigo-50/60 p-4 sm:p-5">
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-indigo-600 shadow-sm ring-1 ring-indigo-100">
                <svg
                  aria-hidden="true"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.7"
                  className="h-5 w-5"
                >
                  <path d="M20 10c0 5-8 11-8 11S4 15 4 10a8 8 0 1 1 16 0Z" />
                  <circle cx="12" cy="10" r="2.5" />
                </svg>
              </div>
              <div className="min-w-0 flex-1">
                <h3 className="text-sm font-semibold text-slate-900">
                  Map location
                </h3>
                <p className="mt-1 break-words text-sm leading-6 text-slate-700">
                  {mapLocation.name || "Address unavailable"}
                </p>
                <dl className="mt-3 grid grid-cols-2 gap-3 border-t border-indigo-100 pt-3 text-xs">
                  <div className="col-span-2">
                    <dt className="text-slate-500">State</dt>
                    <dd className="mt-1 font-medium text-slate-800">
                      {mapLocation.state || "Unavailable"}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-slate-500">Latitude</dt>
                    <dd className="mt-1 font-medium tabular-nums text-slate-800">
                      {mapLocation.lat.toFixed(5)}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-slate-500">Longitude</dt>
                    <dd className="mt-1 font-medium tabular-nums text-slate-800">
                      {mapLocation.lng.toFixed(5)}
                    </dd>
                  </div>
                </dl>
              </div>
            </div>
          </section>
        )}

        <section>
          <div className="mb-3 flex items-center justify-between gap-3">
            <div>
              <h3 className="text-sm font-semibold text-slate-900">
                IP and location
              </h3>
              <p className="mt-0.5 text-xs text-slate-500">
                Information provided by your network
              </p>
            </div>
            {geolocation.loading && (
              <span className="flex items-center gap-2 text-xs font-medium text-slate-500">
                <span className="h-2 w-2 animate-pulse rounded-full bg-indigo-500" />
                Looking up
              </span>
            )}
          </div>

          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-slate-50/70">
            {geolocation.loading && (
              <div className="space-y-3 p-4" aria-label="Loading IP details">
                <div className="h-4 w-2/5 animate-pulse rounded bg-slate-200" />
                <div className="h-4 w-3/5 animate-pulse rounded bg-slate-200" />
                <div className="h-4 w-1/2 animate-pulse rounded bg-slate-200" />
              </div>
            )}
            {geolocation.error && (
              <p role="alert" className="p-4 text-sm leading-6 text-rose-700">
                {geolocation.error}
              </p>
            )}
            {!geolocation.loading &&
              !geolocation.error &&
              (details.length > 0 ? (
                <dl className="divide-y divide-slate-200/80">
                  {details.map(([label, value]) => (
                    <div
                      key={label}
                      className="grid grid-cols-[minmax(0,1fr)_minmax(0,1.4fr)] gap-4 px-4 py-3 text-sm sm:px-5"
                    >
                      <dt className="text-slate-500">{label}</dt>
                      <dd className="break-words text-right font-medium text-slate-800">
                        {value}
                      </dd>
                    </div>
                  ))}
                </dl>
              ) : (
                <p className="p-4 text-sm text-slate-500">
                  No IP details were returned.
                </p>
              ))}
          </div>
        </section>

        <section className="flex items-center justify-between gap-4 rounded-2xl border border-slate-200 bg-white p-4 sm:px-5">
          <div className="flex min-w-0 items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
              <svg
                aria-hidden="true"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.7"
                className="h-5 w-5"
              >
                <path d="M4 8h16M4 16h16M8 4l-4 4 4 4m8 0 4 4-4 4" />
              </svg>
            </div>
            <div className="min-w-0">
              <h3 className="text-sm font-semibold text-slate-900">
                VPN detection
              </h3>
              <p className="mt-0.5 text-xs text-slate-500">
                {vpnDetection.loading
                  ? "Checking your network connection"
                  : vpnDetection.error
                    ? vpnDetection.error
                    : vpnDetection.isVpn === null
                      ? "VPN status could not be determined"
                      : vpnDetection.isVpn
                        ? "A VPN connection was identified"
                        : "No VPN connection was identified"}
              </p>
            </div>
          </div>
          <span
            className={`shrink-0 rounded-full px-3 py-1.5 text-xs font-semibold ring-1 ring-inset ${vpnStatusStyles[vpnStatus]}`}
            role={vpnDetection.error ? "alert" : undefined}
          >
            {vpnStatus === "checking"
              ? "Checking"
              : vpnStatus === "unavailable"
                ? "Unavailable"
                : vpnStatus === "detected"
                  ? "Detected"
                  : "Clear"}
          </span>
        </section>
      </div>

      <footer className="flex flex-col gap-3 border-t border-slate-100 bg-slate-50/80 px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-8">
        <p
          className={`text-xs ${canStartRecording ? "text-emerald-700" : "text-slate-500"}`}
          role="status"
        >
          {canStartRecording
            ? "Location states match and no VPN was detected."
            : recordingBlockReason}
        </p>
        <div className="flex justify-end gap-3">
          <button
            type="button"
            onClick={closeModal}
            className="rounded-xl bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
          >
            Close
          </button>
          <button
            type="button"
            onClick={handleRecording}
            disabled={!canStartRecording}
            className="rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:bg-slate-300 disabled:text-slate-500 disabled:shadow-none disabled:hover:bg-slate-300"
          >
            Go to recording
          </button>
        </div>
      </footer>
    </div>
  );
};

export default ModalDetails;
