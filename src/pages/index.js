import { useEffect, useState } from "react";
import { Layout, Col, Row, Select, Image, Space, DatePicker, TimePicker, Button, Card } from "antd";
import dayjs from "dayjs";

const { Meta } = Card;
const { Content } = Layout;

export default function Home() {
  const [selectedDate, setSelectedDate] = useState(dayjs().format("YYYY-MM-DD"));
  const [selectedTime, setSelectedTime] = useState(dayjs().format("HH:mm:ss"));
  const [trafficImgData, setTrafficImgData] = useState([]);
  const [selectedData, setSelectedData] = useState("");
  const [locationSelectOptions, setLocationSelectOptions] = useState([]);
  const [geocodeData, setGeocodeData] = useState([]);
  const [forecastData, setForecastData] = useState([]);
  const [selectedForecast, setSelectedForecast] = useState("");
  const [loading, setLoading] = useState(false);

  const resetData = () => {
    setTrafficImgData([]);
    setSelectedData("");
    setLocationSelectOptions([]);
    setForecastData([]);
    setSelectedForecast("");
  };

  const onSelectForecast = (obj) => {
    const val = forecastData.find((x) => x.area === obj.geocode.address.suburb);
    if (val) setSelectedForecast(val);
  };

  const onSelectLocationHandler = (val) => {
    const obj = trafficImgData.find((x) => x.camera_id === val);
    if (obj) {
      onSelectForecast(obj);
      setSelectedData(obj);
    }
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
    //geocodeData to remain as long the page is not unmounted
    //prevent unnecessary reverseGeocode api call
  };

  const onCheckGeocode = (data) => {
    const result = data.filter(
      (item) => !geocodeData.some((geoItem) => geoItem.latlongStr === item.location.latitude + "," + item.location.longitude)
    );
    onReverseGeocode(result); //on call api for those does not exist in geocodeData
  };

  const onGetTrafficImgHandler = () => {
    fetch(`https://api.data.gov.sg/v1/transport/traffic-images?date_time=${selectedDate}T${selectedTime}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.items[0]?.cameras) {
          onCheckGeocode(data.items[0].cameras);
          setTrafficImgData(data.items[0].cameras);
        } else {
          console.log("trafficImg api NO Data");
        }
      })
      .catch((error) => {
        console.log("traffic images data error: ", error);
      });
  };

  const onGetForecastHandler = () => {
    fetch(`https://api.data.gov.sg/v1/environment/2-hour-weather-forecast?date_time=${selectedDate}T${selectedTime}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.items[0]?.forecasts) {
          setForecastData(data.items[0].forecasts);
        } else {
          console.log("forecast api NO Data");
        }
      })
      .catch((error) => {
        console.log("weather forecast data error: ", error);
      });
  };

  const onSearchHanlder = () => {
    resetData();

    setLoading(true);
    onGetForecastHandler();
    onGetTrafficImgHandler();
  };

  useEffect(() => {
    setLoading(false); //geocodeData will always update even if no api call @onReverseGeocode
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

    setLocationSelectOptions(options); //for select dropdown options
    setTrafficImgData(result); //setState again with geocode data
  }, [geocodeData]);

  return (
    <Content
      className="site-layout"
      style={{
        maxWidth: "1024px",
        margin: "auto",
      }}
    >
      <Row justify="center" align="middle" gutter={16}>
        <Col xl={18} xs={24}>
          <Card>
            <h1 style={{ textAlign: "center" }}>Ufinity Assignment</h1>

            <Space.Compact block size="medium">
              <DatePicker
                style={{ width: "38%" }}
                defaultValue={dayjs()}
                format={"YYYY-MM-DD"}
                onChange={(val) => setSelectedDate(dayjs(val).format("YYYY-MM-DD"))}
              />
              <TimePicker
                style={{ width: "38%" }}
                defaultValue={dayjs()}
                format={"HH:mm:ss"}
                onChange={(val) => setSelectedTime(dayjs(val).format("HH:mm:ss"))}
              />
              <Button style={{ width: "24%" }} type="primary" onClick={onSearchHanlder} loading={loading}>
                Search
              </Button>
            </Space.Compact>
            <div>
              <Select
                style={{ width: "100%", marginTop: "15px" }}
                size="large"
                showSearch={true}
                placeholder="select a location"
                onChange={onSelectLocationHandler}
                options={locationSelectOptions}
                optionFilterProp="children"
                filterOption={(input, option) => (option?.label ?? "").includes(input)}
                filterSort={(optionA, optionB) => (optionA?.label ?? "").toLowerCase().localeCompare((optionB?.label ?? "").toLowerCase())}
              />
            </div>
            <div style={{ textAlign: "center", marginTop: "15px" }}>
              <Image
                style={{ width: selectedData.image_metadata?.width < '100%' ? selectedData.image_metadata.width : '100%', maxWidth: "100%" }}
                src={selectedData.image}
              />
            </div>
          </Card>
        </Col>
        <Col xl={6} xs={24}>
          <Card title="Weather Forecast" style={{ width: 240, margin: "15px auto" }}>
            <Meta title={selectedForecast.area} description={selectedForecast.forecast || "no data"} />
          </Card>
        </Col>
      </Row>
    </Content>
  );
}
