import EmployerLogin from "./EmployerLogin.jsx";
import EmployerRegister from "./EmployerRegister.jsx";
import { useNavigate } from "react-router";
import { useState, useEffect } from "react";

const Employer = () => {
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState(false);
  const [employer, setEmployer] = useState(() => {
    try {
      const savedEmployer = localStorage.getItem("employer");
      return savedEmployer ? JSON.parse(savedEmployer) : null;
    } catch (error) {
      console.error("Error reading saved employer:", error);
      return null;
    }
  });

  useEffect(() => {
    if (employer) {
      localStorage.setItem("employer", JSON.stringify(employer));
      return;
    }

    localStorage.removeItem("employer");
  }, [employer]);

  const handleLoginSuccess = (loggedInEmployer) => {
    setEmployer(loggedInEmployer);
    localStorage.setItem("employer", JSON.stringify(loggedInEmployer));
    navigate("/api/interviewer/circle");
  };

  return (
    <div
      className="
  flex min-h-screen w-full
  items-center justify-center
  bg-[#F4F6FC] px-3 py-5
  dark:bg-slate-950
  sm:px-6 sm:py-8
"
    >
      {/* Main Authentication Card */}
      <div
        className="
    mx-auto grid w-full max-w-5xl min-w-0
    grid-cols-1 md:grid-cols-2
    overflow-hidden
    rounded-2xl sm:rounded-3xl
    bg-white
    shadow-[0_20px_70px_-25px_rgba(30,41,59,0.18)]
    dark:bg-slate-800
  "
      >
        {/* LEFT SIDE - Authentication Form */}
        <div
          className="
      flex min-w-0 flex-col justify-center
      p-5 sm:p-8 md:p-7 lg:p-10 xl:p-12
    "
        >
          {/* Brand Header */}
          <div className="mb-6 sm:mb-8">
            <div
              className="
          mb-5 flex h-11 w-11 items-center justify-center
          rounded-xl bg-indigo-600 text-white
          shadow-lg shadow-indigo-200
          dark:shadow-none
          sm:mb-7
        "
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <rect x="3" y="7" width="18" height="13" rx="2" />
                <path d="M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                <path d="M3 12h18" />
                <path d="M10 12v2h4v-2" />
              </svg>
            </div>

            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-indigo-600 sm:text-xs">
              Employer Workspace
            </p>

            <h1 className="mt-2 text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100 sm:text-3xl">
              {isLogin ? "Welcome back!" : "Join as Employer"}
            </h1>

            <p className="mt-2 max-w-sm text-xs leading-6 text-slate-500 dark:text-slate-400 sm:text-sm">
              {isLogin
                ? "Sign in to manage your hiring workspace."
                : "Create an account to connect with qualified candidates."}
            </p>
          </div>

          {/* Dynamic Authentication Form */}
          <div className="w-full min-w-0">
            {isLogin ? (
              <EmployerLogin onLogin={handleLoginSuccess} />
            ) : (
              <EmployerRegister setEmployer={setEmployer} />
            )}
          </div>

          {/* Footer */}
          <div className="mt-6 pt-5 sm:mt-8">
            <p className="text-center text-[10px] leading-5 text-slate-400 sm:text-xs">
              Secure Employer Portal
              <span className="mx-2">•</span>© {new Date().getFullYear()} All
              rights reserved.
            </p>
          </div>
        </div>

        {/* RIGHT SIDE - Welcome Panel */}
        <div
          className="
      relative flex min-w-0 flex-col justify-between
      overflow-hidden
      bg-gradient-to-br from-indigo-700 via-indigo-700 to-violet-900
      p-6 text-white
      sm:p-9 md:p-7 lg:p-10 xl:p-12
    "
        >
          {/* Decorative Background */}
          <div
            className="
        pointer-events-none absolute
        -right-24 -top-24
        h-80 w-80 rounded-full

      "
          />

          <div
            className="
        pointer-events-none absolute
        -right-12 -top-12
        h-56 w-56 rounded-full

      "
          />

          <div
            className="
        pointer-events-none absolute
        -bottom-32 -left-20
        h-72 w-72 rounded-full
        bg-violet-400/10 blur-2xl
      "
          />

          {/* Welcome Content */}
          <div className="relative z-10">
            {/* Badge */}
            <div
              className="
          inline-flex items-center gap-2
          rounded-full
          bg-white/10 px-3 py-1.5
          text-[9px] font-semibold uppercase
          tracking-widest text-indigo-100
          backdrop-blur-sm sm:text-[10px]
        "
            >
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
              Employer Portal
            </div>

            {/* Heading */}
            <h2
              className="
          mt-8 text-3xl font-bold
          leading-tight tracking-tight
          sm:mt-10 sm:text-4xl
        "
            >
              Build your
              <br />
              dream team<span className="text-indigo-300">.</span>
            </h2>

            {/* Description */}
            <p
              className="
          mt-5 max-w-sm
          text-xs leading-6
          text-indigo-100/90
          sm:text-sm sm:leading-7
        "
            >
              Discover candidates, organize applications, and keep your hiring
              process moving in one workspace.
            </p>

            {/* Feature Highlights */}
            <div className="mt-7 space-y-4 sm:mt-10 sm:space-y-5">
              {/* Feature 1 */}
              <div className="flex items-center gap-3">
                <div
                  className="
              flex h-9 w-9 shrink-0
              items-center justify-center
              rounded-xl bg-white/10
            "
                >
                  <svg
                    className="h-4 w-4"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <circle cx="9" cy="7" r="4" />
                    <path d="M3 21v-2a6 6 0 0 1 12 0v2" />
                    <path d="M16 11a4 4 0 0 0 0-8" />
                    <path d="M21 21v-2a6 6 0 0 0-4-5.65" />
                  </svg>
                </div>

                <span className="text-xs text-indigo-50 sm:text-sm">
                  Discover talented candidates
                </span>
              </div>

              {/* Feature 2 */}
              <div className="flex items-center gap-3">
                <div
                  className="
              flex h-9 w-9 shrink-0
              items-center justify-center
              rounded-xl bg-white/10
            "
                >
                  <svg
                    className="h-4 w-4"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <rect x="3" y="7" width="18" height="13" rx="2" />
                    <path d="M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                    <path d="M3 12h18" />
                  </svg>
                </div>

                <span className="text-xs text-indigo-50 sm:text-sm">
                  Manage your hiring workflow
                </span>
              </div>

              {/* Feature 3 */}
              <div className="flex items-center gap-3">
                <div
                  className="
              flex h-9 w-9 shrink-0
              items-center justify-center
              rounded-xl bg-white/10
            "
                >
                  <svg
                    className="h-4 w-4"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path d="M12 22s8-4 8-11V5l-8-3-8 3v6c0 7 8 11 8 11z" />
                    <path d="m9 12 2 2 4-4" />
                  </svg>
                </div>

                <span className="text-xs text-indigo-50 sm:text-sm">
                  Secure and reliable workspace
                </span>
              </div>
            </div>
          </div>

          {/* Bottom Toggle Section */}
          <div
            className="
        relative z-10 mt-9
        pt-6 sm:mt-12 sm:pt-7
      "
          >
            <p className="text-xs text-indigo-100 sm:text-sm">
              {isLogin
                ? "New to our hiring platform?"
                : "Already have an employer account?"}
            </p>

            <button
              type="button"
              onClick={() => setIsLogin(!isLogin)}
              className="
            group mt-4 flex min-h-11 w-full
            items-center justify-center gap-3
            rounded-xl
            bg-white px-5 py-3.5
            text-xs font-bold text-indigo-700
            shadow-lg shadow-indigo-950/10
            transition-all duration-300
            hover:-translate-y-0.5
            hover:bg-indigo-50 hover:shadow-xl
            focus:outline-none focus:ring-4
            focus:ring-white/20
            sm:text-sm
          "
            >
              {isLogin ? "Create Employer Account" : "Login to Your Account"}

              <svg
                className="
              h-4 w-4
              transition-transform duration-300
              group-hover:translate-x-1
            "
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M5 12h14m-7-7 7 7-7 7" />
              </svg>
            </button>

          </div>
        </div>
      </div>
    </div>
  );
};

export default Employer;
