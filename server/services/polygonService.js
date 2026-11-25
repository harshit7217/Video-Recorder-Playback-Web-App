const configuredBackendUrl = process.env.BACKEND_URL?.trim();

export const API_BASE_URL = configuredBackendUrl.replace(/\/+$/, "");

export function apiUrl(path) {
  return `${API_BASE_URL}/${path.replace(/^\/+/, "")}`;
}

export const boundaryofPolygons = async () => {
  try {
    const response = await fetch(apiUrl("/api/employers/country-details"));
    const result = await response.json();
    const arrayResult = [];
    result.map((res) => {
      arrayResult.push(convertedIntoTwoDArray(res.boundary));
    });
    return arrayResult;
  } catch (error) {
    console.error(error);
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
