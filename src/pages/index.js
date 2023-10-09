import { useEffect, useRef, useState } from "react";
import { Select, Image, Space, DatePicker, TimePicker, Button } from "antd";
import dayjs from "dayjs";
import { isEmpty, get } from "lodash";
import styles from "@/styles/Home.module.css";

export default function Home() {
  const [selectedDate, setSelectedDate] = useState(dayjs().format("YYYY-MM-DD"));
  const [selectedTime, setSelectedTime] = useState(dayjs().format("HH:mm:ss"));
  const [trafficImgData, setTrafficImgData] = useState([]);
  const [selectedData, setSelectedData] = useState("");
  const [locationSelectOptions, setLocationSelectOptions] = useState([]);
  const [geocodeData, setGeocodeData] = useState([]);

  const resetData = () => {
    setTrafficImgData([]);
    setLocationSelectOptions([]);
    setSelectedData("");
  };

  const onSelectLocationHandler = (val) => {
    const obj = trafficImgData.find((x) => x.camera_id === val);
    console.log('obj: ', obj);
    if (obj) setSelectedData(obj);
  };

  const onReverseGeocode = async (items) => {
    const arr = [...items];
    const result = [];

    for (let i = 0; i < arr.length; i++) {
      try {
        const response = await fetch(
          `https://geocode.maps.co/reverse?lat=${items[i].location.latitude}&lon=${items[i].location.longitude}`,
          {
            method: "GET",
            headers: {
              accept: "application/json",
            },
          }
        );

        const data = await response.json();
        result.push({
          latlongStr: items[i].location.latitude + "," + items[i].location.longitude,
          lat: data.lat,
          lon: data.lon,
          address: data.address,
          display_name: data.display_name,
          place_id: data.place_id,
        });
      } catch (error) {
        // return { lat: item.location.latitude, lon: item.location.longitude, isFetchError: true };
        // console.log("catch error: ", error);
      }
    }
    setGeocodeData([...geocodeData, ...result]);
  };

  const onCheckGeocode = (data) => {
    const result = data.filter(
      (item) => !geocodeData.some((geoItem) => geoItem.latlongStr === item.location.latitude + "," + item.location.longitude)
    );
    onReverseGeocode(result);
  };

  const onGetTrafficImgHandler = () => {
    resetData();

    fetch(`https://api.data.gov.sg/v1/transport/traffic-images?date_time=${selectedDate}T${selectedTime}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.items[0]?.cameras) {
          onCheckGeocode(data.items[0].cameras);
          setTrafficImgData(data.items[0].cameras);
        } else {
          //display no data found
        }
      })
      .catch((error) => {
        console.log("traffic images data error: ", error);
      });
  };

  useEffect(() => {
    fetch(`https://api.data.gov.sg/v1/environment/2-hour-weather-forecast?date_time=2023-07-30T15:05:00`)
      .then((res) => res.json())
      .then((data) => {
        console.log("weather forecast data: ", data);
      })
      .catch((error) => {
        console.log("weather forecast data error: ", error);
      });
  }, []);

  useEffect(() => {
    let options = [];
    const result = trafficImgData.map((item) => {
      const data = geocodeData.find((geoItem) => geoItem.latlongStr === item.location.latitude + "," + item.location.longitude);
      if (data) {
        options.push({
          value: item.camera_id,
          label: data.display_name,
          image_metadata: item.image_metadata,
        });
      }
      return { ...item, geocode: data };
    });

    setLocationSelectOptions(options);//for select dropdown options
    setTrafficImgData(result);//setState again with geocode data
  }, [geocodeData]);

  return (
    <>
      <h1>Ufinity Assignment</h1>
      <Space>
        <DatePicker onChange={(val) => setSelectedDate(dayjs(val).format("YYYY-MM-DD"))} />
        <TimePicker onChange={(val) => setSelectedTime(dayjs(val).format("HH:mm:ss"))} />
        <Button type="primary" onClick={onGetTrafficImgHandler}>
          Search
        </Button>
      </Space>
      <div>
        <Select
          showSearch={true}
          style={{
            width: 500,
          }}
          placeholder="select a location"
          onChange={onSelectLocationHandler}
          options={locationSelectOptions}
          optionFilterProp="children"
          filterOption={(input, option) => (option?.label ?? "").includes(input)}
          filterSort={(optionA, optionB) => (optionA?.label ?? "").toLowerCase().localeCompare((optionB?.label ?? "").toLowerCase())}
        />
      </div>

      {selectedData && (
        <div>
          <Image width={selectedData.image_metadata?.width < 600 ? selectedData.image_metadata.width : 600} src={selectedData.image} />
        </div>
      )}
    </>
  );
}
