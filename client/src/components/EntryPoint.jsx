import { useState } from "react";
import Candidate from "./candidate/Candidate.jsx";
import Employer from "./employer/Employer";

const EntryPoint = () => {
  const [isCandidate, setIsCandidate] = useState(true);
  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="mx-auto max-w-5xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-slate-900">Welcome aboard</h1>
          <p className="mt-2 text-sm text-slate-500">
            Choose your role to continue with your workspace.
          </p>
        </div>

        {/* Role Selector */}
        <div className="mb-8 flex justify-center">
          <div className="inline-flex rounded-2xl bg-slate-200/70 p-1.5">
            <button
              onClick={() => setIsCandidate(true)}
              className={`flex items-center gap-2 rounded-xl px-7 py-3 text-sm font-semibold transition-all duration-300 ${
                isCandidate
                  ? "bg-white text-indigo-600 shadow-md"
                  : "text-slate-500 hover:text-slate-800"
              }`}
            >
              <span>👤</span>
              Candidate
            </button>

            <button
              onClick={() => setIsCandidate(false)}
              className={`flex items-center gap-2 rounded-xl px-7 py-3 text-sm font-semibold transition-all duration-300 ${
                !isCandidate
                  ? "bg-white text-indigo-600 shadow-md"
                  : "text-slate-500 hover:text-slate-800"
              }`}
            >
              <span>🏢</span>
              Interviewer
            </button>
          </div>
        </div>

        {/* Content */}
        <div
          key={isCandidate ? "candidate" : "interviewer"}
          className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition-all duration-300 sm:p-10"
        >
          {isCandidate ? <Candidate /> : <Employer />}
        </div>
      </div>
    </div>
  );
};

export default EntryPoint;
