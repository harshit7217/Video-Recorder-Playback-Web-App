import { useEffect, useMemo, useState } from "react";
import { socket } from "../../socket.js";
import Button from "./../ui/Button.jsx";
import { categoryMap } from "./../utils/categoryMap.js";

const CATEGORIES = ["all", "camera", "recording", "text", "window", "screen"];

const getEventCategory = (eventName = "") => eventName.split(":")[0];

function formatTime(iso) {
  if (!iso) return "-";
  return new Date(iso).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
}

function DetailChips({ row, events }) {
  const entries = Object.entries(row).filter(
    ([key]) => !["timestamp", "event", "socketId"].includes(key),
  );
  if (!entries.length) return <span className="text-slate-400">-</span>;

  if (events === "events") {
    return entries.map(([k, v]) =>
      k === "eventName" ? (
        <span
          key={k}
          className="mb-1 mr-1.5 inline-block rounded-md bg-slate-500/10 px-2 py-0.5 text-xs"
        >
          {v}
        </span>
      ) : null,
    );
  } else {
    return entries.map(([k, v]) =>
      k === "reason" ? (
        <span
          key={k}
          className="mb-1 mr-1.5 inline-block rounded-md bg-slate-500/10 px-2 py-0.5 text-xs"
        >
          {typeof v === "object" ? JSON.stringify(v) : String(v)}
        </span>
      ) : null,
    );
  }
}

