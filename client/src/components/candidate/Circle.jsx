import RadiusStatus from "./RadiusStatus";

const Circle = ({
  mapRadiusStatus,
  radiusStatusStyles,
  mapRadiusStatusValue,
  ipRadiusStatus,
  ipRadiusStatusValue,
}) => {
  return (
    <div>
      {/* Map radius */}
      <RadiusStatus
        radiusStatus={mapRadiusStatus}
        radiusStatusStyles={radiusStatusStyles}
        radiusStatusValue={mapRadiusStatusValue}
        locationLabel="Map"
      />
      {/* IP Radius */}
      <RadiusStatus
        radiusStatus={ipRadiusStatus}
        radiusStatusStyles={radiusStatusStyles}
        radiusStatusValue={ipRadiusStatusValue}
        locationLabel="IP"
        outsideRadiusText="The IP location is not within the same radius as the map location"
        waitingForMap={mapRadiusStatus.loading}
      />
    </div>
  );
};

export default Circle;
