import { useEffect, useMemo, useState } from "react";
import { socket } from "../socket.js";
import Button from "./Button.jsx";
import { categoryMap } from "./categoryMap.js";

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

export default function Details() {
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
    <main className="min-h-screen bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100">
      <div className="mx-auto max-w-5xl px-5 pb-16 pt-8">
        {/* Header */}
        <header className="mb-6 flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              Session details
            </h1>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              Live activity captured from the recorder
            </p>
          </div>
          <div className="flex gap-2">
            <Button label={"Refresh"} onClick={loadActivityData} />
            <Button label={"Clear"} onClick={handleClear} />
          </div>
        </header>

        {/* Stats */}
        <section className="mb-5 grid grid-cols-2 gap-3 md:grid-cols-4">
          {stats.map((s) => (
            <div
              key={s.label}
              className="flex flex-col gap-1 rounded-xl border border-slate-200 bg-white px-4 py-4 dark:border-slate-800 dark:bg-slate-900"
            >
              <span className="text-3xl font-bold tracking-tight">
                {s.value}
              </span>
              <span className="text-sm text-slate-500 dark:text-slate-400">
                {s.label}
              </span>
            </div>
          ))}
        </section>

        {/* Filters */}
        <nav className="mb-4 flex flex-wrap gap-2">
          {CATEGORIES.map((c) => (
            <button
              key={c}
              onClick={() => setSelectedCategory(c)}
              className={`rounded-full border px-3.5 py-1.5 text-sm capitalize transition ${
                selectedCategory === c
                  ? "border-indigo-600 bg-indigo-600 text-white"
                  : "border-slate-200 bg-white text-slate-500 hover:text-slate-900 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-400 dark:hover:text-slate-100"
              }`}
            >
              {c}
            </button>
          ))}
        </nav>

        {/* Table */}
        <section className="overflow-x-auto rounded-xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
          {isLoading ? (
            <div className="px-4 py-12 text-center text-slate-500">
              Loading...
            </div>
          ) : visibleActivityRows.length === 0 ? (
            <div className="px-4 py-12 text-center text-slate-500">
              No events yet
            </div>
          ) : (
            <table className="w-full border-collapse text-sm">
              <thead>
                <tr className="border-b border-slate-200 text-left text-xs uppercase tracking-wider text-slate-500 dark:border-slate-800 dark:text-slate-400">
                  <th className="px-4 py-3 font-semibold">Time</th>
                  <th className="px-4 py-3 font-semibold">Event</th>
                  <th className="px-4 py-3 font-semibold">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                {visibleActivityRows.map((row, i) => {
                  getEventCategory(row.eventName);
                  return (
                    <tr
                      key={`${row.timestamp}-${i}`}
                      className="align-top transition hover:bg-slate-500/5"
                    >
                      <td className="whitespace-nowrap px-4 py-3 font-mono text-[13px] text-slate-500 dark:text-slate-400">
                        {formatTime(row.timestamp)}
                      </td>
                      <td className="px-4 py-3">
                        <DetailChips row={row} events="events" />
                      </td>
                      <td className="px-4 py-3">
                        <DetailChips row={row} />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </section>
      </div>
    </main>
  );
}
