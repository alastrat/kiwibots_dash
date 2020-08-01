import React, { useState, useCallback, useEffect } from "react";
import Delivery from "components/Delivery";
import Maps from "components/Maps";
import styles from "./styles/main.module.css";
import { Marker } from "google-maps-react";
import { house, restaurant } from "assets/images";
import dayMode from "assets/svg/day-mode.svg";
import nightModeSVG from "assets/svg/night-mode.svg";

const _data = {
  id: "238562b9-4e34-4611-b973-51bfe960c093",
  external_id: "mac-123",
  quote_id: "50e2343e-3b60-4c95-8577-99c2c0f2583d",
  requester_id: "0f7bab7e-c232-463d-a6aa-7eadab889d72",
  worker_id: "kiwibot263",
  pickup: {
    lat: 37.3335189,
    lon: -121.8851394,
    street: "118 Paseo de San Antonio Walk",
    city: "San Jose",
    state: "CA",
    country: "US",
    postal_code: "95112",
    instructions: "Use the front door",
    phone_number: null,
    email: null,
    name: null,
  },
  dropoff: {
    lat: 37.3354928,
    lon: -121.8862949,
    street: "130 E San Fernando St",
    city: "San Jose",
    state: "CA",
    country: "US",
    postal_code: "95112",
    instructions: "Use the front door",
    phone_number: "+573143799762",
    email: "af.rosero225@gmail.com",
    name: null,
  },
  created_at: "2020-07-31T02:46:10.518572+00:00",
  estimated_pickup_at: "2020-07-31T02:56:00.050955+00:00",
  estimated_delivery_at: "2020-07-31T03:01:56.050955+00:00",
  estimated_distance: 338.6,
  estimated_duration: 356.0,
  fare: 3.7592999999999996,
  manifest: {
    description: "Mc Donald's order",
    items: [
      { name: "McNuggets", quantity: 1 },
      { name: "Coke", quantity: 1 },
    ],
    value: null,
  },
  status: "assigned",
  status_history: {
    pending: "2020-07-31T02:46:10.518572+00:00",
    assigned: "2020-07-31T02:47:54.601112+00:00",
    arriving_pickup: null,
    at_pickup: null,
    in_transit: null,
    arriving_dropoff: null,
    at_dropoff: null,
    delivered: null,
    canceled: null,
    compromised: "2020-07-31T02:50:54.601112+00:00",
  },
  tip: null,
};

function Main() {
  const [data, setData] = useState({});
  const [mapCenter, setMapCenter] = useState();
  const [nightMode, setNightMode] = useState(false);
  const onMapReady = useCallback(() => {
    const tout = setTimeout(() => {
      if (data.pickup) {
        setMapCenter({
          lat: data.pickup.lat,
          lng: data.pickup.lon,
        });
        clearTimeout(tout);
      }
    }, 500);
  }, [data.pickup]);
  const handleModeToggle = useCallback(() => {
    setNightMode((mode) => !mode);
  }, []);

  useEffect(() => {
    (async function init() {
      try {
        const newData = await fetch(
          "https://api.business.kiwibot.com/v1/requesters/0f7bab7e-c232-463d-a6aa-7eadab889d72/deliveries/238562b9-4e34-4611-b973-51bfe960c093?key=AIzaSyAEU_rnvnPVf1FkSLl6a_Pumniuv0EgoJc",
          {
            method: "GET",
          }
        ).then((f) => {
          if (f.ok) {
            return f.json();
          } else {
            throw Error("Something went wrong");
          }
        });
        console.log({ newData });
        setData(newData);
        setMapCenter({
          lat: newData.pickup.lat,
          lng: newData.pickup.lon,
        });
      } catch (error) {
        console.error({ error });
      }
    })();
  }, []);

  return (
    <div className={styles["main-container"]}>
      <button className={styles["button-map-mode"]} onClick={handleModeToggle}>
        <img src={nightMode ? dayMode : nightModeSVG} alt="mode-style" />
      </button>
      <Delivery className={styles["float-delivery"]} {...data} />
      <Maps onReady={onMapReady} center={mapCenter} night={nightMode}>
        {data.pickup && (
          <Marker
            position={{ lat: data.pickup.lat, lng: data.pickup.lon }}
            icon={{ url: restaurant }}
          />
        )}
        {data.dropoff && (
          <Marker
            position={{ lat: data.dropoff.lat, lng: data.dropoff.lon }}
            icon={{ url: house }}
          />
        )}
      </Maps>
    </div>
  );
}

export default Main;
