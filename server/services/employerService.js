export const employerDetails = (locationList) => {
  return locationList.map(({ _id, employerId, lat, lng, radius, name }) => ({
    _id,
    employerId,
    lat,
    lng,
    radius,
    name,
  }));
};

export const updatedRadius = (locationDetails) => {
  if (!locationDetails) return null;

  const { _id, employerId, radius } = locationDetails;
  return { _id, employerId, radius };
};
