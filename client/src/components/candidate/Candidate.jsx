import Login from "./Login.jsx";
import Register from "./Register.jsx";
import { useNavigate } from "react-router";
import { useState, useEffect } from "react";

const RegisterCandidate = () => {
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState(false);
  const savedCandidate = localStorage.getItem("candidate");

  const [candidate, setCandidate] = useState(() => {
    return savedCandidate ? JSON.parse(savedCandidate) : null;
  });

  useEffect(() => {
    if (candidate !== null) {
      localStorage.setItem("candidate", JSON.stringify(candidate));
    } else {
      localStorage.removeItem("candidate");
    }
  }, [candidate]);

  const handleLoginSuccess = (loggedInCandidate) => {
    setCandidate(loggedInCandidate);
    navigate("/api/candidate/circle");
  };

  return (
    <div className="min-h-screen w-full overflow-x-hidden bg-[#F4F6FC] px-3 py-5 sm:px-6 sm:py-8 lg:flex lg:items-center lg:justify-center">
      {/* Main Authentication Card */}
      <div className="mx-auto grid w-full max-w-5xl grid-cols-1 overflow-hidden rounded-2xl bg-white shadow-[0_20px_70px_-25px_rgba(30,41,59,0.18)] sm:rounded-3xl md:grid-cols-2">
        {/* LEFT SIDE - Authentication Form */}
        <div className="flex min-w-0 flex-col justify-center p-5 sm:p-8 md:p-7 lg:p-10 xl:p-12">
          {/* Brand Header */}
          <div className="mb-6 sm:mb-8">
            <div className="mb-5 flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-600 text-white shadow-lg shadow-indigo-200 sm:mb-7 sm:h-11 sm:w-11">
              {/* Keep your existing brand SVG here */}
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="23"
                height="23"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M16 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                <circle cx="10" cy="7" r="4" />
                <path d="m20 8 2 2-5 5-3-3 2-2 1 1z" />
              </svg>
            </div>

            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-indigo-600 sm:text-xs">
              Your Workspace
            </p>

            <h1 className="mt-2 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
              {isLogin ? "Welcome back!" : "Create account"}
            </h1>

            <p className="mt-2 max-w-sm text-xs leading-6 text-slate-500 sm:text-sm">
              {isLogin
                ? "Sign in to continue to your candidate workspace."
                : "Create an account to find your next opportunity."}
            </p>
          </div>

          {/* Dynamic Form */}
          <div className="w-full min-w-0">
            {isLogin ? (
              <Login onLogin={handleLoginSuccess} />
            ) : (
              <Register setCandidate={setCandidate} />
            )}
          </div>

          {/* Footer */}
          <div className="mt-6 pt-4 sm:mt-8 sm:pt-5">
            <p className="text-center text-[10px] leading-5 text-slate-400 sm:text-xs">
              By continuing, you agree to our{" "}
              <span className="cursor-pointer font-medium text-indigo-600 hover:underline">
                Terms of Service
              </span>{" "}
              and{" "}
              <span className="cursor-pointer font-medium text-indigo-600 hover:underline">
                Privacy Policy
              </span>
              .
            </p>
          </div>
        </div>

        {/* RIGHT SIDE - Welcome Panel */}
        <div className="relative flex min-w-0 flex-col justify-between overflow-hidden bg-gradient-to-br from-indigo-700 via-indigo-700 to-violet-900 p-6 text-white sm:p-9 md:p-7 lg:p-10 xl:p-12">
          {/* Decorative Background */}
          <div className="pointer-events-none absolute -bottom-32 -left-20 h-72 w-72 rounded-full bg-violet-400/10 blur-2xl" />

          {/* Top Content */}
          <div className="relative z-10">
            <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1.5 text-[9px] font-semibold uppercase tracking-widest text-indigo-100 backdrop-blur-sm sm:text-[10px]">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
              Secure Authentication
            </div>

            <h2 className="mt-7 text-2xl font-bold leading-tight tracking-tight sm:mt-10 sm:text-4xl">
              Move your career
              <br />
              forward<span className="text-indigo-300">.</span>
            </h2>

            <p className="mt-4 max-w-sm text-xs leading-6 text-indigo-100/90 sm:mt-5 sm:text-sm sm:leading-7">
              Keep your profile, opportunities, and conversations together in
              one place.
            </p>

            {/* Feature Highlights */}
            <div className="mt-6 space-y-4 sm:mt-10 sm:space-y-5">
              <div className="flex items-center gap-3">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white/10 sm:h-9 sm:w-9">
                  <svg
                    className="h-4 w-4"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path d="m5 12 4 4L19 6" />
                  </svg>
                </div>
                <span className="text-xs text-indigo-50 sm:text-sm">
                  Personalized workspace experience
                </span>
              </div>

              <div className="flex items-center gap-3">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white/10 sm:h-9 sm:w-9">
                  <svg
                    className="h-4 w-4"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <rect x="3" y="11" width="18" height="11" rx="2" />
                    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                  </svg>
                </div>
                <span className="text-xs text-indigo-50 sm:text-sm">
                  Secure and reliable access
                </span>
              </div>

              <div className="flex items-center gap-3">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white/10 sm:h-9 sm:w-9">
                  <svg
                    className="h-4 w-4"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path d="M16 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                    <circle cx="10" cy="7" r="4" />
                    <path d="M20 8v6m-3-3h6" />
                  </svg>
                </div>
                <span className="text-xs text-indigo-50 sm:text-sm">
                  Connect with new opportunities
                </span>
              </div>
            </div>
          </div>

          {/* Bottom Toggle Section */}
          <div className="relative z-10 mt-8 border-t border-white/20 pt-6 sm:mt-12 sm:pt-7">
            <p className="text-xs text-indigo-100 sm:text-sm">
              {isLogin
                ? "Don't have an account yet?"
                : "Already part of our community?"}
            </p>

            <button
              onClick={() => setIsLogin(!isLogin)}
              className="group mt-3 flex min-h-11 w-full items-center justify-center gap-3 rounded-xl bg-white px-4 py-3 text-xs font-bold text-indigo-700 shadow-lg shadow-indigo-950/10 transition-all duration-300 hover:-translate-y-0.5 hover:bg-indigo-50 hover:shadow-xl focus:outline-none focus:ring-4 focus:ring-white/20 sm:mt-4 sm:px-5 sm:text-sm"
            >
              {isLogin ? "Create Your Account" : "Sign In to Your Account"}

              <svg
                className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M5 12h14m-7-7 7 7-7 7" />
              </svg>
            </button>

            <p className="mt-5 text-center text-[10px] text-indigo-200/70 sm:text-[11px]">
              © {new Date().getFullYear()} All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterCandidate;
