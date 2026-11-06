import { useState } from "react";

export default function RadiusForm({ radius, setRadius }) {
  const [tempRadius, setTempRadius] = useState(radius);

  const handleFormSubmit = (e) => {
    e.preventDefault();
    setRadius(tempRadius);
  };

  return (
    <div className="w-full max-w-none mx-auto px-2 sm:px-4 py-3">
      <div>
        <h2 className="text-lg font-semibold text-gray-900">
          Set Search Radius
        </h2>
        <p className="text-xs text-gray-500 mt-1">
          Choose your preferred search distance.
        </p>
      </div>

      <form onSubmit={handleFormSubmit}>
        <label
          htmlFor="radius"
          className="block text-xs font-semibold
            text-gray-700 mb-2"
        >
          Radius Distance
        </label>

        <div
          className="flex items-center border
            border-gray-300 rounded-lg bg-white
            focus-within:border-blue-600
            focus-within:ring-2 focus-within:ring-blue-100
            transition-all overflow-hidden"
        >
          <span className="pl-3 text-blue-600 text-sm">📍</span>

          <input
            id="radius"
            name="radius"
            type="number"
            min={500}
            value={tempRadius}
            onChange={(e) => setTempRadius(e.target.value)}
            onKeyDown={(e) => setTempRadius(e.target.value)}
            step="1"
            placeholder="Enter radius"
            required
            className="w-full h-11 px-3
              bg-white text-gray-900
              text-sm font-medium
              placeholder:text-gray-400
              outline-none border-0 focus:ring-0"
          />

          <span
            className="pr-3 text-xs
              font-medium text-gray-500 whitespace-nowrap"
          >
            Meters
          </span>
        </div>

        <p className="text-[11px] text-gray-500 mt-2">
          Minimum allowed radius is 500 meters.
        </p>
        <button type="submit">Submit</button>
      </form>
    </div>
  );
}
