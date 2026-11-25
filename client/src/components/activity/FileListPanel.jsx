import { useEffect } from "react";
import { socket } from "../../socket";
import { useState } from "react";
import Modal from "react-modal";
import InterviewRecordsList from "./InterviewListModal";
import React from "react";

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
      onClick={() => handleFileSelect(fileName)}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          handleFileSelect(fileName);
        }
      }}
      role="button"
      tabIndex={0}
      aria-label={`View details for ${fileName}`}
      className="group relative flex cursor-pointer items-center gap-3 overflow-hidden rounded-xl border border-slate-200 bg-white p-3 transition-all duration-200 hover:border-indigo-200 hover:bg-indigo-50/40 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 sm:gap-4 sm:p-4"
    >
      {/* Hover accent */}
      <div className="absolute inset-y-0 left-0 w-1 scale-y-0 rounded-r-full bg-indigo-500 transition-transform duration-200 group-hover:scale-y-100" />

      {/* File Icon */}
      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 ring-1 ring-indigo-100 transition-all duration-200 group-hover:bg-indigo-100 group-hover:scale-105 sm:h-12 sm:w-12">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={1.6}
          stroke="currentColor"
          className="h-5 w-5 sm:h-6 sm:w-6"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M19.5 14.25v-8.625A2.625 2.625 0 0016.875 3h-9.75A2.625 2.625 0 004.5 5.625v12.75A2.625 2.625 0 007.125 21h6.75M15 3.75v4.5h4.5M15 18h6m-3-3v6"
          />
        </svg>
      </div>

      {/* File Information */}
      <div className="min-w-0 flex-1">
        <p className="break-all text-sm font-semibold leading-5 text-slate-800 transition-colors group-hover:text-indigo-700 sm:text-base">
          {fileName}
        </p>

        <p className="mt-1 text-[10px] font-medium uppercase tracking-wider text-slate-400">
          File record
        </p>
      </div>

      {/* Action Indicator */}
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-slate-400 transition-all duration-200 group-hover:translate-x-0.5 group-hover:bg-indigo-100 group-hover:text-indigo-600">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={1.8}
          stroke="currentColor"
          className="h-5 w-5"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M9 5.25 15.75 12 9 18.75"
          />
        </svg>
      </div>
    </li>
  ));

  return (
    <div className="mx-auto w-full max-w-5xl p-3 sm:p-5 lg:p-6">
      {/* MAIN CONTAINER */}
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm sm:rounded-3xl">
        {/* HEADER */}
        <div className="relative overflow-hidden bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 px-5 py-5 sm:px-6 sm:py-6">
          <div className="absolute -right-12 -top-16 h-40 w-40 rounded-full bg-indigo-500/20 blur-3xl" />

          <div className="relative flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-white/10 text-indigo-300">
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

              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-indigo-300">
                  File Management
                </p>
                <h2 className="mt-1 text-xl font-bold text-white sm:text-2xl">
                  Your Files
                </h2>
                <p className="mt-1 text-xs text-slate-400">
                  Browse and view your available interview records
                </p>
              </div>
            </div>

            {/* FILE COUNT */}
            <div className="flex w-fit items-center gap-2 rounded-xl border border-white/10 bg-white/[0.07] px-4 py-2.5">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.7"
                className="h-4 w-4 text-indigo-300"
                aria-hidden="true"
              >
                <path d="M4 6h16M4 12h16M4 18h16" />
              </svg>

              <span className="text-xs font-semibold text-white">
                {React.Children.count(fileListEntries)} Files
              </span>
            </div>
          </div>
        </div>

        {/* FILE LIST CONTENT */}
        <div className="bg-slate-50/70 p-3 sm:p-5">
          <div className="mb-4 flex items-center justify-between gap-3">
            <div>
              <h3 className="text-sm font-bold text-slate-800">
                Available Files
              </h3>
              <p className="mt-0.5 text-xs text-slate-500">
                Select a file to view its associated IDs
              </p>
            </div>

            <span className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-[10px] font-semibold text-slate-500">
              File Library
            </span>
          </div>

          {/* LIST */}
          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            {fileListEntries ? (
              <ul className="divide-y divide-slate-100">{fileListEntries}</ul>
            ) : (
              <div className="flex flex-col items-center justify-center px-4 py-14 text-center">
                <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.7"
                    className="h-7 w-7"
                    aria-hidden="true"
                  >
                    <path d="M13 3H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V10Z" />
                    <path d="M13 3v7h7" />
                  </svg>
                </div>

                <h3 className="text-sm font-bold text-slate-800">
                  No files available
                </h3>
                <p className="mt-1 text-xs text-slate-500">
                  Your available files will appear here.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* FOOTER */}
        <div className="flex flex-col gap-1 border-t border-slate-100 bg-white px-5 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <p className="text-[11px] text-slate-500">
            Select any file to explore its interview records.
          </p>

          <p className="text-[10px] font-medium text-slate-400">File Library</p>
        </div>
      </div>

      {/* FILE DETAILS MODAL */}
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
