import { useState, useEffect } from "react";
import { apiUrl, readApiResponse } from "../../../api";

const Polygon = ({ setPolygonBoundary }) => {
  const [cityDetails, setCityDetails] = useState([]);
  const employer = JSON.parse(localStorage.getItem("employer"));
  const [tempCity, setTempCity] = useState("");
  const [city, setCity] = useState([]);
  const [cityUniqueId, setCityUniqueId] = useState("");

  useEffect(() => {
    // const savingOSMIdOfPlace = async () => {
    //   try {
    //     const response = await fetch();
    //   } catch (error) {
    //     console.error("Saving OSM ID Error", error);
    //   }
    // };
    const fetchBoundary = async (name) => {
      try {
        const response = await fetch(
          `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(name)}&format=geojson&polygon_geojson=1&limit=1`,
        );
        if (!response.ok) {
          throw new Error(
            `Boundary lookup failed with status ${response.status}`,
          );
        }
        const result = await response.json();
        const polygons = [];
        result.features.forEach((feature) => {
          const { type, coordinates } = feature.geometry;
          const flip = (ring) => ring.map(([lng, lat]) => [lat, lng]);

          if (type === "Polygon") {
            polygons.push(coordinates.map(flip));
          } else if (type === "MultiPolygon") {
            polygons.push(...coordinates.map((polygon) => polygon.map(flip)));
          }
        });
        setPolygonBoundary((prev) => [...prev, ...polygons]);
      } catch (err) {
        console.error("Error fetching polygon boundary:", err);
      }
    };

    city.map((d) => {
      fetchBoundary(d.countryName);
    });
  }, [city, setPolygonBoundary]);

  useEffect(() => {
    const fetchingDataByCityUniqueId = async () => {
      try {
        const response = await fetch(
          `https://nominatim.openstreetmap.org/lookup?osm_ids=${cityUniqueId}&format=geojson&polygon_geojson=1`,
        );
        const result = await response.json();
      } catch (error) {
        console.error("fetching the data from city unique id", error);
      }
    };

    fetchingDataByCityUniqueId();
  }, [cityUniqueId]);

  useEffect(() => {
    if (city.length === 0) return;

    const fetchBoundary = async (cityName) => {
      try {
        const response = await fetch(
          `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(cityName)}&format=geojson&polygon_geojson=1`,
        );
        const result = await response.json();
        setCityDetails(result.features);
      } catch (err) {
        console.error("Fetching boundary error:", err);
      }
    };

    fetchBoundary(city[city.length - 1]);
  }, [city]);

  // useEffect(() => {
  //   const getAllDetails = async () => {
  //     try {
  //       const response = await fetch(
  //         apiUrl(
  //           `api/employers/country-details?employerID=${encodeURIComponent(employer._id)}`,
  //         ),
  //         {
  //           method: "GET",
  //           headers: {
  //             "content-type": "application/json",
  //           },
  //         },
  //       );
  //       const result = await response.json();
  //       setData(result);
  //     } catch (err) {
  //       console.error("Fetching the data", err);
  //     }
  //   };

  //   getAllDetails();
  // }, []);

  const handleCountryBoundary = async (country) => {
    const osmId = "R" + country.properties.osm_id;
    try {
      const response = await fetch(apiUrl("/api/employers/country"), {
        method: "POST",
        headers: {
          "content-type": "application/json",
        },
        body: JSON.stringify({
          employerId: employer._id,
          osmId: String(osmId).trim(),
        }),
      });

      if (!response.ok) {
        const result = await response.json();
        console.log(result);
        throw new Error(
          result.message ||
            `Saving boundary failed with status ${response.status}`,
        );
      }
      setCityUniqueId(osmId);
    } catch (err) {
      console.error("Storing the city boundary failed:", err.message);
    }
  };

  // useEffect(() => {
  //   const listOfCountry = async () => {
  //     try {
  //       const response = await fetch(
  //         "https://countriesnow.space/api/v0.1/countries/iso",
  //       );
  //       const result = await response.json();
  //       setCountryList(result.data);
  //     } catch (err) {
  //       console.error("List of Country: ", err);
  //     }
  //   };
  //   listOfCountry();
  // }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (tempCity === "" && city.includes(tempCity)) return;
    setCity((prev) => [...prev, tempCity]);
  };

  const handleRemovePolygon = async () => {
    if (!employer?._id) {
      console.error("Cannot remove saved boundaries without an employer id");
      return;
    }

    try {
      const response = await fetch(
        apiUrl(
          `api/employers/country-details?employerId=${encodeURIComponent(employer._id)}`,
        ),
        { method: "DELETE" },
      );
      await readApiResponse(response, "Unable to remove saved city boundaries");
      setCity([]);
      setCityDetails([]);
      setTempCity("");
      setPolygonBoundary([]);
    } catch (error) {
      console.error("Removing saved city boundaries failed:", error.message);
    }
  };

  // const countryListOption = countryList.map((res, index) => (
  //   <option key={res.name || index} value={res.name}>
  //     {res.name}
  //   </option>
  // ));

  return (
    <aside className="flex h-full min-h-0 w-full min-w-0 flex-col overflow-hidden rounded-2xl bg-white shadow-sm">
      {/* HEADER */}
      <div className="shrink-0 bg-white px-4 py-4 sm:px-5">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
            <svg
              className="h-5 w-5"
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

          <div className="min-w-0 flex-1">
            <h2 className="text-base font-bold tracking-tight text-slate-900 sm:text-lg">
              City Boundaries
            </h2>
            <p className="mt-0.5 text-xs text-slate-500">
              Explore and visualize geographic boundaries
            </p>
          </div>

          <span className="hidden shrink-0 items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1.5 text-[10px] font-semibold text-emerald-700 sm:inline-flex">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
            Ready
          </span>
        </div>
      </div>

      {/* SCROLLABLE BODY */}
      <div className="min-h-0 flex-1 space-y-5 overflow-y-auto overscroll-contain p-4 sm:p-5">
        {/* SEARCH SECTION */}
        <section>
          <div className="mb-4">
            <div className="flex items-center justify-between gap-2">
              <h3 className="text-sm font-bold text-slate-800">
                Search Location
              </h3>
              <span className="rounded-lg bg-indigo-50 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-indigo-600">
                Explorer
              </span>
            </div>
            <p className="mt-1 text-xs leading-5 text-slate-500">
              Search for a city or place to retrieve its boundary.
            </p>
          </div>

          {/* STAT CARD */}
          <div className="mb-4 flex items-center justify-between rounded-xl bg-indigo-50/70 p-3.5">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-indigo-600 shadow-sm">
                <svg
                  className="h-5 w-5"
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
                  <circle cx="12" cy="9" r="2.5" />
                </svg>
              </div>
              <div>
                <p className="text-xs font-medium text-slate-500">
                  Available Boundaries
                </p>
                <p className="mt-0.5 text-xl font-bold text-slate-900">
                  {
                    cityDetails.filter(
                      (country) =>
                        country.geometry.type === "Polygon" ||
                        country.geometry.type === "MultiPolygon",
                    ).length
                  }
                </p>
              </div>
            </div>
            <span className="text-xs font-medium text-indigo-600">
              Locations
            </span>
          </div>

          {/* SEARCH FORM */}
          <form onSubmit={(e) => handleSubmit(e)} className="space-y-3">
            <label
              htmlFor="city-search"
              className="block text-xs font-semibold text-slate-700"
            >
              City or place
            </label>

            <div className="group relative">
              <svg
                className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400 transition group-focus-within:text-indigo-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <circle cx="11" cy="11" r="7" strokeWidth="1.8" />
                <path d="m16 16 4 4" strokeWidth="1.8" strokeLinecap="round" />
              </svg>

              <input
                id="city-search"
                type="text"
                value={tempCity}
                onChange={(e) => setTempCity(e.target.value)}
                placeholder="e.g. Gurgaon, India"
                className="h-12 w-full rounded-xl border-0 bg-slate-100 pl-10 pr-3 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:bg-white focus:ring-2 focus:ring-indigo-500/30"
              />
            </div>

            <button
              type="submit"
              className="flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 text-sm font-semibold text-white shadow-sm shadow-indigo-600/20 transition hover:bg-indigo-700 active:scale-[0.99] focus:outline-none focus:ring-4 focus:ring-indigo-500/20"
            >
              <svg
                className="h-4 w-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <circle cx="11" cy="11" r="7" strokeWidth="2" />
                <path d="m16 16 4 4" strokeWidth="2" strokeLinecap="round" />
              </svg>
              Search Boundaries
            </button>

            <button
              type="button"
              onClick={handleRemovePolygon}
              className="flex h-10 w-full items-center justify-center gap-2 rounded-xl bg-rose-50 text-xs font-semibold text-rose-600 transition hover:bg-rose-100 active:scale-[0.99]"
            >
              <svg
                className="h-4 w-4"
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
          </form>
        </section>

        {/* SEARCH RESULTS */}
        <section>
          <div className="mb-3 flex items-center justify-between gap-2">
            <div>
              <h3 className="text-sm font-bold text-slate-800">
                Search Results
              </h3>
              <p className="mt-1 text-xs text-slate-500">
                Select a location to display its boundary.
              </p>
            </div>

            <span className="rounded-lg bg-slate-100 px-2.5 py-1 text-xs font-bold text-slate-600">
              {
                cityDetails.filter(
                  (country) =>
                    country.geometry.type === "Polygon" ||
                    country.geometry.type === "MultiPolygon",
                ).length
              }
            </span>
          </div>

          <div className="max-h-[320px] space-y-2 overflow-y-auto overscroll-contain pr-1 sm:max-h-[380px]">
            {cityDetails.filter(
              (country) =>
                country.geometry.type === "Polygon" ||
                country.geometry.type === "MultiPolygon",
            ).length > 0 ? (
              cityDetails
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
                    className="group flex w-full items-center gap-3 rounded-xl bg-slate-50 p-3 text-left transition-all hover:bg-indigo-50 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                  >
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 transition group-hover:bg-indigo-600 group-hover:text-white">
                      <svg
                        className="h-5 w-5"
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
                        <circle cx="12" cy="9" r="2.5" />
                      </svg>
                    </div>

                    <div className="min-w-0 flex-1">
                      <p className="break-words text-xs font-semibold leading-5 text-slate-800 transition group-hover:text-indigo-700 sm:text-sm">
                        {country.properties.display_name}
                      </p>
                      <div className="mt-1 flex items-center gap-1.5">
                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                        <span className="text-[10px] font-medium text-slate-400">
                          Polygon Boundary
                        </span>
                      </div>
                    </div>

                    <svg
                      className="h-4 w-4 shrink-0 text-slate-400 transition group-hover:translate-x-0.5 group-hover:text-indigo-600"
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
              <div className="rounded-xl bg-slate-50 px-4 py-9 text-center">
                <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-xl bg-white text-slate-400 shadow-sm">
                  <svg
                    className="h-5 w-5"
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
                <p className="mt-3 text-sm font-semibold text-slate-700">
                  No Boundaries Found
                </p>
                <p className="mt-1 text-xs leading-5 text-slate-400">
                  Search for a city or place to explore its boundary.
                </p>
              </div>
            )}
          </div>
        </section>

        {/* QUICK GUIDE */}
        <section className="rounded-xl bg-blue-50/80 p-4">
          <div className="flex items-center gap-2">
            <svg
              className="h-4 w-4 text-blue-600"
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
            <h4 className="text-xs font-bold text-blue-900">Quick Guide</h4>
          </div>
          <p className="mt-2 text-xs leading-5 text-blue-700">
            Search for a city or place, select a result, and view its boundary
            on the map.
          </p>
        </section>
      </div>

      {/* FOOTER */}
      <div className="flex shrink-0 items-center justify-between bg-slate-50 px-4 py-3 sm:px-5">
        <span className="text-[10px] font-medium uppercase tracking-wider text-slate-400">
          Polygon Explorer
        </span>
        <span className="flex items-center gap-1.5 text-[11px] font-semibold text-emerald-600">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
          System Ready
        </span>
      </div>
    </aside>
  );
};

export default Polygon;
