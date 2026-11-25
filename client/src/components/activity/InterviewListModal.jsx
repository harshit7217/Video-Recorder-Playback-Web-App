import { useEffect } from "react";
import { useState } from "react";
import Modal from "react-modal";
import InterviewDetailsModal from "./InterviewDetailsModal";
import { apiUrl } from "../../api";

Modal.setAppElement("#root");

const InterviewListModal = ({ filename, closeFileDetailsModal }) => {
  const [fileEntries, setFileEntries] = useState([]);
  const [entryIds, setEntryIds] = useState([]);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [selectedId, setSelectedId] = useState("");

  useEffect(() => {
    setEntryIds([]);
    setFileEntries([]);
    readDataFile();
  }, [filename]);

  const readDataFile = async () => {
    return await fetch(apiUrl(`/static/${filename}`))
      .then(function (response) {
        return response.text();
      })
      .then(function (data) {
        const result = data
          .split("\n")
          .filter((line) => line.trim())
          .map((entries) => JSON.parse(entries));

        setFileEntries(result);

        const uniqueEntryIds = [
          ...new Set(
            result
              .map((entry) => entry.key)
              .filter((key) => key !== undefined && key !== null && key !== ""),
          ),
        ];

        setEntryIds(uniqueEntryIds);
        return result;
      });
  };

  const openEntryDetailsModal = () => {
    setIsDetailsModalOpen(true);
  };

  const closeEntryDetailsModal = () => {
    setIsDetailsModalOpen(false);
  };

  const handleEntrySelection = (id) => {
    setSelectedId(id);
    openEntryDetailsModal();
  };

  const entryListItems = entryIds.map((id, index) => (
    <li
      onClick={() => handleEntrySelection(id)}
      key={id ?? index}
      className="group flex items-center gap-3 rounded-xl border border-gray-100 bg-white p-3 transition hover:border-blue-200 hover:bg-blue-50/60 cursor-pointer"
    >
      {id}
    </li>
  ));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-3 backdrop-blur-sm sm:p-5">
      <div
        className="flex max-h-[90dvh] w-full max-w-xl flex-col overflow-hidden rounded-2xl border border-white/70 bg-white shadow-2xl sm:rounded-3xl"
        role="dialog"
        aria-modal="true"
        aria-labelledby="file-details-title"
      >
        {/* HEADER */}
        <header className="relative shrink-0 overflow-hidden bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 px-5 py-5 sm:px-6">
          <div className="absolute -right-10 -top-16 h-40 w-40 rounded-full bg-indigo-500/20 blur-3xl" />

          <div className="relative flex items-center justify-between gap-3">
            <div className="flex min-w-0 items-center gap-3">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-white/10 text-indigo-300">
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.7"
                  className="h-6 w-6"
                  aria-hidden="true"
                >
                  <path d="M13 3H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V10Z" />
                  <path d="M13 3v7h7M8 15h8M8 18h5" />
                </svg>
              </div>

              <div className="min-w-0">
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-indigo-300">
                  File information
                </p>
                <h2
                  id="file-details-title"
                  className="mt-1 truncate text-lg font-bold text-white sm:text-xl"
                  title={filename}
                >
                  {filename}
                </h2>
                <p className="mt-0.5 text-xs text-slate-400">
                  Review all associated IDs
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={closeFileDetailsModal}
              aria-label="Close modal"
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-slate-300 transition hover:bg-white/10 hover:text-white focus:outline-none focus:ring-2 focus:ring-white/60"
            >
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                className="h-5 w-5"
                aria-hidden="true"
              >
                <path d="m6 6 12 12M18 6 6 18" />
              </svg>
            </button>
          </div>
        </header>

        {/* CONTENT */}
        <main className="min-h-0 flex-1 overflow-y-auto bg-slate-50/70 p-4 sm:p-6">
          {/* SUMMARY */}
          <div className="mb-5 flex items-center justify-between gap-3 rounded-2xl border border-indigo-100 bg-white p-4 shadow-sm">
            <div className="flex min-w-0 items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.7"
                  className="h-5 w-5"
                  aria-hidden="true"
                >
                  <path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01" />
                </svg>
              </div>

              <div>
                <p className="text-xs font-semibold text-slate-500">
                  Available IDs
                </p>
                <p className="mt-0.5 text-sm font-bold text-slate-900">
                  File entries
                </p>
              </div>
            </div>

            <div className="shrink-0 rounded-xl bg-indigo-50 px-3 py-2 text-center">
              <p className="text-xl font-bold tabular-nums text-indigo-700">
                {entryIds.length}
              </p>
              <p className="text-[9px] font-bold uppercase tracking-wider text-indigo-500">
                Total IDs
              </p>
            </div>
          </div>

          {/* LIST HEADER */}
          <div className="mb-3 flex items-center justify-between gap-2">
            <h3 className="text-sm font-bold text-slate-800">ID list</h3>

            <span className="text-[11px] text-slate-400">
              {entryIds.length === 1 ? "1 entry" : `${entryIds.length} entries`}
            </span>
          </div>

          {/* ID LIST */}
          {entryIds.length > 0 ? (
            <ul className="max-h-[45dvh] space-y-2 overflow-y-auto overscroll-contain pr-1 sm:max-h-80">
              {entryListItems}
            </ul>
          ) : (
            <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-white px-4 py-12 text-center">
              <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  className="h-7 w-7"
                  aria-hidden="true"
                >
                  <path d="M13 3H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V10Z" />
                  <path d="M13 3v7h7M9 15h6" />
                  <path d="m9 18 6-6" />
                </svg>
              </div>

              <h3 className="text-sm font-bold text-slate-800">No IDs found</h3>
              <p className="mt-1 max-w-xs text-xs leading-5 text-slate-500">
                There are currently no IDs associated with this file.
              </p>
            </div>
          )}
        </main>

        {/* FOOTER */}
        <footer className="shrink-0 border-t border-slate-200 bg-white px-4 py-3 sm:px-6 sm:py-4">
          <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={closeFileDetailsModal}
              className="w-full rounded-xl border border-slate-200 bg-white px-6 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 sm:w-auto"
            >
              Close
            </button>
          </div>
        </footer>
      </div>

      {/* NESTED DETAILS MODAL */}
      <Modal
        isOpen={isDetailsModalOpen}
        onRequestClose={closeEntryDetailsModal}
      >
        <InterviewDetailsModal
          selectedActivityDetails={fileEntries}
          selectedId={selectedId}
          closeEntryDetailsModal={closeEntryDetailsModal}
        />
      </Modal>
    </div>
  );
};

export default InterviewListModal;
