import { useEffect, useState } from "react";
import { Marker, Popup, useMapEvents } from "react-leaflet";

const LocationMarker = ({ position, setPosition }) => {
  const [locationName, setLocationName] = useState([]);
  const map = useMapEvents({
    click(e) {
      setPosition((prev) => [...prev, e.latlng]);
      //   map.locate();
    },
    // locationfound(e) {
    //   setPosition([e.latlng]);
    //   map.flyTo(e.latlng, map.getZoom());
    // },
  });

  const fetching = async () => {
    try {
      fetch(
        `https://nominatim.openstreetmap.org/reverse?lat=${position[position.length - 1].lat}&lon=${position[position.length - 1].lng}&format=jsonv2`,
      )
        .then((response) => response.json())
        .then((data) =>
          setLocationName((prev) => [...prev, data.display_name]),
        );
    } catch (err) {
      console.error(err);
    }
  };
  useEffect(() => {
    fetching();
  }, [position]);

  return position === null
    ? null
    : position.map((pos, index) => {
        return (
          <Marker key={index} position={[pos.lat, pos.lng]}>
            <Popup>{locationName[index]}</Popup>
          </Marker>
        );
      });
};

export default LocationMarker;
