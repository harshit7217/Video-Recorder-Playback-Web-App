import { useState } from "react";
import { apiUrl, readApiResponse } from "../../api";

const Login = ({ onLogin }) => {
  const [loginError, setLoginError] = useState("");

  const handleLogin = async (event) => {
    event.preventDefault();
    const username = event.target.username.value;
    const password = event.target.password.value;
    setLoginError("");

    try {
      const response = await fetch(apiUrl("/api/candidates/login"), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, password }),
      });

      const data = await readApiResponse(response, "Failed to login candidate");

      if (typeof onLogin === "function") {
        onLogin(data.candidate);
      }
    } catch (error) {
      console.error("Login error:", error);
      setLoginError(error.message || "Login failed. Please try again.");
    }
  };

  return (
    <form onSubmit={handleLogin} className="w-full space-y-5">
      {loginError && (
        <div
          role="alert"
          className="rounded-xl bg-rose-50 px-4 py-3 text-sm text-rose-700"
        >
          {loginError}
        </div>
      )}

      <div className="space-y-2">
        <label
          htmlFor="username"
          className="block text-sm font-semibold text-slate-700"
        >
          Email or username
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
            <circle cx="12" cy="8" r="4" />
            <path d="M5 21a7 7 0 0 1 14 0" />
          </svg>
          <input
            type="text"
            id="username"
            name="username"
            autoComplete="username"
            placeholder="Enter your email or username"
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
            autoComplete="current-password"
            placeholder="Enter your password"
            minLength={8}
            required
            className="w-full rounded-xl border-0 bg-slate-100 py-3.5 pl-12 pr-4 text-sm text-slate-900 outline-none transition focus:bg-white focus:ring-2 focus:ring-indigo-500/30"
          />
        </div>
      </div>

      <button
        type="submit"
        className="group flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 px-4 py-3.5 text-sm font-bold text-white shadow-lg shadow-indigo-200/60 transition hover:-translate-y-0.5 hover:from-indigo-700 hover:to-violet-700 hover:shadow-indigo-300/60 focus:outline-none focus:ring-4 focus:ring-indigo-500/20 active:translate-y-0"
      >
        Sign in
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

export default Login;