export default function ActivityLogPage() {
  const [activityRows, setActivityRows] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [isLoading, setIsLoading] = useState(true);
  const handleActivityData = (data) => {
    if (!Array.isArray(data)) {
      setActivityRows((prev) => [...prev, data]);
    } else {
      setActivityRows(data);
    }
    setIsLoading(false);
  };

  const handleClear = () => {
    clearActivityData();
    setActivityRows([]);
  };

  const clearActivityData = () => {
    socket.emit("clearActivities");

    return () => {
      socket.off("clearActivities");
    };
  };

  const loadActivityData = () => {
    socket.emit("requestData");
    socket.on("recordingData", handleActivityData);

    return () => {
      socket.off("recordingData");
      socket.disconnect();
    };
  };

  useEffect(() => {
    socket.on("activityRecorded", handleActivityData);
    socket.on("connect", loadActivityData);

    socket.connect();
    if (isLoading === true) {
      loadActivityData();
    }
    return () => {
      socket.off("activityRecorded", handleActivityData);
      socket.off("connect", loadActivityData);
    };
  }, []);

  const stats = useMemo(() => {
    const countEventsByCategory = (categoryName) =>
      activityRows.filter((row) => {
        const eventCategory = getEventCategory(row.eventName);
        return categoryName.includes(eventCategory);
      }).length;

    return [
      { label: "Total events", value: activityRows.length },
      {
        label: "Recording",
        value: countEventsByCategory(categoryMap["recording"]),
      },
      {
        label: "Focus / window",
        value: countEventsByCategory(categoryMap["window"]),
      },
      {
        label: "Copy / paste",
        value: countEventsByCategory(categoryMap["text"]),
      },
    ];
  });

  const visibleActivityRows = useMemo(
    () =>
      [...activityRows].reverse().filter((row) => {
        if (selectedCategory === "all") return true;

        const matchingCategoryValue = categoryMap[selectedCategory];
        const eventCategory = getEventCategory(row.eventName);

        return matchingCategoryValue
          ? matchingCategoryValue.includes(eventCategory)
          : false;
      }),
    [activityRows, selectedCategory],
  );

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900 dark:bg-[#080d1a] dark:text-slate-100">
      <div className="mx-auto w-full max-w-7xl px-3 py-5 sm:px-5 sm:py-8 lg:px-8">
        {/* HEADER */}
        <header className="relative mb-6 overflow-hidden rounded-2xl bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 p-5 shadow-lg sm:rounded-3xl sm:p-7">
          <div className="absolute -right-16 -top-20 h-64 w-64 rounded-full bg-indigo-500/20 blur-3xl" />
          <div className="absolute bottom-0 right-1/3 h-32 w-32 rounded-full bg-blue-500/10 blur-3xl" />

          <div className="relative flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-start gap-3">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-white/10 text-indigo-300">
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.7"
                  className="h-6 w-6"
                >
                  <circle cx="12" cy="12" r="9" />
                  <path d="M12 7v5l3 2" />
                </svg>
              </div>

              <div>
                <div className="mb-1 flex flex-wrap items-center gap-2">
                  <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-indigo-300">
                    Monitoring Dashboard
                  </span>
                  <span className="flex items-center gap-1.5 rounded-full bg-emerald-400/10 px-2 py-1 text-[10px] font-semibold text-emerald-300">
                    <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-400" />
                    Session Activity
                  </span>
                </div>

                <h1 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
                  Session Details
                </h1>

                <p className="mt-1 text-xs leading-5 text-slate-400 sm:text-sm">
                  Monitor and review activity captured from the recorder
                </p>
              </div>
            </div>

            {/* ACTIONS */}
            <div className="flex w-full gap-2 sm:w-auto">
              <Button label="Refresh" onClick={loadActivityData} />

              <Button label="Clear" onClick={handleClear} />
            </div>
          </div>
        </header>

        {/* STATISTICS */}
        <section className="mb-6">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-sm font-bold text-slate-800 dark:text-slate-200">
              Activity Overview
            </h2>

            <span className="text-[10px] font-medium uppercase tracking-wider text-slate-400">
              Session statistics
            </span>
          </div>

          <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
            {stats.map((s, index) => (
              <div
                key={s.label}
                className="group relative overflow-hidden rounded-2xl bg-white p-4 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md dark:bg-slate-900 sm:p-5"
              >
                <div
                  className={`absolute right-0 top-0 h-20 w-20 rounded-full blur-2xl ${
                    index === 0
                      ? "bg-indigo-400/10"
                      : index === 1
                        ? "bg-blue-400/10"
                        : index === 2
                          ? "bg-emerald-400/10"
                          : "bg-violet-400/10"
                  }`}
                />

                <div className="relative">
                  <p className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-3xl">
                    {s.value}
                  </p>

                  <p className="mt-2 text-xs font-medium text-slate-500 dark:text-slate-400 sm:text-sm">
                    {s.label}
                  </p>

                  <div className="mt-3 h-1 w-10 rounded-full bg-indigo-500/60 transition-all group-hover:w-16" />
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ACTIVITY SECTION */}
        <section className="overflow-hidden rounded-2xl bg-white shadow-sm dark:bg-slate-900 sm:rounded-3xl">
          {/* SECTION HEADER */}
          <div className="px-4 py-4 sm:px-6">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-base font-bold text-slate-900 dark:text-white">
                  Activity Timeline
                </h2>

                <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                  Browse recorded events and their details
                </p>
              </div>

              <span className="w-fit rounded-lg bg-indigo-50 px-3 py-1.5 text-xs font-semibold text-indigo-700 dark:bg-indigo-500/10 dark:text-indigo-300">
                {visibleActivityRows.length} Records
              </span>
            </div>

            {/* FILTERS */}
            <nav
              className="mt-5 flex gap-2 overflow-x-auto pb-1"
              aria-label="Activity categories"
            >
              {CATEGORIES.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setSelectedCategory(c)}
                  aria-pressed={selectedCategory === c}
                  className={`shrink-0 rounded-xl px-4 py-2 text-xs font-semibold capitalize transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 dark:focus:ring-offset-slate-900 ${
                    selectedCategory === c
                      ? "bg-indigo-600 text-white shadow-sm shadow-indigo-500/20"
                      : "bg-slate-50 text-slate-500 hover:bg-indigo-50 hover:text-indigo-700 dark:bg-slate-800 dark:text-slate-400 dark:hover:bg-slate-700 dark:hover:text-white"
                  }`}
                >
                  {c}
                </button>
              ))}
            </nav>
          </div>

          {/* TABLE CONTENT */}
          <div className="relative">
            {isLoading ? (
              <div className="flex flex-col items-center justify-center px-4 py-16">
                <div className="h-9 w-9 animate-spin rounded-full border-4 border-indigo-100 border-t-indigo-600" />
                <p className="mt-4 text-sm font-medium text-slate-600 dark:text-slate-400">
                  Loading session activity...
                </p>
                <p className="mt-1 text-xs text-slate-400">
                  Please wait while records are retrieved
                </p>
              </div>
            ) : visibleActivityRows.length === 0 ? (
              <div className="flex flex-col items-center justify-center px-4 py-16 text-center">
                <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-400 dark:bg-indigo-500/10 dark:text-indigo-300">
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.7"
                    className="h-8 w-8"
                  >
                    <circle cx="12" cy="12" r="9" />
                    <path d="M12 8v4m0 4h.01" />
                  </svg>
                </div>

                <h3 className="text-base font-bold text-slate-800 dark:text-white">
                  No events found
                </h3>

                <p className="mt-2 max-w-xs text-xs leading-5 text-slate-500 dark:text-slate-400">
                  There are no activity records available for the selected
                  category.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[650px] border-collapse text-sm">
                  <thead>
                    <tr className="border-b border-slate-200 bg-slate-50/80 text-left dark:border-slate-800 dark:bg-slate-800/50">
                      <th className="w-44 px-5 py-4 text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                        Timestamp
                      </th>

                      <th className="w-56 px-5 py-4 text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                        Event
                      </th>

                      <th className="px-5 py-4 text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                        Details
                      </th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {visibleActivityRows.map((row, i) => {
                      getEventCategory(row.eventName);

                      return (
                        <tr
                          key={`${row.timestamp}-${i}`}
                          className="group align-top transition-colors hover:bg-indigo-50/40 dark:hover:bg-indigo-500/[0.04]"
                        >
                          <td className="whitespace-nowrap px-5 py-4">
                            <div className="flex items-center gap-2">
                              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400">
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

                              <span className="font-mono text-xs font-medium text-slate-500 dark:text-slate-400">
                                {formatTime(row.timestamp)}
                              </span>
                            </div>
                          </td>

                          <td className="px-5 py-4">
                            <DetailChips row={row} events="events" />
                          </td>

                          <td className="px-5 py-4">
                            <DetailChips row={row} />
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* TABLE FOOTER */}
          {!isLoading && visibleActivityRows.length > 0 && (
            <div className="flex flex-col gap-2 bg-slate-50/70 px-4 py-3 dark:bg-slate-800/30 sm:flex-row sm:items-center sm:justify-between sm:px-6">
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Showing {visibleActivityRows.length} activity records
              </p>

              <p className="text-[10px] font-medium text-slate-400">
                Session Activity Monitor
              </p>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
