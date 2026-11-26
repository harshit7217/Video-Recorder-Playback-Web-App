const configuredBackendUrl = process.env.BACKEND_URL?.trim();

export const API_BASE_URL = configuredBackendUrl.replace(/\/+$/, "");

export function apiUrl(path) {
  return `${API_BASE_URL}/${path.replace(/^\/+/, "")}`;
}

const fetchingTheBoundary = async (arr) => {
  const polygons = [];

  const results = await Promise.allSettled(
    arr.flat().map(async (a) => {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/lookup?osm_ids=${encodeURIComponent(a)}&format=geojson&polygon_geojson=1`,
        {
          headers: {
            "User-Agent":
              "Video Recorder and Web Playback Application/1.0 (harshit@jobma.com)",
            Accept: "application/json",
          },
        },
      );

      if (!response.ok) {
        throw new Error(`Nominatim error: ${response.status} for ${a}`);
      }

      const result = await response.json();

      result.features?.forEach((feature) => {
        const { type, coordinates } = feature.geometry;

        const flip = (ring) => ring.map(([lng, lat]) => [lat, lng]);

        if (type === "Polygon") {
          polygons.push(coordinates.map(flip));
        } else if (type === "MultiPolygon") {
          polygons.push(...coordinates.map((polygon) => polygon.map(flip)));
        }
      });
    }),
  );

  // Log failed requests
  results.forEach((result, index) => {
    if (result.status === "rejected") {
      console.error(`Failed request ${index}:`, result.reason);
    }
  });
  return polygons;
};

export const boundaryofPolygons = async () => {
  try {
    const response = await fetch(
      apiUrl(
        "api/employers/country-details?employerID=6aedaaa31678958d084176f4",
      ),
    );
    const result = await response.json();
    const a = await fetchingTheBoundary(result);
    const twoD = convertedIntoTwoDArray(a);
    return twoD;
  } catch (error) {
    console.error("error", error);
  }
};

const convertedIntoTwoDArray = (boundaryArray) => {
  const array = [];
  boundaryArray.map((boundary) => {
    boundary.map((bound) => {
      bound.map((b) => {
        array.push(b);
      });
    });
  });
  return array;
};

function onSegment(x1, y1, x2, y2, x, y) {
  let c = (x - x1) * (y2 - y1) - (y - y1) * (x2 - x1);

  if (c !== 0) return false;

  return (
    Math.min(x1, x2) <= x &&
    x <= Math.max(x1, x2) &&
    Math.min(y1, y2) <= y &&
    y <= Math.max(y1, y2)
  );
}

export const isInside = (arr, x, y) => {
  let n = arr.length;
  let inside = false;

  for (let i = 0, j = n - 1; i < n; j = i++) {
    let [x1, y1] = arr[i];
    let [x2, y2] = arr[j];

    // Point lies on the current edge
    if (onSegment(x1, y1, x2, y2, x, y)) return true;

    // Check whether the horizontal ray from (x, y)
    // intersects the current edge
    let intersect =
      y1 > y !== y2 > y && x < ((x2 - x1) * (y - y1)) / (y2 - y1) + x1;

    if (intersect) inside = !inside;
  }

  return inside;
};
