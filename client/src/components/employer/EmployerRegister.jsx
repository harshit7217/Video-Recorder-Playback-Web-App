import { useState } from "react";
import { useNavigate } from "react-router";

const EmployerRegister = ({ setEmployer }) => {
  const [registrationError, setRegistrationError] = useState("");
  const navigate = useNavigate();

  const handleRegistration = async (event) => {
    event.preventDefault();

    const username = event.target.email.value;
    const password = event.target.password.value;

    try {
      const response = await fetch("/api/employers/register-employer", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, password }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Registration failed");
      }

      if (typeof setEmployer === "function") {
        const savedEmployer = result?.employer ?? result;
        setEmployer(savedEmployer);
        localStorage.setItem("employer", JSON.stringify(savedEmployer));
      }

      navigate("/api/interviewer/employment");
    } catch (error) {
      setRegistrationError(error.message);
    }
  };

  return (
    <div className="flex max-h-[95vh] items-center justify-center bg-slate-100 p-4 dark:bg-slate-900 max-[360px]:p-2 landscape:max-h-[400px]:items-start">
      <div className="w-full max-w-sm max-h-[75vh] rounded-2xl bg-white p-5 shadow-xl sm:max-w-md sm:p-8 md:max-w-lg md:p-10 dark:bg-slate-800">
        <h2 className="text-2xl font-bold text-slate-900 sm:text-3xl dark:text-slate-100">
          Employer Registration
        </h2>
        <p className="mb-6 mt-1 text-sm text-slate-500 sm:text-base dark:text-slate-400">
          Create your employer account to start hiring.
        </p>

        {registrationError !== "" && (
          <p className="mb-4 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600">
            {registrationError}
          </p>
        )}

        <form onSubmit={handleRegistration} className="space-y-5">
          <div className="flex flex-col gap-1.5">
            <label
              htmlFor="email"
              className="text-sm font-semibold text-slate-700 dark:text-slate-200"
            >
              Email
            </label>
            <input
              type="email"
              id="email"
              name="email"
              autoComplete="email"
              placeholder="Enter your email"
              required
              className="w-full rounded-lg border border-slate-300 bg-white px-3.5 py-3 text-base text-slate-900 placeholder-slate-400 transition focus:border-indigo-600 focus:outline-none focus:ring-4 focus:ring-indigo-600/25 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label
              htmlFor="password"
              className="text-sm font-semibold text-slate-700 dark:text-slate-200"
            >
              Password
            </label>
            <input
              type="password"
              id="password"
              name="password"
              autoComplete="new-password"
              placeholder="At least 8 characters"
              minLength={8}
              required
              className="w-full rounded-lg border border-slate-300 bg-white px-3.5 py-3 text-base text-slate-900 placeholder-slate-400 transition focus:border-indigo-600 focus:outline-none focus:ring-4 focus:ring-indigo-600/25 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100"
            />
          </div>

          <button
            type="submit"
            className="w-full rounded-lg bg-indigo-600 py-3 text-base font-semibold text-white transition hover:bg-indigo-700 active:scale-[0.99]"
          >
            Register
          </button>
        </form>
      </div>
    </div>
  );
};

export default EmployerRegister;
