export const employerDetails = (locationList) => {
  return locationList.map(({ _id, lat, lng, radius, name }) => ({
    _id,
    lat,
    lng,
    radius,
    name,
  }));
};

export const updatedRadius = (locationDetails) => {
  if (!locationDetails) return null;

  const { _id, radius } = locationDetails;
  return { _id, radius };
};
