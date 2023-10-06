import { useEffect } from "react";
import styles from "@/styles/Home.module.css";

export default function Home() {
  useEffect(() => {
    fetch(`https://api.data.gov.sg/v1/transport/traffic-images?date_time=2023-07-30T15:05:00`)
      .then((res) => res.json())
      .then((data) => console.log("traffic images data: ", data))
      .catch((error) => {
        console.log("traffic images data error: ");
      });

    fetch(`https://api.data.gov.sg/v1/environment/2-hour-weather-forecast?date_time=2023-07-30T15:05:00`)
      .then((res) => res.json())
      .then((data) => console.log("traffic images data: ", data))
      .catch((error) => {
        console.log("traffic images data error: ");
      });
  }, []);

  return (
    <>
      <h1>Ufinity Assignment</h1>
    </>
  );
}
