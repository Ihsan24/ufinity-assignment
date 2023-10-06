import { useEffect, useState } from "react";
import { Select } from "antd";
import styles from "@/styles/Home.module.css";

export default function Home() {
  const [selectOptions, setSeletOptions] = useState([]);

  const onSetSelectOptions = (data) => {
    const arr = [];
    data.forEach((item) => {
      arr.push({
        value: item.camera_id,
        label: item.location.latitude + ", " + item.location.longitude,
      });
    });
    setSeletOptions(arr);
  };

  const onSelectLocationHandler = () => {};

  useEffect(() => {
    fetch(`https://api.data.gov.sg/v1/transport/traffic-images?date_time=2023-07-30T15:05:00`)
      .then((res) => res.json())
      .then((data) => {
        console.log("traffic images data: ", data);
        onSetSelectOptions(data.items[0].cameras);
      })
      .catch((error) => {
        console.log("traffic images data error: ", error);
      });

    fetch(`https://api.data.gov.sg/v1/environment/2-hour-weather-forecast?date_time=2023-07-30T15:05:00`)
      .then((res) => res.json())
      .then((data) => {
        console.log("weather forecast data: ", data);
      })
      .catch((error) => {
        console.log("weather forecast data error: ", error);
      });
  }, []);

  return (
    <>
      <h1>Ufinity Assignment</h1>
      <Select
        showSearch
        style={{
          width: 500,
        }}
        placeholder="select a location"
        onChange={onSelectLocationHandler}
        options={selectOptions}
        optionFilterProp="children"
        filterOption={(input, option) => (option?.label ?? "").includes(input)}
        filterSort={(optionA, optionB) => (optionA?.label ?? "").toLowerCase().localeCompare((optionB?.label ?? "").toLowerCase())}
      />
    </>
  );
}
