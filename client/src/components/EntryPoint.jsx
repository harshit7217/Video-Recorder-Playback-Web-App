import { useState } from "react";
import Candidate from "./candidate/Candidate.jsx";
import Employer from "./employer/Employer";
import { UserRound, Building2, ShieldCheck } from "lucide-react";

const EntryPoint = () => {
  const [isCandidate, setIsCandidate] = useState(true);
  return (
    <div className="min-h-screen bg-[#F5F7FC] px-4 py-12 sm:px-8">
      <div className="mx-auto max-w-5xl">
        {/* Header */}
        <div className="mb-12 text-center">
          <div className="mb-5 inline-flex items-center gap-2 rounded-full bg-indigo-50 px-4 py-2 text-xs font-semibold tracking-wide text-indigo-600">
            <ShieldCheck size={15} />
            YOUR PROFESSIONAL WORKSPACE
          </div>

          <h1 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
            Welcome aboard
          </h1>

          <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-slate-500 sm:text-base">
            Choose how you want to get started. Select your role to access your
            personalized workspace.
          </p>
        </div>

        {/* Role Selector */}
        <div className="mx-auto mb-8 grid max-w-xl grid-cols-2 gap-3">
          <button
            onClick={() => setIsCandidate(true)}
            className={`group flex flex-col items-center gap-3 rounded-2xl border p-5 transition-all duration-300 sm:p-7 ${
              isCandidate
                ? "border-indigo-500 bg-white shadow-lg shadow-indigo-100 ring-2 ring-indigo-500/10"
                : "border-slate-200 bg-white/70 hover:border-indigo-200 hover:bg-white"
            }`}
          >
            <div
              className={`flex h-14 w-14 items-center justify-center rounded-2xl transition-colors ${
                isCandidate
                  ? "bg-indigo-600 text-white"
                  : "bg-slate-100 text-slate-500 group-hover:bg-indigo-50 group-hover:text-indigo-600"
              }`}
            >
              <UserRound size={26} />
            </div>

            <div className="text-center">
              <h3
                className={`font-bold ${
                  isCandidate ? "text-indigo-700" : "text-slate-700"
                }`}
              >
                Candidate
              </h3>
              <p className="mt-1 text-xs text-slate-400">Find opportunities</p>
            </div>

            {isCandidate && (
              <span className="text-xs font-semibold text-indigo-600">
                Selected
              </span>
            )}
          </button>

          <button
            onClick={() => setIsCandidate(false)}
            className={`group flex flex-col items-center gap-3 rounded-2xl border p-5 transition-all duration-300 sm:p-7 ${
              !isCandidate
                ? "border-indigo-500 bg-white shadow-lg shadow-indigo-100 ring-2 ring-indigo-500/10"
                : "border-slate-200 bg-white/70 hover:border-indigo-200 hover:bg-white"
            }`}
          >
            <div
              className={`flex h-14 w-14 items-center justify-center rounded-2xl transition-colors ${
                !isCandidate
                  ? "bg-indigo-600 text-white"
                  : "bg-slate-100 text-slate-500 group-hover:bg-indigo-50 group-hover:text-indigo-600"
              }`}
            >
              <Building2 size={26} />
            </div>

            <div className="text-center">
              <h3
                className={`font-bold ${
                  !isCandidate ? "text-indigo-700" : "text-slate-700"
                }`}
              >
                Interviewer
              </h3>
              <p className="mt-1 text-xs text-slate-400">Hire great talent</p>
            </div>

            {!isCandidate && (
              <span className="text-xs font-semibold text-indigo-600">
                Selected
              </span>
            )}
          </button>
        </div>

        {/* Dynamic Content */}
        <div
          key={isCandidate ? "candidate" : "interviewer"}
          className="overflow-hidden rounded-3xl bg-white shadow-xl shadow-slate-200/50 animate-in fade-in slide-in-from-bottom-2 duration-300"
        >
          <div className="px-6 py-5 sm:px-10">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-widest text-indigo-500">
                  {isCandidate ? "Candidate Portal" : "Interviewer Portal"}
                </p>
                <h2 className="mt-2 text-xl font-bold text-slate-900">
                  {isCandidate
                    ? "Your career starts here."
                    : "Build your dream team."}
                </h2>
                <p className="mt-1 text-sm text-slate-500">
                  {isCandidate
                    ? "Explore opportunities and showcase your potential."
                    : "Discover talent and streamline your hiring process."}
                </p>
              </div>

              <div className="hidden h-12 w-12 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 sm:flex">
                {isCandidate ? (
                  <UserRound size={23} />
                ) : (
                  <Building2 size={23} />
                )}
              </div>
            </div>
          </div>

          <div className="p-6 sm:p-10">
            {isCandidate ? <Candidate /> : <Employer />}
          </div>
        </div>

        {/* Footer */}
        <p className="mt-8 text-center text-xs text-slate-400">
          Secure access · Personalized experience · Built for professionals
        </p>
      </div>
    </div>
  );
};

export default EntryPoint;
