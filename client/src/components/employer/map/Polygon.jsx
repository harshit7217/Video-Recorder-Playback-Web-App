import { useState, useEffect } from "react";
import { apiUrl } from "../../../api";

const Polygon = ({ setPolygonBoundary }) => {
  const [countryDetails, setCountryDetails] = useState([]);
  const [countryName, setCountryName] = useState("");
  const [countryList, setCountryList] = useState([]);
  const employer = JSON.parse(localStorage.getItem("employer"));
  const [data, setData] = useState([]);

  useEffect(() => {
    const fetchBoundary = async (name) => {
      try {
        const response = await fetch(
          `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(name)}&format=geojson&polygon_geojson=1&limit=1`,
        );
        const result = await response.json();

        const polygons = [];

        result.features.forEach((feature) => {
          const { type, coordinates } = feature.geometry;

          // GeoJSON is [lng, lat]; Leaflet wants [lat, lng]
          const flip = (ring) => ring.map(([lng, lat]) => [lat, lng]);

          if (type === "Polygon") {
            // outer ring only; pass the whole `coordinates.map(flip)` to keep holes
            polygons.push(flip(coordinates[0]));
          } else if (type === "MultiPolygon") {
            coordinates.forEach((poly) => {
              polygons.push(flip(poly[0]));
            });
          }
        });

        // One state, one shape: Leaflet's <Polygon> accepts either type
        setPolygonBoundary((prev) => [...prev, polygons]);
      } catch (err) {
        console.error("Error fetching polygon boundary:", err);
      }
    };

    data.map((d) => {
      fetchBoundary(d.countryName);
    });
  }, [data]);

  useEffect(() => {
    if (!countryName) {
      return;
    }

    const fetchBoundary = async () => {
      try {
        const response = await fetch(
          `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(countryName)}&format=geojson&polygon_geojson=1`,
        );
        const result = await response.json();
        setCountryDetails(result.features);
      } catch (err) {
        console.error("Fetching boundary error:", err);
      }
    };

    fetchBoundary();
  }, [countryName]);

  useEffect(() => {
    const getAllDetails = async () => {
      try {
        const response = await fetch(
          apiUrl(
            `api/employers/country-details?employerID=${encodeURIComponent(employer._id)}`,
          ),
          {
            method: "GET",
            headers: {
              "content-type": "application/json",
            },
          },
        );
        const result = await response.json();
        setData(result);
      } catch (err) {
        console.error("Fetching the data", err);
      }
    };

    getAllDetails();
  }, []);

  const handleCountryBoundary = async (country) => {
    const polygons = [];

    const { type, coordinates } = country.geometry;

    const flip = (ring) => ring.map(([lng, lat]) => [lat, lng]);

    if (type === "Polygon") {
      polygons.push(flip(coordinates[0]));
    } else if (type === "MultiPolygon") {
      coordinates.forEach((poly) => {
        polygons.push(flip(poly[0]));
      });
    }
    setPolygonBoundary((prev) => [...prev, polygons]);
    try {
      const response = await fetch(apiUrl("api/employers/country"), {
        method: "POST",
        headers: {
          "content-type": "application/json",
        },
        body: JSON.stringify({
          countryName: country.properties.display_name,
          employerId: employer._id,
          typeOfPolygon: country.geometry.type,
        }),
      });
      const result = await response.json();
    } catch (err) {
      console.error("Storing the country Name", err.message);
    }
  };

  useEffect(() => {
    const listOfCountry = async () => {
      try {
        const response = await fetch(
          "https://countriesnow.space/api/v0.1/countries/iso",
        );
        const result = await response.json();
        setCountryList(result.data);
      } catch (err) {
        console.error("List of Country: ", err);
      }
    };
    listOfCountry();
  }, []);

  const countryListOption = countryList.map((res, index) => (
    <option key={res.name || index} value={res.name}>
      {res.name}
    </option>
  ));

  return (
    <aside className="w-full h-full min-w-0">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm h-full flex flex-col overflow-hidden">
        {/* HEADER */}
        <div className="p-5 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M3 6l6-3 6 3 6-3v15l-6 3-6-3-6 3V6z M9 3v15 M15 6v15"
                />
              </svg>
            </div>

            <div className="min-w-0">
              <h2 className="font-bold text-slate-900">Country Boundaries</h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Geographic boundary explorer
              </p>
            </div>
          </div>
        </div>

        {/* BODY */}
        <div className="p-5 flex-1 space-y-5">
          {/* SEARCH SECTION */}
          <div>
            <div className="flex items-center justify-between gap-2 mb-1">
              <h3 className="text-sm font-bold text-slate-800">
                Country Search
              </h3>

              <span className="text-[10px] font-semibold text-blue-600 bg-blue-50 px-2 py-1 rounded-md">
                Explorer
              </span>
            </div>

            <p className="text-xs text-slate-500 mb-4">
              Find a country and load its geographic boundary.
            </p>

            {/* COUNTRY COUNT */}
            <div className="flex items-center gap-3 bg-slate-50 border border-slate-200 rounded-xl p-3 mb-4">
              <div className="w-9 h-9 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center shrink-0">
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12 21s7-5.5 7-12a7 7 0 10-14 0c0 6.5 7 12 7 12z"
                  />
                  <circle cx="12" cy="9" r="2.5" strokeWidth="1.8" />
                </svg>
              </div>

              <div>
                <p className="text-lg font-bold text-slate-900 leading-none">
                  {
                    countryDetails.filter(
                      (country) =>
                        country.geometry.type === "Polygon" ||
                        country.geometry.type === "MultiPolygon",
                    ).length
                  }
                </p>
                <p className="text-[11px] text-slate-500 mt-1">
                  Available Countries
                </p>
              </div>
            </div>

            {/* SEARCH FORM */}
            {/* <form onSubmit={handleSubmit} className="space-y-3">
              <div className="relative">
                <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                  <svg
                    className="w-4 h-4 text-slate-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <circle cx="11" cy="11" r="7" strokeWidth="1.8" />
                    <path
                      d="m16 16 4 4"
                      strokeWidth="1.8"
                      strokeLinecap="round"
                    />
                  </svg>
                </div>

                <input
                  type="text"
                  value={temp}
                  onChange={(e) => setTemp(e.target.value)}
                  placeholder="Enter country name..."
                  className="w-full h-11 pl-10 pr-3 rounded-xl bg-slate-50 border border-slate-200 text-sm text-slate-800 placeholder:text-slate-400 outline-none transition-all focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
                />
              </div>

              <button
                type="submit"
                className="w-full h-11 flex items-center justify-center gap-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold shadow-sm transition-all active:scale-[0.98]"
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <circle cx="11" cy="11" r="7" strokeWidth="2" />
                  <path d="m16 16 4 4" strokeWidth="2" strokeLinecap="round" />
                </svg>
                Search Countries
              </button>

              <button
                type="button"
                onClick={handleRemovePolygon}
                className="w-full h-10 flex items-center justify-center gap-2 rounded-xl border border-red-200 bg-red-50 hover:bg-red-100 text-red-600 text-xs font-semibold transition-all"
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    d="M4 7h16M10 11v6m4-6v6M5 7l1 14h12l1-14M9 7V4h6v3"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                Remove Polygon
              </button>
            </form> */}

            <div className="w-full">
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
                {/* HEADER */}
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <circle cx="12" cy="12" r="9" strokeWidth="1.8" />
                      <path
                        d="M3 12h18M12 3a15 15 0 010 18M12 3a15 15 0 000 18"
                        strokeWidth="1.5"
                      />
                    </svg>
                  </div>

                  <div>
                    <h3 className="text-sm font-bold text-slate-900">
                      Country Selection
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Select a country to explore its geographic data.
                    </p>
                  </div>
                </div>

                {/* SELECT */}
                <form className="space-y-2">
                  <label
                    htmlFor="country"
                    className="block text-xs font-semibold text-slate-700"
                  >
                    Choose Country
                  </label>

                  <div className="relative">
                    <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                      <svg
                        className="w-4 h-4 text-slate-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeWidth="1.8"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M12 21s7-5.5 7-12a7 7 0 10-14 0c0 6.5 7 12 7 12z"
                        />
                        <circle cx="12" cy="9" r="2.5" strokeWidth="1.8" />
                      </svg>
                    </div>

                    <select
                      name="country"
                      id="country"
                      value={countryName}
                      onChange={(e) => setCountryName(e.target.value)}
                      className="w-full h-12 pl-10 pr-10 appearance-none rounded-xl border border-slate-200 bg-slate-50 text-sm text-slate-700 font-medium outline-none cursor-pointer transition-all hover:border-blue-300 focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
                    >
                      <option value="" disabled>
                        Select a country...
                      </option>
                      {countryListOption}
                    </select>

                    <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none">
                      <svg
                        className="w-4 h-4 text-slate-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          d="m7 10 5 5 5-5"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </div>
                  </div>

                  <p className="text-[11px] text-slate-400 flex items-center gap-1.5 pt-1">
                    <svg
                      className="w-3.5 h-3.5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <circle cx="12" cy="12" r="10" strokeWidth="1.7" />
                      <path
                        d="M12 11v5m0-8h.01"
                        strokeWidth="2"
                        strokeLinecap="round"
                      />
                    </svg>
                    Choose a country to continue.
                  </p>
                </form>
              </div>
            </div>
          </div>

          {/* SEARCH RESULTS */}
          <div className="border-t border-slate-100 pt-5">
            <div className="flex items-center justify-between gap-2 mb-3">
              <div>
                <h3 className="text-sm font-bold text-slate-800">
                  Search Results
                </h3>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Select a country to view its boundary.
                </p>
              </div>

              <span className="text-xs font-semibold text-slate-500 bg-slate-100 px-2.5 py-1 rounded-lg">
                {
                  countryDetails.filter(
                    (country) =>
                      country.geometry.type === "Polygon" ||
                      country.geometry.type === "MultiPolygon",
                  ).length
                }
              </span>
            </div>

            <div className="space-y-2 max-h-[360px] overflow-y-auto pr-1">
              {countryDetails.filter(
                (country) =>
                  country.geometry.type === "Polygon" ||
                  country.geometry.type === "MultiPolygon",
              ).length > 0 ? (
                countryDetails
                  .filter(
                    (country) =>
                      country.geometry.type === "Polygon" ||
                      country.geometry.type === "MultiPolygon",
                  )
                  .map((country, index) => (
                    <button
                      key={index}
                      type="button"
                      onClick={() => handleCountryBoundary(country)}
                      className="group w-full flex items-center gap-3 p-3 text-left rounded-xl border border-slate-200 bg-white hover:border-blue-400 hover:bg-blue-50/40 hover:shadow-sm transition-all"
                    >
                      <div className="w-9 h-9 shrink-0 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition-colors">
                        <svg
                          className="w-4 h-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeWidth="1.8"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M12 21s7-5.5 7-12a7 7 0 10-14 0c0 6.5 7 12 7 12z"
                          />
                          <circle cx="12" cy="9" r="2.5" strokeWidth="1.8" />
                        </svg>
                      </div>

                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold text-slate-800 group-hover:text-blue-700 line-clamp-2">
                          {country.properties.display_name}
                        </p>

                        <div className="flex items-center gap-1.5 mt-1.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                          <span className="text-[10px] text-slate-400">
                            Polygon Boundary
                          </span>
                        </div>
                      </div>

                      <svg
                        className="w-4 h-4 shrink-0 text-slate-400 group-hover:text-blue-600 transition-colors"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          d="m9 18 6-6-6-6"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </button>
                  ))
              ) : (
                <div className="py-7 px-3 text-center rounded-xl border border-dashed border-slate-200 bg-slate-50">
                  <div className="w-10 h-10 mx-auto rounded-xl bg-white border border-slate-200 flex items-center justify-center mb-2">
                    <svg
                      className="w-5 h-5 text-slate-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <circle cx="11" cy="11" r="7" strokeWidth="1.8" />
                      <path
                        d="m16 16 4 4"
                        strokeWidth="1.8"
                        strokeLinecap="round"
                      />
                    </svg>
                  </div>

                  <p className="text-xs font-semibold text-slate-700">
                    No Countries Found
                  </p>
                  <p className="text-[11px] text-slate-400 mt-1">
                    Search for a country to explore its boundary.
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* QUICK GUIDE */}
          <div className="rounded-xl bg-blue-50 border border-blue-100 p-4">
            <div className="flex items-center gap-2 mb-2">
              <svg
                className="w-4 h-4 text-blue-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <circle cx="12" cy="12" r="10" strokeWidth="1.8" />
                <path
                  d="M12 11v5m0-8h.01"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              </svg>
              <p className="text-xs font-bold text-blue-900">How to use</p>
            </div>

            <p className="text-xs text-blue-700 leading-relaxed">
              Search for a country and select a result to visualize its
              geographic boundary directly on the map.
            </p>
          </div>
        </div>

        {/* FOOTER */}
        <div className="px-5 py-3 border-t border-slate-100 bg-slate-50/70">
          <div className="flex items-center justify-between">
            <span className="text-[11px] text-slate-400">Polygon Explorer</span>
            <span className="flex items-center gap-1.5 text-[11px] font-medium text-emerald-600">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              Ready
            </span>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default Polygon;
