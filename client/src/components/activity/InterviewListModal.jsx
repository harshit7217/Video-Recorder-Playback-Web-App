import { useEffect } from "react";
import { socket } from "../../socket";
import { useState } from "react";
import Modal from "react-modal";
import InterviewActivityDetails from "./InterviewDetailsModal";

Modal.setAppElement("#root");

const InterviewListModal = ({ filename, closeFileDetailsModal }) => {
  const [entryIds, setEntryIds] = useState([]);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [selectedId, setSelectedId] = useState("");

  useEffect(() => {
    const handleFileKeys = (keys) => {
      setEntryIds(keys);
    };

    socket.emit("requestFileKeys", filename);
    socket.on("filesKeys", handleFileKeys);

    return () => {
      socket.off("filesKeys", handleFileKeys);
    };
  }, [filename]);

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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
      <div className="w-full max-w-lg overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-100 bg-gray-50 px-5 py-4 sm:px-6">
          <div className="min-w-0">
            <h2 className="truncate text-lg font-semibold text-gray-900 sm:text-xl">
              {filename}
            </h2>
            <p className="mt-1 text-sm text-gray-500">List of IDs</p>
          </div>

          <button
            onClick={closeFileDetailsModal}
            aria-label="Close modal"
            className="ml-4 flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-xl text-gray-500 transition hover:bg-red-50 hover:text-red-600 focus:outline-none focus:ring-2 focus:ring-red-400"
          >
            &times;
          </button>
        </div>

        {/* Content */}
        <div className="p-5 sm:p-6">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="text-sm font-medium text-gray-700">Available IDs</h3>

            <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">
              {entryIds.length} items
            </span>
          </div>

          <ul className="max-h-[50vh] space-y-2 overflow-y-auto pr-1 sm:max-h-80">
            {entryListItems}
          </ul>

          {entryIds.length === 0 && (
            <div className="rounded-xl border border-dashed border-gray-300 px-4 py-10 text-center">
              <p className="text-sm font-medium text-gray-700">No IDs found</p>
              <p className="mt-1 text-xs text-gray-500">
                There are no IDs available for this file.
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-end border-t border-gray-100 bg-gray-50 px-5 py-4 sm:px-6">
          <button
            onClick={closeFileDetailsModal}
            className="w-full rounded-xl bg-gray-900 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-400 sm:w-auto"
          >
            Close
          </button>
        </div>
      </div>
      <Modal
        isOpen={isDetailsModalOpen}
        onRequestClose={closeEntryDetailsModal}
      >
        <InterviewActivityDetails
          selectedId={selectedId}
          closeEntryDetailsModal={closeEntryDetailsModal}
        />
      </Modal>
    </div>
  );
};

export default InterviewListModal;
