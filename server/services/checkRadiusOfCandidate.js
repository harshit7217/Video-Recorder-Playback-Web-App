const EARTH_RADIUS_METERS = 6371000;

export const calculateDistanceInMeters = ({ lat1, lng1, lat2, lng2 }) => {
  const latitude1 = Number(lat1);
  const longitude1 = Number(lng1);
  const latitude2 = Number(lat2);
  const longitude2 = Number(lng2);

  if (
    !Number.isFinite(latitude1) ||
    !Number.isFinite(longitude1) ||
    !Number.isFinite(latitude2) ||
    !Number.isFinite(longitude2)
  ) {
    throw new Error("Valid latitude and longitude values are required");
  }

  const toRadians = (degrees) => (degrees * Math.PI) / 180;

  const deltaLat = toRadians(latitude2 - latitude1);
  const deltaLng = toRadians(longitude2 - longitude1);

  const a =
    Math.sin(deltaLat / 2) * Math.sin(deltaLat / 2) +
    Math.cos(toRadians(latitude1)) *
      Math.cos(toRadians(latitude2)) *
      Math.sin(deltaLng / 2) *
      Math.sin(deltaLng / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return EARTH_RADIUS_METERS * c;
};

export const isLocationWithinRadius = ({
  employerLat,
  employerLng,
  interviewLat,
  interviewLng,
  radiusInMeters,
}) => {
  const radius = Number(radiusInMeters);

  if (!Number.isFinite(radius) || radius < 0) {
    throw new Error("Radius must be a valid non-negative number in meters");
  }

  const distanceInMeters = calculateDistanceInMeters({
    lat1: employerLat,
    lng1: employerLng,
    lat2: interviewLat,
    lng2: interviewLng,
  });

  return {
    isWithinRadius: distanceInMeters <= radius,
  };
};

export default isLocationWithinRadius;
