import { useNavigate } from "react-router";

const CandidateInfo = ({ candidate, setCandidate }) => {
  const navigate = useNavigate();

  if (!candidate) {
    return null;
  }

  const handleLogout = () => {
    setCandidate(null);
    navigate("/register-candidate");
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-100 p-4 dark:bg-slate-900 max-[360px]:p-2 landscape:max-h-[500px]:items-start">
      <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl dark:bg-slate-800 sm:p-8">
        <div className="mb-6 flex items-center justify-between gap-4">
          <div>
            <p className="text-sm font-medium uppercase tracking-[0.2em] text-indigo-600">
              Candidate profile
            </p>
            <h2 className="mt-2 text-3xl font-bold text-slate-900 dark:text-slate-100">
              Welcome, {candidate.username}
            </h2>
          </div>
          <button
            type="button"
            onClick={handleLogout}
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100 dark:border-slate-600 dark:text-slate-200 dark:hover:bg-slate-700"
          >
            Logout
          </button>
        </div>

        <div className="space-y-4">
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-900/60">
            <p className="text-sm text-slate-500 dark:text-slate-400">Username</p>
            <p className="mt-1 text-lg font-semibold text-slate-900 dark:text-slate-100">
              {candidate.username}
            </p>
          </div>

          <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-emerald-700 dark:border-emerald-800 dark:bg-emerald-900/20 dark:text-emerald-300">
            Login successful. Your candidate information page is now open.
          </div>
        </div>
      </div>
    </div>
  );
};

export default CandidateInfo;
