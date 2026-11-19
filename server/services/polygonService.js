const configuredBackendUrl = process.env.BACKEND_URL?.trim();

export const API_BASE_URL = configuredBackendUrl.replace(/\/+$/, "");

export function apiUrl(path) {
  return `${API_BASE_URL}/${path.replace(/^\/+/, "")}`;
}

export const countryOfPolygons = async () => {
  try {
    const response = await fetch(
      apiUrl(
        "api/employers/country-details?employerID=6aedaaa31678958d084176f4",
      ),
    );
    if (!response.ok) {
      throw new Error(`Request failed with status ${response.status}`);
    }
    return await response.json();
  } catch (err) {
    console.error("Boundary error", err);
  }
};

// export const boundaryofPolygons = async () => {
//   let result = [];
//   fetch(
//     "https://nominatim.openstreetmap.org/search?q=India&format=geojson&polygon_geojson=1&limit=1",
//     {
//       method: "GET",
//       headers: {
//         "User-Agent": "BuildShare/1.0 (https://buildshare.in)",
//         Accept: "application/json",
//       },
//     },
//   )
//     .then((res) => {
//       return res.json();
//     })
//     .then((data) => {
//       result = JSON.stringify(data);
//     })
//     .catch((error) => {
//       console.log(error);
//     });
//     return result;
// };

export const boundaryofPolygons = async (name) => {
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(name)}&format=geojson&polygon_geojson=1&limit=1`,
      {
        method: "GET",
        headers: {
          "User-Agent": "BuildShare/1.0 (https://buildshare.in)",
          Accept: "application/json",
        },
      },
    );

    if (!res.ok) {
      throw new Error(`Request failed with status ${res.status}`);
    }

    const data = await res.json();
    const result = JSON.stringify(data);
    const features = JSON.parse(result).features;
    let points = [];
    features.forEach(({ geometry: { type, coordinates } }) => {
      let rings = [];

      if (type === "Polygon") {
        rings = coordinates;
      } else if (type === "MultiPolygon") {
        rings = coordinates.flat(1);
      } else {
        return;
      }

      rings.forEach((ring) => {
        for (const point of ring) {
          points.push(point);
        }
      });
    });
    return points;
  } catch (error) {
    console.error(error);
    return null;
  }
};
