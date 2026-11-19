import { useEffect, useState } from "react";
import { apiUrl, readApiResponse } from "../../api.js";

const flagOptions = [
  { key: "jobCountry", label: "Job country" },
  { key: "ipStatus", label: "IP status" },
  { key: "vpnDetection", label: "VPN detection" },
  { key: "residentialProxy", label: "Residential proxy" },
  { key: "publicProxy", label: "Public proxy" },
];

const disabledFlags = Object.fromEntries(
  flagOptions.map(({ key }) => [key, false]),
);

const SignalFraud = () => {
  const [flags, setFlags] = useState(disabledFlags);
  const [employerId, setEmployerId] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    let isMounted = true;

    const loadFlags = async () => {
      try {
        const savedEmployer = localStorage.getItem("employer");
        const employer = savedEmployer ? JSON.parse(savedEmployer) : null;
        if (!employer?._id) {
          throw new Error("Please sign in as an employer to manage flags.");
        }

        if (isMounted) {
          setEmployerId(employer._id);
        }

        const employerUrl = apiUrl(
          `/api/location-flags/${encodeURIComponent(employer._id)}`,
        );
        let response = await fetch(employerUrl);

        if (response.status === 404) {
          response = await fetch(apiUrl("/api/location-flags"), {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              employerId: employer._id,
              ...disabledFlags,
            }),
          });

          if (response.status === 409) {
            response = await fetch(employerUrl);
          }
        }

        const data = await readApiResponse(
          response,
          "Unable to load location flags",
        );
        if (isMounted) {
          setFlags(
            Object.fromEntries(
              flagOptions.map(({ key }) => [key, data.locationFlag[key]]),
            ),
          );
        }
      } catch (loadError) {
        if (isMounted) {
          setError(loadError.message || "Unable to load location flags.");
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    loadFlags();
    return () => {
      isMounted = false;
    };
  }, []);

  const toggleFlag = (key) => {
    setFlags((currentFlags) => ({
      ...currentFlags,
      [key]: !currentFlags[key],
    }));
    setMessage("");
  };

  const saveFlags = async () => {
    setIsSaving(true);
    setError("");
    setMessage("");

    try {
      const response = await fetch(
        apiUrl(`/api/location-flags/${encodeURIComponent(employerId)}`),
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(flags),
        },
      );
      await readApiResponse(response, "Unable to update location flags");
      setMessage("Your location flags have been saved.");
    } catch (saveError) {
      setError(saveError.message || "Unable to update location flags.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <section className="mx-auto max-w-3xl rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
      <div className="mb-6">
        <p className="text-sm font-semibold uppercase tracking-wide text-indigo-600">
          Employer settings
        </p>
        <h1 className="mt-1 text-2xl font-bold text-slate-900">
          Signal fraud flags
        </h1>
        <p className="mt-2 text-sm text-slate-600">
          Choose which location and network checks to apply to candidates. Newly
          created flags start turned off.
        </p>
      </div>

      <div className="divide-y divide-slate-200">
        {flagOptions.map(({ key, label }) => (
          <div
            key={key}
            className="flex items-center justify-between gap-4 py-4"
          >
            <span className="font-medium text-slate-800">{label}</span>
            <button
              type="button"
              role="switch"
              aria-checked={flags[key]}
              aria-label={label}
              disabled={isLoading || isSaving || !employerId}
              onClick={() => toggleFlag(key)}
              className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${
                flags[key] ? "bg-indigo-600" : "bg-slate-300"
              }`}
            >
              <span
                className={`inline-block h-4 w-4 rounded-full bg-white transition-transform ${
                  flags[key] ? "translate-x-6" : "translate-x-1"
                }`}
              />
            </button>
          </div>
        ))}
      </div>

      {error && (
        <p className="mt-4 text-sm text-red-600" role="alert">
          {error}
        </p>
      )}
      {message && (
        <p className="mt-4 text-sm text-green-700" role="status">
          {message}
        </p>
      )}

      <div className="mt-6 flex items-center justify-between gap-4">
        <span className="text-sm text-slate-500" aria-live="polite">
          {isLoading ? "Loading flags..." : ""}
        </span>
        <button
          type="button"
          onClick={saveFlags}
          disabled={isLoading || isSaving || !employerId}
          className="rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isSaving ? "Saving..." : "Save changes"}
        </button>
      </div>
    </section>
  );
};

export default SignalFraud;
