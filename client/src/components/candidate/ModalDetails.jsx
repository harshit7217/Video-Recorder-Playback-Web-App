import { useEffect, useState } from "react";
import { apiUrl, readApiResponse } from "../../api";
import { useNavigate } from "react-router";
import Circle from "./Circle";
import {
  SIGNAL_FRAUD_EMPLOYER_ID,
  useSignalFraudChecking,
} from "./SignalFraudChecking.jsx";

const ModalDetails = ({ closeModal, mapLocation, isCircle }) => {
  const navigate = useNavigate();
  const signalFraud = useSignalFraudChecking(SIGNAL_FRAUD_EMPLOYER_ID);
  const signalFlags = signalFraud.flags;
  const [geolocation, setGeolocation] = useState({
    loading: true,
    error: "",
    data: null,
  });
  const [countryCheck, setCountryCheck] = useState({
    loading: true,
    error: "",
    isAllowed: null,
    candidateCountry: "",
  });
  const [mapRadiusCheck, setMapRadiusCheck] = useState({
    loading: true,
    error: "",
    isWithinRadius: null,
  });
  const [ipRadiusCheck, setIpRadiusCheck] = useState({
    loading: true,
    error: "",
    isWithinRadius: null,
  });
  const [networkDetection, setNetworkDetection] = useState({
    loading: true,
    error: "",
    isVpn: null,
    isResidentialProxy: null,
    isPublicProxy: null,
    ipStatus: "",
    isSuspicious: null,
  });
  const [polygonCheck, setPolygonCheck] = useState({
    loading: true,
    error: "",
    isInside: null,
  });

  useEffect(() => {
    if (signalFraud.loading || signalFraud.error || !signalFlags) return;

    const controller = new AbortController();
    const shouldFetchGeolocation =
      signalFlags.ipStatus || signalFlags.jobCountry;

    const fetchIpGeolocation = async () => {
      try {
        const response = await fetch(apiUrl("api/ip/geolocation"), {
          signal: controller.signal,
        });
        const result = await readApiResponse(
          response,
          "IP geolocation lookup failed",
        );
        setGeolocation({
          loading: false,
          error: "",
          data: result,
        });
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

    const fetchNetworkDetection = async () => {
      try {
        const response = await fetch(apiUrl("api/vpn/detection"), {
          signal: controller.signal,
        });
        const result = await readApiResponse(
          response,
          "VPN and proxy detection lookup failed",
        );
        setNetworkDetection({
          loading: false,
          error: "",
          isVpn: typeof result?.isVpn === "boolean" ? result.isVpn : null,
          isResidentialProxy:
            typeof result?.isResidentialProxy === "boolean"
              ? result.isResidentialProxy
              : null,
          isPublicProxy:
            typeof result?.isPublicProxy === "boolean"
              ? result.isPublicProxy
              : null,
          ipStatus: typeof result?.ipStatus === "string" ? result.ipStatus : "",
          isSuspicious:
            typeof result?.isSuspicious === "boolean"
              ? result.isSuspicious
              : null,
        });
      } catch (error) {
        if (error.name !== "AbortError") {
          setNetworkDetection({
            loading: false,
            error: error.message,
            isVpn: null,
            isResidentialProxy: null,
            isPublicProxy: null,
            ipStatus: "",
            isSuspicious: null,
          });
        }
      }
    };

    const shouldFetchNetworkDetection =
      signalFlags.vpnDetection ||
      signalFlags.ipStatus ||
      signalFlags.residentialProxy ||
      signalFlags.publicProxy;
    if (shouldFetchGeolocation) fetchIpGeolocation();
    if (shouldFetchNetworkDetection) {
      fetchNetworkDetection();
    }

    return () => controller.abort();
  }, [signalFraud.error, signalFraud.loading, signalFlags]);

  const ipDetails = geolocation.data;
  const location = ipDetails?.location;
  const ipLatitude = location?.latitude ?? ipDetails?.latitude;
  const ipLongitude = location?.longitude ?? ipDetails?.longitude;
  const hasMapCoordinates =
    Number.isFinite(Number(mapLocation?.lat)) &&
    Number.isFinite(Number(mapLocation?.lng));
  const hasIpCoordinates =
    ipLatitude !== undefined &&
    ipLatitude !== null &&
    ipLatitude !== "" &&
    ipLongitude !== undefined &&
    ipLongitude !== null &&
    ipLongitude !== "" &&
    Number.isFinite(Number(ipLatitude)) &&
    Number.isFinite(Number(ipLongitude));
  const mapRadiusStatus = hasMapCoordinates
    ? mapRadiusCheck
    : {
        loading: false,
        error: "Map location coordinates are unavailable.",
        isWithinRadius: null,
      };
  const ipRadiusStatus = !signalFlags?.ipStatus
    ? { loading: false, error: "", isWithinRadius: null, skipped: true }
    : mapRadiusStatus.loading
      ? { loading: true, error: "", isWithinRadius: null }
      : geolocation.loading
        ? { loading: true, error: "", isWithinRadius: null }
        : geolocation.error || !hasIpCoordinates
          ? {
              loading: false,
              error:
                geolocation.error || "IP location coordinates are unavailable.",
              isWithinRadius: null,
            }
          : ipRadiusCheck;
  const ipState = location?.stateProv ?? ipDetails?.region_name;
  const details = [
    ["IP address", ipDetails?.ip],
    ["Internet name", ipDetails?.isp],
    ["Latitude", location?.latitude ?? ipDetails?.latitude],
    ["Longitude", location?.longitude ?? ipDetails?.longitude],
    ["City", location?.city ?? ipDetails?.city],
    ["State / region", ipState],
    ["Country", location?.country ?? ipDetails?.country_name],
  ].filter(
    ([, value]) => value !== undefined && value !== null && value !== "",
  );

  useEffect(() => {
    if (!signalFlags?.jobCountry || geolocation.loading || geolocation.error) {
      return;
    }

    const controller = new AbortController();
    const candidateCountry = location?.country ?? ipDetails?.country_name ?? "";

    const checkJobCountry = async () => {
      try {
        const response = await fetch(apiUrl("/api/candidates/check-country"), {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            employerId: SIGNAL_FRAUD_EMPLOYER_ID,
            candidateCountry,
          }),
          signal: controller.signal,
        });
        const result = await readApiResponse(
          response,
          "Job country verification failed",
        );
        if (typeof result?.isAllowed !== "boolean") {
          throw new Error("The server returned an invalid country check.");
        }

        setCountryCheck({
          loading: false,
          error: "",
          isAllowed: result.isAllowed,
          candidateCountry: result.candidateCountry,
        });
      } catch (error) {
        if (error.name !== "AbortError") {
          setCountryCheck({
            loading: false,
            error: error.message || "Job country verification failed.",
            isAllowed: null,
            candidateCountry,
          });
        }
      }
    };

    checkJobCountry();
    return () => controller.abort();
  }, [
    geolocation.error,
    geolocation.loading,
    ipDetails?.country_name,
    location?.country,
    signalFlags?.jobCountry,
  ]);

  useEffect(() => {
    if (
      !hasMapCoordinates ||
      signalFraud.loading ||
      signalFraud.error ||
      !signalFlags ||
      (signalFlags.ipStatus && geolocation.loading)
    ) {
      return;
    }

    const controller = new AbortController();
    const shouldCheckIpRadius = signalFlags.ipStatus;
    const checkLocationRadii = async () => {
      setMapRadiusCheck({ loading: true, error: "", isWithinRadius: null });
      if (shouldCheckIpRadius && hasIpCoordinates) {
        setIpRadiusCheck({ loading: true, error: "", isWithinRadius: null });
      }

      try {
        const requestBody = {
          lat: Number(mapLocation.lat),
          lng: Number(mapLocation.lng),
          employerId: SIGNAL_FRAUD_EMPLOYER_ID,
        };
        if (shouldCheckIpRadius && hasIpCoordinates) {
          requestBody.ipLat = Number(ipLatitude);
          requestBody.ipLng = Number(ipLongitude);
        }

        const response = await fetch(apiUrl("/api/candidates/check-radius"), {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(requestBody),
          signal: controller.signal,
        });
        const result = await readApiResponse(
          response,
          "Location radius check failed",
        );
        const isMapWithinRadius =
          typeof result?.isMapWithinRadius === "boolean"
            ? result.isMapWithinRadius
            : result?.isWithinRadius === true;
        setMapRadiusCheck({
          loading: false,
          error: "",
          isWithinRadius: isMapWithinRadius,
        });
        if (shouldCheckIpRadius && hasIpCoordinates) {
          setIpRadiusCheck({
            loading: false,
            error:
              typeof result?.isIpWithinRadius === "boolean"
                ? ""
                : "The server did not return the IP radius check.",
            isWithinRadius:
              typeof result?.isIpWithinRadius === "boolean"
                ? result.isIpWithinRadius
                : null,
          });
        }
      } catch (error) {
        if (error.name !== "AbortError") {
          setMapRadiusCheck({
            loading: false,
            error: error.message,
            isWithinRadius: null,
          });
          if (shouldCheckIpRadius && hasIpCoordinates) {
            setIpRadiusCheck({
              loading: false,
              error: error.message,
              isWithinRadius: null,
            });
          }
        }
      }
    };

    const checkInsidePolygon = async (lat, lng) => {
      if (typeof lat !== "number" || typeof lng !== "number") {
        setPolygonCheck({
          loading: false,
          error: "Candidate location coordinates are unavailable.",
          isInside: null,
        });
        return;
      }

      setPolygonCheck({ loading: true, error: "", isInside: null });
      try {
        const response = await fetch(
          apiUrl(
            `api/candidates/polygon?lat=${encodeURIComponent(lat)}&lng=${encodeURIComponent(lng)}`,
          ),
          { signal: controller.signal },
        );
        const result = await readApiResponse(
          response,
          "Candidate polygon check failed",
        );
        if (typeof result?.isCheckInside !== "boolean") {
          throw new Error("The server did not return the polygon check result.");
        }
        setPolygonCheck({
          loading: false,
          error: "",
          isInside: result.isCheckInside,
        });
      } catch (error) {
        if (error.name !== "AbortError") {
          setPolygonCheck({
            loading: false,
            error: error.message,
            isInside: null,
          });
        }
      }
    };

    if (isCircle) {
      checkLocationRadii();
    }
    checkInsidePolygon(mapLocation?.lat, mapLocation?.lng);
    return () => controller.abort();
  }, [
    geolocation.loading,
    hasIpCoordinates,
    hasMapCoordinates,
    ipLatitude,
    ipLongitude,
    isCircle,
    mapLocation?.lat,
    mapLocation?.lng,
    signalFraud.error,
    signalFraud.loading,
    signalFlags,
  ]);

  const networkStatusStyles = {
    checking: "bg-amber-50 text-amber-700 ring-amber-200",
    unavailable: "bg-slate-100 text-slate-600 ring-slate-200",
    detected: "bg-rose-50 text-rose-700 ring-rose-200",
    clear: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  };
  const networkChecks = [
    {
      flag: "vpnDetection",
      label: "VPN detection",
      detected: networkDetection.isVpn,
      detectedMessage: "A VPN connection was identified",
      clearMessage: "No VPN connection was identified",
      blockMessage: "VPN detected. Turn it off to continue.",
    },
    {
      flag: "ipStatus",
      label: "IP status",
      detected: networkDetection.isSuspicious,
      detectedMessage: `IP status is suspicious (${networkDetection.ipStatus})`,
      clearMessage: `IP status is ${networkDetection.ipStatus || "clean"}`,
      blockMessage: `Suspicious IP status detected (${networkDetection.ipStatus}).`,
    },
    {
      flag: "residentialProxy",
      label: "Residential proxy detection",
      detected: networkDetection.isResidentialProxy,
      detectedMessage: "A residential proxy was identified",
      clearMessage: "No residential proxy was identified",
      blockMessage: "A residential proxy was detected.",
    },
    {
      flag: "publicProxy",
      label: "Public proxy detection",
      detected: networkDetection.isPublicProxy,
      detectedMessage: "A public proxy was identified",
      clearMessage: "No public proxy was identified",
      blockMessage: "A public proxy was detected.",
    },
  ];
  const enabledNetworkChecks = signalFlags
    ? networkChecks.filter(({ flag }) => signalFlags[flag])
    : [];
  const getNetworkStatus = (detected) =>
    networkDetection.loading
      ? "checking"
      : networkDetection.error || detected === null
        ? "unavailable"
        : detected
          ? "detected"
          : "clear";

  const getRadiusStatusValue = (status) =>
    status?.loading
      ? "checking"
      : status?.error
        ? "unavailable"
        : status?.isWithinRadius === true
          ? "within"
          : status?.isWithinRadius === false
            ? "outside"
            : "unavailable";
  const mapRadiusStatusValue = getRadiusStatusValue(mapRadiusStatus);
  const ipRadiusStatusValue = getRadiusStatusValue(ipRadiusStatus);
  const radiusStatusStyles = {
    checking: "bg-amber-50 text-amber-700 ring-amber-200",
    unavailable: "bg-slate-100 text-slate-600 ring-slate-200",
    within: "bg-emerald-50 text-emerald-700 ring-emerald-200",
    outside: "bg-rose-50 text-rose-700 ring-rose-200",
  };

  let recordingBlockReason = "";
  if (signalFraud.loading) {
    recordingBlockReason = "Loading employer signal fraud settings...";
  } else if (signalFraud.error) {
    recordingBlockReason = "Could not load employer signal fraud settings.";
  } else if (isCircle && mapRadiusStatus.loading) {
    recordingBlockReason =
      "Checking map location against interviewer radius...";
  } else if (isCircle && mapRadiusStatus.error) {
    recordingBlockReason = "Could not verify the map location radius.";
  } else if (isCircle && mapRadiusStatus.isWithinRadius !== true) {
    recordingBlockReason =
      "Your map location is outside the interviewer radius.";
  } else if (isCircle && signalFlags.ipStatus && ipRadiusStatus.loading) {
    recordingBlockReason = "Checking IP location against interviewer radius...";
  } else if (isCircle && signalFlags.ipStatus && ipRadiusStatus.error) {
    recordingBlockReason = "Could not verify the IP location radius.";
  } else if (
    isCircle &&
    signalFlags.ipStatus &&
    ipRadiusStatus.isWithinRadius !== true
  ) {
    recordingBlockReason =
      "Your IP location is not within the same interviewer radius as the map location.";
  } else if (
    (signalFlags.ipStatus || signalFlags.jobCountry) &&
    geolocation.loading
  ) {
    recordingBlockReason = "Checking the IP location...";
  } else if (
    (signalFlags.ipStatus || signalFlags.jobCountry) &&
    geolocation.error
  ) {
    recordingBlockReason = "Could not verify the IP location.";
  } else if (signalFlags.jobCountry && countryCheck.loading) {
    recordingBlockReason = "Checking the candidate's job country...";
  } else if (signalFlags.jobCountry && countryCheck.error) {
    recordingBlockReason = countryCheck.error;
  } else if (signalFlags.jobCountry && countryCheck.isAllowed !== true) {
    recordingBlockReason = "Your IP country is not allowed for this job.";
  } else if (enabledNetworkChecks.length > 0 && networkDetection.loading) {
    recordingBlockReason = "Checking enabled VPN and proxy detections...";
  } else if (enabledNetworkChecks.length > 0 && networkDetection.error) {
    recordingBlockReason = "Could not verify VPN or proxy status.";
  } else {
    const failedNetworkCheck = enabledNetworkChecks.find(
      ({ detected }) => detected === null,
    );
    const detectedNetworkCheck = enabledNetworkChecks.find(
      ({ detected }) => detected === true,
    );
    if (failedNetworkCheck) {
      recordingBlockReason = `Could not verify ${failedNetworkCheck.label.toLowerCase()}.`;
    } else if (detectedNetworkCheck) {
      recordingBlockReason = detectedNetworkCheck.blockMessage;
    }
  }

  const canStartRecording = recordingBlockReason === "";

  const handleRecording = () => {
    if (!canStartRecording) return;
    navigate("/api/candidate/recording");
  };

  return (
    <div className="flex w-full max-h-[92dvh] flex-col overflow-hidden rounded-2xl sm:rounded-3xl bg-white text-slate-900 shadow-2xl">
      {/* HEADER */}
      <header className="relative shrink-0 overflow-hidden bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 px-4 py-4 sm:px-6 sm:py-5">
        <div className="absolute -right-12 -top-20 h-48 w-48 rounded-full bg-indigo-500/15 blur-3xl" />

        <div className="relative flex items-center justify-between gap-3">
          <div className="flex min-w-0 items-center gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white/10 text-indigo-300">
              <svg
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

            <div className="min-w-0">
              <p className="text-[10px] font-bold tracking-[0.2em] text-indigo-300">
                SECURITY CHECK
              </p>
              <h2 className="truncate text-lg font-bold tracking-tight text-white sm:text-xl">
                Connection details
              </h2>
              <p className="mt-0.5 text-xs text-slate-400">
                Review your session security information
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={closeModal}
            aria-label="Close connection details"
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-slate-400 transition hover:bg-white/10 hover:text-white focus:outline-none focus:ring-2 focus:ring-indigo-400"
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              className="h-5 w-5"
            >
              <path d="m6 6 12 12M18 6 6 18" />
            </svg>
          </button>
        </div>
      </header>

      {/* BODY */}
      <main className="min-h-0 flex-1 overflow-y-auto overscroll-contain bg-slate-50/80 p-3 sm:p-5">
        {/* LOADING / ERROR */}
        {signalFraud.loading && (
          <div className="mb-4 rounded-xl bg-indigo-50 p-3 text-xs text-indigo-700">
            Loading employer security settings...
          </div>
        )}

        {signalFraud.error && (
          <div
            role="alert"
            className="mb-4 rounded-xl bg-rose-50 p-3 text-xs text-rose-700"
          >
            {signalFraud.error}
          </div>
        )}

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          {/* MAP LOCATION */}
          {mapLocation && (
            <section className="min-w-0 overflow-hidden rounded-2xl bg-white shadow-sm">
              <div className="flex items-center gap-3 px-4 py-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
                  <svg
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
                <div className="min-w-0">
                  <h3 className="text-sm font-bold">Map location</h3>
                  <p className="text-[11px] text-slate-500">
                    Detected session location
                  </p>
                </div>
              </div>

              <div className="p-4">
                <p className="break-words text-sm font-semibold text-slate-800">
                  {mapLocation.name || "Address unavailable"}
                </p>

                <div className="mt-4 grid grid-cols-2 gap-3">
                  <div className="col-span-2 rounded-xl bg-slate-50 p-3">
                    <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                      State
                    </p>
                    <p className="mt-1 text-xs font-semibold text-slate-800">
                      {mapLocation.state || "Unavailable"}
                    </p>
                  </div>

                  <div className="rounded-xl bg-slate-50 p-3">
                    <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                      Latitude
                    </p>
                    <p className="mt-1 break-all text-xs font-semibold tabular-nums text-slate-800">
                      {mapLocation.lat.toFixed(5)}
                    </p>
                  </div>

                  <div className="rounded-xl bg-slate-50 p-3">
                    <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                      Longitude
                    </p>
                    <p className="mt-1 break-all text-xs font-semibold tabular-nums text-slate-800">
                      {mapLocation.lng.toFixed(5)}
                    </p>
                  </div>
                </div>
              </div>
            </section>
          )}

          {/* IP DETAILS */}
          {signalFlags && (signalFlags.ipStatus || signalFlags.jobCountry) && (
            <section className="min-w-0 overflow-hidden rounded-2xl bg-white shadow-sm">
              <div className="flex items-center justify-between gap-3 px-4 py-3">
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-sky-50 text-sky-600">
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.7"
                      className="h-5 w-5"
                    >
                      <circle cx="12" cy="12" r="9" />
                      <path d="M3 12h18M12 3a15 15 0 0 1 0 18M12 3a15 15 0 0 0 0 18" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-sm font-bold">IP and location</h3>
                    <p className="text-[11px] text-slate-500">
                      Network information
                    </p>
                  </div>
                </div>

                {geolocation.loading && (
                  <span className="flex items-center gap-1.5 text-[11px] font-semibold text-indigo-600">
                    <span className="h-2 w-2 animate-pulse rounded-full bg-indigo-500" />
                    Looking up
                  </span>
                )}
              </div>

              {geolocation.loading ? (
                <div className="space-y-3 p-4">
                  {[1, 2, 3, 4].map((i) => (
                    <div
                      key={i}
                      className="h-4 animate-pulse rounded-lg bg-slate-100"
                    />
                  ))}
                </div>
              ) : geolocation.error ? (
                <p role="alert" className="p-4 text-xs text-rose-600">
                  {geolocation.error}
                </p>
              ) : details.length > 0 ? (
                <dl className="divide-y divide-slate-100">
                  {details.map(([label, value]) => (
                    <div
                      key={label}
                      className="grid grid-cols-2 gap-3 px-4 py-3 text-xs"
                    >
                      <dt className="text-slate-500">{label}</dt>
                      <dd className="break-words text-right font-semibold text-slate-800">
                        {value}
                      </dd>
                    </div>
                  ))}
                </dl>
              ) : (
                <p className="p-4 text-xs text-slate-500">
                  No IP details were returned.
                </p>
              )}
            </section>
          )}

          {/* RADIUS CHECK */}
          {isCircle === true && signalFlags && (
            <section className="min-w-0 rounded-2xl bg-white p-4 shadow-sm lg:col-span-2">
              <Circle
                mapRadiusStatus={mapRadiusStatus}
                mapRadiusStatusValue={mapRadiusStatusValue}
                radiusStatusStyles={radiusStatusStyles}
                ipRadiusStatus={ipRadiusStatus}
                ipRadiusStatusValue={ipRadiusStatusValue}
                showIpRadiusStatus={signalFlags.ipStatus}
              />
            </section>
          )}

          {/* COUNTRY VERIFICATION */}
          {signalFlags?.jobCountry && isCircle && (
            <section className="flex min-w-0 items-center justify-between gap-3 rounded-2xl bg-white p-4 shadow-sm">
              <div className="flex min-w-0 items-center gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-violet-50 text-violet-600">
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.7"
                    className="h-5 w-5"
                  >
                    <path d="M12 22s8-4 8-11V5l-8-3-8 3v6c0 7 8 11 8 11Z" />
                    <path d="m9 12 2 2 4-4" />
                  </svg>
                </div>
                <div className="min-w-0">
                  <h3 className="text-sm font-bold">Country verification</h3>
                  <p className="mt-1 text-[11px] leading-4 text-slate-500">
                    {countryCheck.loading
                      ? "Comparing IP country with allowed countries"
                      : countryCheck.error
                        ? countryCheck.error
                        : countryCheck.isAllowed
                          ? `${countryCheck.candidateCountry} is allowed for this job`
                          : `${countryCheck.candidateCountry} is not allowed for this job`}
                  </p>
                </div>
              </div>

              <span
                className={`shrink-0 rounded-full px-2.5 py-1 text-[10px] font-bold ${
                  countryCheck.loading
                    ? "bg-amber-50 text-amber-700"
                    : countryCheck.error
                      ? "bg-slate-100 text-slate-600"
                      : countryCheck.isAllowed
                        ? "bg-emerald-50 text-emerald-700"
                        : "bg-rose-50 text-rose-700"
                }`}
                role={countryCheck.error ? "alert" : "status"}
              >
                {countryCheck.loading
                  ? "Checking"
                  : countryCheck.error
                    ? "Unavailable"
                    : countryCheck.isAllowed
                      ? "Allowed"
                      : "Not allowed"}
              </span>
            </section>
          )}

          {isCircle === false && (
            <section className="flex min-w-0 items-center justify-between gap-3 rounded-2xl bg-white p-4 shadow-sm">
              <div className="flex min-w-0 items-center gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-violet-50 text-violet-600">
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.7"
                    className="h-5 w-5"
                  >
                    <path d="M12 22s8-4 8-11V5l-8-3-8 3v6c0 7 8 11 8 11Z" />
                    <path d="m9 12 2 2 4-4" />
                  </svg>
                </div>
                <div className="min-w-0">
                  <h3 className="text-sm font-bold">Location verification</h3>
                  <p className="mt-1 text-[11px] leading-4 text-slate-500">
                    {polygonCheck.loading
                      ? "Checking whether your location is inside the allowed area"
                      : polygonCheck.error
                        ? polygonCheck.error
                        : polygonCheck.isInside
                          ? "Your location is inside the allowed area"
                          : "Your location is outside the allowed area"}
                  </p>
                </div>
              </div>

              <span
                className={`shrink-0 rounded-full px-2.5 py-1 text-[10px] font-bold ${
                  polygonCheck.loading
                    ? "bg-amber-50 text-amber-700"
                    : polygonCheck.error
                      ? "bg-slate-100 text-slate-600"
                      : polygonCheck.isInside
                        ? "bg-emerald-50 text-emerald-700"
                        : "bg-rose-50 text-rose-700"
                }`}
                role={polygonCheck.error ? "alert" : "status"}
              >
                {polygonCheck.loading
                  ? "Checking"
                  : polygonCheck.error
                    ? "Unavailable"
                    : polygonCheck.isInside
                      ? "Inside"
                      : "Outside"}
              </span>
            </section>
          )}

          {/* NETWORK DETECTION */}
          {enabledNetworkChecks.map((check) => {
            const status = getNetworkStatus(check.detected);

            const statusMessage = networkDetection.loading
              ? "Checking your network connection"
              : networkDetection.error
                ? networkDetection.error
                : status === "unavailable"
                  ? "Detection result could not be determined"
                  : status === "detected"
                    ? check.detectedMessage
                    : check.clearMessage;

            return (
              <section
                key={check.flag}
                className="flex min-w-0 items-center justify-between gap-3 rounded-2xl bg-white p-4 shadow-sm transition hover:shadow-md"
              >
                <div className="flex min-w-0 items-center gap-3">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
                    <svg
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
                    <h3 className="truncate text-sm font-bold text-slate-800">
                      {check.label}
                    </h3>
                    <p className="mt-1 text-[11px] leading-4 text-slate-500">
                      {statusMessage}
                    </p>
                  </div>
                </div>

                <span
                  className={`shrink-0 rounded-full px-2.5 py-1 text-[10px] font-bold ring-1 ring-inset ${networkStatusStyles[status]}`}
                  role={networkDetection.error ? "alert" : "status"}
                >
                  {status === "checking"
                    ? "Checking"
                    : status === "unavailable"
                      ? "Unavailable"
                      : status === "detected"
                        ? "Detected"
                        : "Clear"}
                </span>
              </section>
            );
          })}
        </div>
      </main>

      {/* FOOTER */}
      <footer className="z-10 shrink-0 bg-white px-4 py-3 sm:px-6 sm:py-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-2">
            <span
              className={`mt-0.5 h-2.5 w-2.5 shrink-0 rounded-full ${
                canStartRecording ? "bg-emerald-500" : "bg-amber-500"
              }`}
            />

            <p
              className={`text-[11px] leading-5 ${
                canStartRecording ? "text-emerald-700" : "text-slate-500"
              }`}
            >
              {canStartRecording
                ? "Location checks passed and enabled network checks are clear."
                : recordingBlockReason}
            </p>
          </div>

          <div className="flex w-full flex-col-reverse gap-2 sm:w-auto sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={closeModal}
              className="w-full rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-xs font-semibold text-slate-700 transition hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 sm:w-auto"
            >
              Close
            </button>

            <button
              type="button"
              onClick={handleRecording}
              disabled={!canStartRecording}
              className="w-full rounded-xl bg-indigo-600 px-5 py-2.5 text-xs font-semibold text-white shadow-sm transition hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:bg-slate-300 disabled:text-slate-500 disabled:shadow-none sm:w-auto"
            >
              Go to recording
              <span className="ml-2" aria-hidden="true">
                →
              </span>
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default ModalDetails;
