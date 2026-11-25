import { useState } from "react";
import { useNavigate } from "react-router";
import { apiUrl, readApiResponse } from "../../api";

const Register = ({ setCandidate }) => {
  const [registrationError, setRegistrationError] = useState("");
  const navigate = useNavigate();

  const handleRegistration = async (event) => {
    event.preventDefault();
    const username = event.target.email.value;
    const password = event.target.password.value;

    try {
      const response = await fetch(apiUrl("/api/candidates/register"), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, password }),
      });
      const result = await readApiResponse(response, "Registration failed");

      if (typeof setCandidate === "function") {
        setCandidate(result);
        localStorage.setItem("candidate", JSON.stringify(result));
      }

      navigate("/api/candidate/circle");
    } catch (error) {
      setRegistrationError(error.message);
    }
  };

  return (
    <div
      className="
  flex min-h-screen w-full
  items-center justify-center
  bg-[#F4F6FC] p-3
  dark:bg-slate-950
  sm:p-6
"
    >
      {/* Registration Card */}
      <div
        className="
    relative w-full max-w-md min-w-0
    max-h-[calc(100dvh-1.5rem)]
    overflow-y-auto
    rounded-2xl border border-slate-200/80
    bg-white
    shadow-[0_20px_60px_-20px_rgba(30,41,59,0.18)]
    dark:border-slate-700 dark:bg-slate-800
    sm:max-h-[calc(100dvh-3rem)]
    sm:rounded-3xl
  "
      >
        {/* Gradient Header */}
        <div
          className="
      relative overflow-hidden
      bg-gradient-to-br from-indigo-600 via-indigo-700 to-violet-800
      px-6 py-7 text-white
      sm:px-8 sm:py-9
    "
        >
          {/* Background Decorations */}
          <div className="pointer-events-none absolute -right-12 -top-16 h-44 w-44 rounded-full border border-white/10" />
          <div className="pointer-events-none absolute -right-5 -top-9 h-28 w-28 rounded-full border border-white/10" />
          <div className="pointer-events-none absolute -bottom-20 -left-10 h-36 w-36 rounded-full bg-white/5 blur-xl" />

          <div className="relative z-10">
            {/* Registration Icon */}
            <div
              className="
          mb-5 flex h-12 w-12 items-center justify-center
          rounded-xl border border-white/20
          bg-white/15 shadow-lg backdrop-blur-sm
        "
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="25"
                height="25"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M16 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                <circle cx="10" cy="7" r="4" />
                <path d="M19 8v6m-3-3h6" />
              </svg>
            </div>

            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-indigo-200 sm:text-xs">
              Candidate Portal
            </p>

            <h2 className="mt-2 text-2xl font-bold tracking-tight sm:text-3xl">
              Create Your Account
            </h2>

            <p className="mt-2 max-w-xs text-xs leading-6 text-indigo-100 sm:text-sm">
              Join our platform and take the next step toward exciting career
              opportunities.
            </p>
          </div>
        </div>

        {/* Form Section */}
        <div className="p-5 sm:p-8">
          {/* Form Heading */}
          <div className="mb-6">
            <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100 sm:text-2xl">
              Candidate Registration
            </h3>

            <p className="mt-1 text-xs leading-5 text-slate-500 dark:text-slate-400 sm:text-sm">
              Fill in your details to create your account.
            </p>
          </div>

          {/* Registration Error */}
          {registrationError !== "" && (
            <div
              role="alert"
              className="
            mb-5 flex items-start gap-3
            rounded-xl border border-red-200
            bg-red-50 p-3.5
            text-sm text-red-700
            dark:border-red-900/50
            dark:bg-red-950/30
            dark:text-red-300
          "
            >
              <svg
                className="mt-0.5 h-5 w-5 shrink-0"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <circle cx="12" cy="12" r="10" />
                <path d="M12 8v4m0 4h.01" />
              </svg>

              <span className="break-words">{registrationError}</span>
            </div>
          )}

          {/* Registration Form */}
          <form onSubmit={handleRegistration} className="w-full space-y-5">
            {/* Email Field */}
            <div className="space-y-2">
              <label
                htmlFor="email"
                className="block text-sm font-semibold text-slate-700 dark:text-slate-200"
              >
                Email Address
              </label>

              <div className="relative">
                <svg
                  className="absolute left-3.5 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                >
                  <rect x="3" y="5" width="18" height="14" rx="2" />
                  <path d="m3 7 9 6 9-6" />
                </svg>

                <input
                  type="email"
                  id="email"
                  name="email"
                  autoComplete="email"
                  placeholder="Enter your email"
                  required
                  className="
                block w-full min-w-0
                rounded-xl border border-slate-200
                bg-slate-50 py-3 pl-11 pr-4
                text-sm text-slate-900
                placeholder:text-slate-400
                outline-none transition-all duration-200
                hover:border-slate-300
                focus:border-indigo-500
                focus:bg-white
                focus:ring-4 focus:ring-indigo-500/10
                dark:border-slate-600
                dark:bg-slate-900
                dark:text-white
                dark:focus:bg-slate-900
              "
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="space-y-2">
              <label
                htmlFor="password"
                className="block text-sm font-semibold text-slate-700 dark:text-slate-200"
              >
                Password
              </label>

              <div className="relative">
                <svg
                  className="absolute left-3.5 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                >
                  <rect x="4" y="10" width="16" height="11" rx="2" />
                  <path d="M8 10V7a4 4 0 0 1 8 0v3" />
                </svg>

                <input
                  type="password"
                  id="password"
                  name="password"
                  autoComplete="new-password"
                  placeholder="At least 8 characters"
                  minLength={8}
                  required
                  className="
                block w-full min-w-0
                rounded-xl border border-slate-200
                bg-slate-50 py-3 pl-11 pr-4
                text-sm text-slate-900
                placeholder:text-slate-400
                outline-none transition-all duration-200
                hover:border-slate-300
                focus:border-indigo-500
                focus:bg-white
                focus:ring-4 focus:ring-indigo-500/10
                dark:border-slate-600
                dark:bg-slate-900
                dark:text-white
                dark:focus:bg-slate-900
              "
                />
              </div>

              <p className="text-[11px] text-slate-400">
                Use at least 8 characters for your password.
              </p>
            </div>

            {/* Register Button */}
            <button
              type="submit"
              className="
            group flex w-full items-center justify-center gap-2
            rounded-xl bg-gradient-to-r
            from-indigo-600 to-violet-600
            px-4 py-3.5
            text-sm font-bold text-white
            shadow-lg shadow-indigo-200/60
            transition-all duration-300
            hover:-translate-y-0.5
            hover:from-indigo-700 hover:to-violet-700
            hover:shadow-indigo-300/60
            active:translate-y-0
            focus:outline-none focus:ring-4 focus:ring-indigo-500/20
            dark:shadow-none
          "
            >
              Create Account
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
          </form>

          {/* Footer */}
          <div className="mt-6 border-t border-slate-100 pt-5 dark:border-slate-700">
            <p className="text-center text-[11px] leading-5 text-slate-400 sm:text-xs">
              Secure Candidate Registration
              <span className="mx-2">•</span>© {new Date().getFullYear()} All
              rights reserved.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
