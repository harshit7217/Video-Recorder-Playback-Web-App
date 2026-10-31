import * as maptilersdk from "@maptiler/sdk";
import { GeocodingControl } from "@maptiler/geocoding-control/maptilersdk";
import "@maptiler/sdk/dist/maptiler-sdk.css";
import Map from "./map/Map.jsx";

// maptilersdk.config.apiKey = "2RCcJHBK2Qc3uXYciKZa";

// const map = new maptilersdk.Map({
//   container: "map",
// });

// const gc = new GeocodingControl();

// map.addControl(gc);

const EmploymentPage = () => {
  return (
    <div>
      <Map />
    </div>
  );
};

export default EmploymentPage;
