import { useState } from "react";
import Candidate from "./candidate/Candidate.jsx";
import Employer from "./employer/Employer";

const EntryPoint = () => {
  const [isCandidate, setIsCandidate] = useState(true);
  return (
    <div className="min-h-screen bg-[#F5F7FC] px-4 py-12 sm:px-8">
      {/* Role Selector */}
      <div className="flex justify-center">
        <button
          onClick={() => setIsCandidate(!isCandidate)}
          className="rounded-xl bg-indigo-600 px-8 py-3 font-semibold text-white shadow-md transition-all duration-300 hover:bg-indigo-700"
        >
          {isCandidate ? "👨‍💻 Candidate" : "🏢 Interviewer"}
        </button>
      </div>

      {/* Dynamic Content */}
      <div
        key={isCandidate ? "candidate" : "interviewer"}
        className="overflow-hidden rounded-3xl bg-white shadow-xl shadow-slate-200/50 animate-in fade-in slide-in-from-bottom-2 duration-300"
      >
        <div>{isCandidate ? <Candidate /> : <Employer />}</div>
      </div>
    </div>
  );
};

export default EntryPoint;
