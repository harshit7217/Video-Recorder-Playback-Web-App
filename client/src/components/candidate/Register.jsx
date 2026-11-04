const Register = () => {
  const handleRegistration = async (event) => {
    event.preventDefault();
    const username = event.target.username.value;
    const password = event.target.password.value;
    // Handle registration logic here (e.g., send data to the server)
    try {
      const response = await fetch(
        "http://localhost:3001/api/candidates/register",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ username, password }),
        },
      );
      if (!response.ok) {
        throw new Error("Failed to register candidate");
      }
      console.log("Candidate registered successfully", await response.json());
    } catch (error) {
      console.error("Error during registration:", error);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-100 p-4 dark:bg-slate-900 max-[360px]:p-2 landscape:max-h-[500px]:items-start">
      <div className="w-full max-w-sm rounded-2xl bg-white p-5 shadow-xl sm:max-w-md sm:p-8 md:max-w-lg md:p-10 dark:bg-slate-800">
        <h2 className="text-2xl font-bold text-slate-900 sm:text-3xl dark:text-slate-100">
          Candidate Registration
        </h2>
        <p className="mb-6 mt-1 text-sm text-slate-500 sm:text-base dark:text-slate-400">
          Create your account to get started.
        </p>

        <form onSubmit={handleRegistration} className="space-y-5">
          <div className="flex flex-col gap-1.5">
            <label
              htmlFor="username"
              className="text-sm font-semibold text-slate-700 dark:text-slate-200"
            >
              Name
            </label>
            <input
              type="text"
              id="username"
              name="username"
              autoComplete="username"
              placeholder="Enter your name"
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

export default Register;
