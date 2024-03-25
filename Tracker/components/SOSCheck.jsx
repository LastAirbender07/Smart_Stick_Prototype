import { Text, View, Alert, TouchableOpacity, Dimensions } from 'react-native'
import React, { useState } from 'react'
import axios from 'axios'
import { LineChart } from 'react-native-chart-kit';


const SOSCheck = () => {
  const [sosValue, setSosValue] = useState(0);

    const checkSOSTrigger = async () => {
    try {
        const response = await axios.get('https://abx2.blynk.cloud/external/api/get?token=xxxxxxxxxxxxx&v1');
        console.log('response:', response.data);
        setSosValue(response.data);

        if (response.data === 1) {
        console.log('SOS Triggered! The blind person is in danger.');
        Alert.alert('SOS Triggered!', 'The blind person is in danger.');
        } else {
        console.log('No SOS trigger.');
        }
    } catch (error) {
        console.error('Error checking SOS trigger:', error.message);
    }
    };
    const startPeriodicCheck = () => {
    const interval = 1 * 60 * 1000; 
    setInterval(checkSOSTrigger, interval);
    };

    startPeriodicCheck();

    // Ultrasonic Visualization
    const [sensorData, setSensorData] = useState([]);

    const fetchSensorData = async () => {
        try {
            const response = await axios.get('http://api.thingspeak.com/channels/123456/fields/1.json?api_key=xxxxxxxxx&results=2');
            const data = response.data;
            const { feeds } = data;
            const values = feeds.map(feed => {
              const date = new Date(feed.created_at);
              const formattedTime = date.toLocaleString();
              return { value: feed.field1, time: formattedTime };
          });
            console.log('Sensor data:', values);
            setSensorData(values);
        } catch (error) {
            console.error('Error fetching sensor data:', error.message);
            setSensorData([]);
        }
    };

    // Control SOS Trigger
    const handleSosButtonClick = async () => {
      const newSosValue = sosValue === 0 ? 1 : 0;
      setSosValue(newSosValue);
      try {
        await axios.get(`https://abc2.blynk.cloud/external/api/update?token=xxxxxxxxxx&v1=${newSosValue}`);
      } catch (error) {
        console.error('Error updating SOS value:', error.message);
      }
    };

    const chartData = {
      labels: sensorData.map(feed => feed.time),
      datasets: [
        {
          data: sensorData.map(feed => parseFloat(feed.value))
        }
      ]
    };

    const chartConfig = {
      backgroundGradientFrom: '#ffffff',
      backgroundGradientFromOpacity: 1,
      backgroundGradientTo: '#ffffff',
      backgroundGradientToOpacity: 1,
      color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
      strokeWidth: 2,
      barPercentage: 0.5,
      useShadowColorFromDataset: false
    };

  return (
    <View className="w-full h-full flex-1 justify-center items-center">
      <View>
        {sensorData.length > 0 &&
      <LineChart
              data={chartData}
              width={Dimensions.get('window').width}
              height={220}
              chartConfig={chartConfig}
            />
          }
      </View>
      <TouchableOpacity className="w-30 h-10 p-2 rounded-md bg-slate-300 " onPress={fetchSensorData}>
        <Text className="text-black font-semibold text-base">Ultrasonic data</Text>
      </TouchableOpacity>
      <TouchableOpacity
        className={`w-30 h-10 p-2 rounded-md ${sosValue === 0 ? 'bg-green-500' : 'bg-red-500'}`}
        onPress={handleSosButtonClick}
      >
        <Text className="text-black font-semibold text-lg">{sosValue === 0 ? 'SOS OFF' : 'SOS ON'}</Text>
      </TouchableOpacity>
      <View>
        {sensorData.length > 0 &&
            sensorData.map((entry, index) => (
              <View key={index} className="my-2">
                <Text className="text-sm">Value: {entry.value}</Text>
                <Text className="text-sm">Time: {entry.time}</Text>
              </View>
            ))
        }
        {sensorData.length === 0 && <Text>No sensor data available</Text>}
      </View>
    </View>
  )
}

export default SOSCheck
