import { useState } from "react";

export default function RadiusForm({ radius, setRadius }) {
  const [tempRadius, setTempRadius] = useState(radius);

  const handleFormSubmit = (e) => {
    e.preventDefault();
    setRadius(tempRadius);
  };

  return (
    <div
      className="
  mx-auto w-full max-w-2xl
  overflow-hidden rounded-2xl
  border border-slate-200
  bg-white shadow-lg shadow-slate-200/40
  dark:border-slate-700 dark:bg-slate-900
"
    >
      {/* Header */}
      <div
        className="
    flex items-center gap-3
    border-b border-slate-100
    bg-gradient-to-r from-indigo-50 to-white
    p-5 sm:p-6
    dark:border-slate-700
    dark:from-indigo-950/40 dark:to-slate-900
  "
      >
        <div
          className="
      flex h-11 w-11 shrink-0
      items-center justify-center
      rounded-xl bg-indigo-600
      text-white shadow-md shadow-indigo-200
      dark:shadow-none
    "
        >
          <svg
            className="h-6 w-6"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
          >
            <path d="M20 10c0 5-8 12-8 12S4 15 4 10a8 8 0 1 1 16 0Z" />
            <circle cx="12" cy="10" r="2.5" />
          </svg>
        </div>

        <div>
          <h2
            className="
        text-lg font-bold tracking-tight
        text-slate-900 dark:text-white
      "
          >
            Set Search Radius
          </h2>

          <p
            className="
        mt-1 text-xs text-slate-500
        dark:text-slate-400 sm:text-sm
      "
          >
            Customize your preferred location search distance.
          </p>
        </div>
      </div>

      {/* Form */}
      <div className="p-5 sm:p-6">
        <form onSubmit={handleFormSubmit}>
          <label
            htmlFor="radius"
            className="
          mb-2 block text-sm
          font-semibold text-slate-700
          dark:text-slate-200
        "
          >
            Radius Distance
          </label>

          {/* Input */}
          <div
            className="
        flex items-center overflow-hidden
        rounded-xl border border-slate-300
        bg-white transition-all duration-200
        focus-within:border-indigo-500
        focus-within:ring-4
        focus-within:ring-indigo-500/10
        dark:border-slate-600
        dark:bg-slate-800
      "
          >
            <div
              className="
          flex h-12 items-center
          pl-3.5 text-indigo-600
          dark:text-indigo-400
        "
            >
              <svg
                className="h-5 w-5"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
              >
                <path d="M20 10c0 5-8 12-8 12S4 15 4 10a8 8 0 1 1 16 0Z" />
                <circle cx="12" cy="10" r="2.5" />
              </svg>
            </div>

            <input
              id="radius"
              name="radius"
              type="number"
              min={500}
              step={1}
              value={tempRadius}
              onChange={(e) => setTempRadius(e.target.value)}
              placeholder="Enter radius"
              required
              className="
            h-12 min-w-0 flex-1
            border-0 bg-transparent
            px-3 text-base font-semibold
            text-slate-900 outline-none
            placeholder:font-normal
            placeholder:text-slate-400
            focus:ring-0
            dark:text-white
          "
            />

            <div
              className="
          mr-2 flex h-8 items-center
          rounded-lg bg-indigo-50
          px-3 text-xs font-bold
          text-indigo-700
          dark:bg-indigo-500/10
          dark:text-indigo-300
        "
            >
              METERS
            </div>
          </div>

          {/* Helper Information */}
          <div
            className="
        mt-3 flex items-start gap-2
        text-xs leading-5 text-slate-500
        dark:text-slate-400
      "
          >
            <svg
              className="mt-0.5 h-4 w-4 shrink-0 text-indigo-500"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
            >
              <circle cx="12" cy="12" r="9" />
              <path d="M12 11v5m0-8h.01" />
            </svg>

            <p>
              Minimum allowed search radius is
              <span className="font-semibold text-slate-700 dark:text-slate-200">
                {" "}
                500 meters.
              </span>
            </p>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="
          mt-6 flex w-full
          items-center justify-center
          gap-2 rounded-xl
          bg-indigo-600 px-5 py-3
          text-sm font-bold text-white
          shadow-md shadow-indigo-200/50
          transition-all duration-200
          hover:-translate-y-0.5
          hover:bg-indigo-700
          hover:shadow-lg
          active:translate-y-0
          focus-visible:outline-none
          focus-visible:ring-4
          focus-visible:ring-indigo-500/20
          dark:shadow-none
          sm:w-auto sm:min-w-40
        "
          >
            <svg
              className="h-4 w-4"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M5 12h14m-7-7 7 7-7 7" />
            </svg>
            Apply Radius
          </button>
        </form>
      </div>

      {/* Bottom Accent */}
      <div
        className="
    h-1 w-full
    bg-gradient-to-r
    from-indigo-700 via-violet-500 to-indigo-400
  "
      />
    </div>
  );
}
