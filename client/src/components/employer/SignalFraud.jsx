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
    <section
      className="
  mx-auto w-full max-w-4xl
  overflow-hidden rounded-2xl
  bg-white
  shadow-xl shadow-slate-200/40
  dark:bg-slate-900
"
    >
      {/* Header */}
      <div
        className="
    bg-gradient-to-r from-indigo-50 to-white
    p-5 sm:p-7
    dark:from-indigo-950/40 dark:to-slate-900
  "
      >
        <div className="flex items-center gap-4">
          <div
            className="
        flex h-12 w-12 shrink-0
        items-center justify-center
        rounded-xl bg-indigo-600
        text-white shadow-lg shadow-indigo-200
        dark:shadow-none
      "
          >
            <svg
              className="h-6 w-6"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
            >
              <path d="M12 22s8-4 8-11V5l-8-3-8 3v6c0 7 8 11 8 11z" />
              <path d="m9 12 2 2 4-4" />
            </svg>
          </div>

          <div className="min-w-0">
            <p
              className="
          text-[10px] font-bold uppercase
          tracking-[0.18em] text-indigo-600
          dark:text-indigo-400
        "
            >
              Employer Settings
            </p>

            <h1
              className="
          mt-1 text-xl font-bold tracking-tight
          text-slate-900 sm:text-2xl
          dark:text-white
        "
            >
              Signal Fraud Flags
            </h1>
          </div>
        </div>

        <p
          className="
      mt-4 max-w-2xl text-sm leading-6
      text-slate-600 dark:text-slate-400
    "
        >
          Configure location and network verification checks to help identify
          suspicious candidate activity. Newly created flags are disabled by
          default.
        </p>
      </div>

      {/* Settings */}
      <div className="p-5 sm:p-7">
        <div className="mb-5 flex flex-wrap items-center justify-between gap-2">
          <div>
            <h2 className="text-sm font-bold text-slate-900 dark:text-white">
              Detection Preferences
            </h2>
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
              Enable or disable individual security checks.
            </p>
          </div>

          <span
            className="
        rounded-lg bg-indigo-50 px-3 py-1.5
        text-xs font-semibold text-indigo-700
        dark:bg-indigo-500/10 dark:text-indigo-300
      "
          >
            {flagOptions.length} Settings
          </span>
        </div>

        <div className="space-y-3">
          {flagOptions.map(({ key, label }) => (
            <div
              key={key}
              className={`
            flex flex-col gap-3 rounded-xl
            p-4 transition-all duration-200
            sm:flex-row sm:items-center
            sm:justify-between
            ${
              flags[key]
                ? "bg-indigo-50/60 dark:bg-indigo-500/10"
                : "bg-slate-50 hover:bg-indigo-50 dark:bg-slate-800 dark:hover:bg-slate-700"
            }
          `}
            >
              <div className="flex min-w-0 items-center gap-3">
                <div
                  className={`
              flex h-10 w-10 shrink-0
              items-center justify-center
              rounded-xl
              ${
                flags[key]
                  ? "bg-indigo-600 text-white"
                  : "bg-slate-100 text-slate-500 dark:bg-slate-700 dark:text-slate-300"
              }
            `}
                >
                  <svg
                    className="h-5 w-5"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                  >
                    <path d="M12 22s8-4 8-11V5l-8-3-8 3v6c0 7 8 11 8 11z" />
                    <path d="M12 8v4m0 4h.01" />
                  </svg>
                </div>

                <div className="min-w-0">
                  <p
                    className="
                break-words text-sm font-semibold
                text-slate-800 dark:text-slate-100
              "
                  >
                    {label}
                  </p>

                  <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                    {flags[key] ? "Detection enabled" : "Detection disabled"}
                  </p>
                </div>
              </div>

              <div
                className="
            flex items-center justify-between
            gap-3 sm:justify-end
          "
              >
                <span
                  className={`
              text-[10px] font-bold uppercase tracking-wider
              ${
                flags[key]
                  ? "text-indigo-600 dark:text-indigo-400"
                  : "text-slate-400"
              }
            `}
                >
                  {flags[key] ? "Enabled" : "Disabled"}
                </span>

                <button
                  type="button"
                  role="switch"
                  aria-checked={flags[key]}
                  aria-label={label}
                  disabled={isLoading || isSaving || !employerId}
                  onClick={() => toggleFlag(key)}
                  className={`
                relative inline-flex h-7 w-12
                shrink-0 items-center rounded-full
                transition-colors duration-300
                focus-visible:outline-none
                focus-visible:ring-4
                focus-visible:ring-indigo-500/20
                disabled:cursor-not-allowed
                disabled:opacity-50
                ${
                  flags[key]
                    ? "bg-indigo-600"
                    : "bg-slate-300 dark:bg-slate-600"
                }
              `}
                >
                  <span
                    className={`
                h-5 w-5 rounded-full bg-white
                shadow-md transition-transform duration-300
                ${flags[key] ? "translate-x-[25px]" : "translate-x-1"}
              `}
                  />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Error */}
        {error && (
          <div
            className="
          mt-5 rounded-xl
          bg-red-50 p-3 text-sm text-red-700
          dark:bg-red-500/10
          dark:text-red-300
        "
            role="alert"
          >
            {error}
          </div>
        )}

        {/* Success */}
        {message && (
          <div
            className="
          mt-5 rounded-xl
          bg-emerald-50 p-3 text-sm text-emerald-700
          dark:bg-emerald-500/10
          dark:text-emerald-300
        "
            role="status"
          >
            {message}
          </div>
        )}

        {/* Footer */}
        <div
          className="
      mt-7 flex flex-col gap-4
      pt-5
      sm:flex-row sm:items-center
      sm:justify-between
    "
        >
          <div
            className="
        flex items-center gap-2
        text-xs text-slate-500 dark:text-slate-400
      "
            aria-live="polite"
          >
            {isLoading ? (
              <>
                <span
                  className="
              h-3.5 w-3.5 animate-spin
              rounded-full border-2
              border-indigo-200 border-t-indigo-600
            "
                />
                Loading flags...
              </>
            ) : isSaving ? (
              <>
                <span className="h-2 w-2 animate-pulse rounded-full bg-indigo-500" />
                Saving changes...
              </>
            ) : (
              <>
                <span className="h-2 w-2 rounded-full bg-emerald-500" />
                Settings ready
              </>
            )}
          </div>

          <button
            type="button"
            onClick={saveFlags}
            disabled={isLoading || isSaving || !employerId}
            className="
          flex w-full items-center
          justify-center gap-2
          rounded-xl bg-indigo-600
          px-6 py-3 text-sm font-bold
          text-white shadow-lg shadow-indigo-200/50
          transition-all duration-200
          hover:-translate-y-0.5 hover:bg-indigo-700
          active:translate-y-0
          focus-visible:outline-none
          focus-visible:ring-4
          focus-visible:ring-indigo-500/20
          disabled:cursor-not-allowed
          disabled:opacity-50
          sm:w-auto
          dark:shadow-none
        "
          >
            {isSaving ? (
              "Saving..."
            ) : (
              <>
                <svg
                  className="h-4 w-4"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
                  <path d="M17 21v-8H7v8M7 3v5h8" />
                </svg>
                Save Changes
              </>
            )}
          </button>
        </div>
      </div>

      <div
        className="
    h-1 w-full
    bg-gradient-to-r
    from-indigo-700 via-violet-500 to-indigo-400
  "
      />
    </section>
  );
};

export default SignalFraud;
