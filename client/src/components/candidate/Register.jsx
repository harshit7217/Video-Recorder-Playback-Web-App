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
    setRegistrationError("");

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
    <form onSubmit={handleRegistration} className="w-full space-y-5">
      {registrationError && (
        <div
          role="alert"
          className="rounded-xl bg-rose-50 px-4 py-3 text-sm text-rose-700"
        >
          {registrationError}
        </div>
      )}

      <div className="space-y-2">
        <label
          htmlFor="email"
          className="block text-sm font-semibold text-slate-700"
        >
          Email address
        </label>
        <div className="relative">
          <svg
            aria-hidden="true"
            className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400"
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
            placeholder="you@example.com"
            required
            className="w-full rounded-xl border-0 bg-slate-100 py-3.5 pl-12 pr-4 text-sm text-slate-900 outline-none transition focus:bg-white focus:ring-2 focus:ring-indigo-500/30"
          />
        </div>
      </div>

      <div className="space-y-2">
        <label
          htmlFor="password"
          className="block text-sm font-semibold text-slate-700"
        >
          Password
        </label>
        <div className="relative">
          <svg
            aria-hidden="true"
            className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400"
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
            className="w-full rounded-xl border-0 bg-slate-100 py-3.5 pl-12 pr-4 text-sm text-slate-900 outline-none transition focus:bg-white focus:ring-2 focus:ring-indigo-500/30"
          />
        </div>
        <p className="text-xs text-slate-500">
          Use at least 8 characters for your password.
        </p>
      </div>

      <button
        type="submit"
        className="group flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 px-4 py-3.5 text-sm font-bold text-white shadow-lg shadow-indigo-200/60 transition hover:-translate-y-0.5 hover:from-indigo-700 hover:to-violet-700 hover:shadow-indigo-300/60 focus:outline-none focus:ring-4 focus:ring-indigo-500/20 active:translate-y-0"
      >
        Create account
        <svg
          aria-hidden="true"
          className="h-4 w-4 transition-transform group-hover:translate-x-1"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <path d="M5 12h14m-7-7 7 7-7 7" />
        </svg>
      </button>
    </form>
  );
};

export default Register;
