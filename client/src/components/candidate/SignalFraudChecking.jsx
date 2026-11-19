import { useEffect, useState } from "react";
import { apiUrl, readApiResponse } from "../../api.js";

export const SIGNAL_FRAUD_EMPLOYER_ID = "6aedaaa31678958d084176f4";

const flagNames = [
  "jobCountry",
  "ipStatus",
  "vpnDetection",
  "residentialProxy",
  "publicProxy",
];

export const useSignalFraudChecking = (employerId) => {
  const [signalFraud, setSignalFraud] = useState({
    loading: true,
    error: "",
    flags: null,
  });

  useEffect(() => {
    const controller = new AbortController();

    const fetchSignalFraudFlags = async () => {
      setSignalFraud({ loading: true, error: "", flags: null });

      try {
        const response = await fetch(
          apiUrl(`/api/location-flags/${encodeURIComponent(employerId)}`),
          { signal: controller.signal },
        );
        const result = await readApiResponse(
          response,
          "Unable to load signal fraud settings",
        );
        const flags = result?.locationFlag;

        if (
          !flags ||
          flagNames.some((flagName) => typeof flags[flagName] !== "boolean")
        ) {
          throw new Error("Signal fraud settings are incomplete.");
        }

        setSignalFraud({ loading: false, error: "", flags });
      } catch (error) {
        if (error.name !== "AbortError") {
          setSignalFraud({
            loading: false,
            error: error.message || "Unable to load signal fraud settings.",
            flags: null,
          });
        }
      }
    };

    fetchSignalFraudFlags();
    return () => controller.abort();
  }, [employerId]);

  return signalFraud;
};