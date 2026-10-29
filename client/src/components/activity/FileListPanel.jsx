import { useEffect } from "react";
import { socket } from "../../socket";
import { useState } from "react";
import Modal from "react-modal";
import InterviewRecordsList from "./InterviewListModal";

Modal.setAppElement("#root");

const FileListPanel = () => {
  const [recordedFiles, setRecordedFiles] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedFileName, setSelectedFileName] = useState("");

  useEffect(() => {
    const handleAvailableFiles = (receivedFileNames) => {
      setRecordedFiles(receivedFileNames.reverse());
    };

    socket.emit("requestFiles");
    socket.on("filesList", handleAvailableFiles);
    return () => {
      socket.off("filesList", handleAvailableFiles);
    };
  }, []);

  const openFileDetailsModal = () => {
    setIsModalOpen(true);
  };

  const closeFileDetailsModal = () => {
    setIsModalOpen(false);
  };

  const handleFileSelect = (fileName) => {
    setSelectedFileName(fileName);
    openFileDetailsModal();
  };

  const fileListEntries = recordedFiles.map((fileName) => (
    <li
      key={fileName}
      className="flex items-center gap-3 px-4 py-3 sm:px-6
             transition-colors hover:bg-blue-50 cursor-pointer"
      onClick={() => handleFileSelect(fileName)}
    >
      <div
        className="flex h-10 w-10 shrink-0 items-center justify-center
                  rounded-lg bg-blue-100 text-blue-600"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={1.5}
          stroke="currentColor"
          className="h-5 w-5"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M19.5 14.25v-8.625A2.625 2.625 0 0016.875 3h-9.75A2.625 2.625 0 004.5 5.625v12.75A2.625 2.625 0 007.125 21h6.75M15 3.75v4.5h4.5M15 18h6m-3-3v6"
          />
        </svg>
      </div>

      <span
        className="min-w-0 flex-1 break-words text-sm font-medium
                   text-gray-700 sm:text-base"
      >
        {fileName}
      </span>
    </li>
  ));

  return (
    <div className="w-full max-w-4xl mx-auto p-4 sm:p-6">
      <div className="rounded-2xl border border-gray-200 bg-white shadow-sm overflow-hidden">
        <div className="border-b border-gray-200 bg-gray-50 px-4 py-3 sm:px-6">
          <h2 className="text-lg font-semibold text-gray-800">Files</h2>
          <p className="text-sm text-gray-500">Your available files</p>
        </div>

        <ul className="divide-y divide-gray-100">{fileListEntries}</ul>
      </div>
      <Modal isOpen={isModalOpen} onRequestClose={closeFileDetailsModal}>
        <InterviewRecordsList
          filename={selectedFileName}
          closeFileDetailsModal={closeFileDetailsModal}
        />
      </Modal>
    </div>
  );
};

export default FileListPanel;
