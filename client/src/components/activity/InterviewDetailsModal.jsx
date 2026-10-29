import { useEffect } from "react";
import { socket } from "../../socket";
import { useState } from "react";

const InterviewDetailsModal = ({ selectedId, closeEntryDetailsModal }) => {
  const [selectedActivityDetails, setSelectedActivityDetails] = useState([]);

  useEffect(() => {
    const updateActivityDetails = (data) => {
      setSelectedActivityDetails(data);
    };

    socket.emit("requestFileData", selectedId);
    socket.on("fileData", updateActivityDetails);

    return () => {
      socket.off("requestFileData", selectedId);
      socket.off("fileData", updateActivityDetails);
    };
  }, [selectedId]);

  const activityDetailCards = selectedActivityDetails.map((detail, index) => (
    <div
      key={detail.id ?? `${detail.eventName}-${detail.timestamp}-${index}`}
      className="group rounded-xl border border-gray-200 bg-white p-5 transition duration-200 hover:border-indigo-300 hover:shadow-md"
    >
      <div className="flex items-center gap-4">
        {/* Event icon */}
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            className="h-5 w-5"
          >
            <circle cx="12" cy="12" r="9" />
            <path d="M12 7v5l3 2" />
          </svg>
        </div>

        {/* Event information */}
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h4 className="font-semibold text-gray-900">{detail.eventName}</h4>
            <span className="rounded-full bg-indigo-50 px-3 py-1 text-xs font-medium text-indigo-700">
              Activity {index + 1}
            </span>
          </div>

          <p className="mt-2 text-sm leading-6 text-gray-600">
            {detail.reason || "No reason provided"}
          </p>

          <div className="mt-4 flex items-center gap-2 border-t border-gray-100 pt-3 text-xs text-gray-500">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              className="h-4 w-4"
            >
              <rect x="3" y="5" width="18" height="16" rx="2" />
              <path d="M16 3v4M8 3v4M3 10h18" />
            </svg>
            <span>{detail.timestamp}</span>
          </div>
        </div>
      </div>
    </div>
  ));
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
      <div className="w-full max-w-2xl overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-200 bg-gray-50 px-6 py-5">
          <div>
            <h3 className="text-xl font-bold text-gray-900">Event Details</h3>
            <p className="mt-1 text-sm text-gray-500">
              Selected ID:{" "}
              <span className="font-semibold text-indigo-600">
                {selectedId}
              </span>
            </p>
          </div>

          <button
            onClick={closeEntryDetailsModal}
            aria-label="Close details"
            className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-full text-gray-500 transition hover:bg-red-50 hover:text-red-600"
          >
            <span className="text-xl">&times;</span>
          </button>
        </div>

        {/* Content */}
        <div className="max-h-[65vh] overflow-y-auto p-6">
          {selectedActivityDetails.length > 0 ? (
            <div className="space-y-4">{activityDetailCards}</div>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-gray-100 text-gray-400">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  className="h-7 w-7"
                >
                  <circle cx="12" cy="12" r="9" />
                  <path d="M12 8v4m0 4h.01" />
                </svg>
              </div>
              <h4 className="font-semibold text-gray-900">No events found</h4>
              <p className="mt-1 text-sm text-gray-500">
                There are no details available for this ID.
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between border-t border-gray-200 bg-gray-50 px-6 py-4">
          <span className="text-sm text-gray-500">
            {selectedActivityDetails.length}{" "}
            {selectedActivityDetails.length === 1 ? "activity" : "activity"}{" "}
            found
          </span>

          <button
            onClick={closeEntryDetailsModal}
            className="cursor-pointer rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default InterviewDetailsModal;
