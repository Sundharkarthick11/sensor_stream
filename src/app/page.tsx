'use client';

import {useEffect, useState} from 'react';
import {
  AccelerometerData,
  getAcceleration,
} from '@/services/accelerometer';
import {
  GyroscopeData,
  getGyroscopeData,
} from '@/services/gyroscope';
import {Location, getCurrentLocation} from '@/services/gps';
import {
  VibrationData,
  getVibrationData,
} from '@/services/vibration';
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from '@/components/ui/card';
import {Grid} from '@/components/ui/grid';
import {Download, RefreshCw} from 'lucide-react';
import {Button} from '@/components/ui/button';
import {toast} from '@/hooks/use-toast';
import {useToast} from '@/hooks/use-toast';
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import {Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow} from '@/components/ui/table';

interface SensorData {
  timestamp: number;
  accelerometerX: number;
  accelerometerY: number;
  accelerometerZ: number;
  gyroscopeX: number;
  gyroscopeY: number;
  gyroscopeZ: number;
  vibration: boolean;
  gpsLatitude: number;
  gpsLongitude: number;
  dadt: number;
}
export default function Home() {
  const [accelerometerData, setAccelerometerData] = useState<AccelerometerData>({
    x: 0,
    y: 0,
    z: 0,
  });
  const [gyroscopeData, setGyroscopeData] = useState<GyroscopeData>({
    x: 0,
    y: 0,
    z: 0,
  });
  const [vibrationData, setVibrationData] = useState<VibrationData>({
    isVibrating: false,
  });
  const [gpsData, setGpsData] = useState<Location>({
    latitude: 0,
    longitude: 0,
  });

  const [prevAccelerometerData, setPrevAccelerometerData] = useState<AccelerometerData>({
    x: 0,
    y: 0,
    z: 0,
  });
  const [accelerationChange, setAccelerationChange] = useState<number>(0);
  const [prevTime, setPrevTime] = useState<number>(0);
  const [prevAccel, setPrevAccel] = useState<number>(0);

  const [sensorDataList, setSensorDataList] = useState<SensorData[]>([]);

  const {toast} = useToast();

  const refreshSensorData = async () => {
    try {
      const acceleration = await getAcceleration();
      const gyroscope = await getGyroscopeData();
      const vibration = await getVibrationData();
      const gps = await getCurrentLocation();

      const accelX = acceleration.x;
      const accelY = acceleration.y;
      const accelZ = acceleration.z;

      // Compute total acceleration magnitude
      const totalAccel = Math.sqrt(accelX * accelX + accelY * accelY + accelZ * accelZ);

      // Compute da/dt
      const currentTime = Date.now();
      const dt = (currentTime - prevTime) / 1000.0;
      let dadt = 0;
      if (dt > 0) {
        dadt = Math.abs((totalAccel - prevAccel) / dt);
      }

      setAccelerometerData(acceleration);
      setGyroscopeData(gyroscope);
      setVibrationData(vibration);
      setGpsData(gps);
      setAccelerationChange(dadt);

      setPrevAccelerometerData(acceleration);
      setPrevTime(currentTime);
      setPrevAccel(totalAccel);

      setSensorDataList(prevList => [
        {
          timestamp: currentTime,
          accelerometerX: acceleration.x,
          accelerometerY: acceleration.y,
          accelerometerZ: acceleration.z,
          gyroscopeX: gyroscope.x,
          gyroscopeY: gyroscope.y,
          gyroscopeZ: gyroscope.z,
          vibration: vibration.isVibrating,
          gpsLatitude: gps.latitude,
          gpsLongitude: gps.longitude,
          dadt: dadt,
        },
        ...prevList,
      ]);
    } catch (error: any) {
      toast({
        title: 'Error refreshing sensor data',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  useEffect(() => {
    // Initial sensor data refresh
    refreshSensorData();

    // Refresh sensor data every 5 seconds
    const intervalId = setInterval(refreshSensorData, 5000);

    // Clean up the interval when the component unmounts
    return () => clearInterval(intervalId);
  }, [prevAccelerometerData]);

  const downloadCSV = () => {
    // Implement CSV download logic here
    toast({
      title: 'Downloading CSV...',
      description: 'CSV download will start shortly.',
    });
  };

  const formatXAxis = (tickItem: any) => {
    const date = new Date(tickItem);
    return date.toLocaleTimeString(); // Format the timestamp to time
  };

  const transformDataForChart = (sensorDataList: SensorData[], dataKey: keyof SensorData) => {
    return sensorDataList.map(data => ({
      timestamp: data.timestamp,
      value: data[dataKey],
    }));
  };

  const accelerometerDataForChartX = transformDataForChart(sensorDataList, 'accelerometerX');
  const accelerometerDataForChartY = transformDataForChart(sensorDataList, 'accelerometerY');
  const accelerometerDataForChartZ = transformDataForChart(sensorDataList, 'accelerometerZ');
  const gyroscopeDataForChartX = transformDataForChart(sensorDataList, 'gyroscopeX');
  const gyroscopeDataForChartY = transformDataForChart(sensorDataList, 'gyroscopeY');
  const gyroscopeDataForChartZ = transformDataForChart(sensorDataList, 'gyroscopeZ');
  const dadtDataForChart = transformDataForChart(sensorDataList, 'dadt');
  const gpsLatitudeDataForChart = transformDataForChart(sensorDataList, 'gpsLatitude');
  const gpsLongitudeDataForChart = transformDataForChart(sensorDataList, 'gpsLongitude');

  return (
    <div className="flex flex-col min-h-screen bg-secondary p-6">
      <header className="mb-8">
        <h1 className="text-3xl font-semibold text-primary">
          SensorStream
        </h1>
        <p className="text-muted-foreground">
          Realtime data from your sensors
        </p>
      </header>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold text-primary mb-4">
          Live Sensor Data
        </h2>
        <Grid>
          <Card>
            <CardHeader>
              <CardTitle>Accelerometer</CardTitle>
              <CardDescription>
                Realtime acceleration data
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p>X: {accelerometerData.x}</p>
              <p>Y: {accelerometerData.y}</p>
              <p>Z: {accelerometerData.z}</p>
              <ResponsiveContainer width="100%" height={200}>
                <AreaChart
                  data={accelerometerDataForChartX}
                  margin={{top: 10, right: 30, left: 0, bottom: 0}}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="timestamp" tickFormatter={formatXAxis} />
                  <YAxis />
                  <Tooltip labelFormatter={(time) => new Date(time).toLocaleTimeString()}/>
                  <Area type="monotone" dataKey="value" stroke="#8884d8" fill="#8884d8" />
                </AreaChart>
              </ResponsiveContainer>
              <ResponsiveContainer width="100%" height={200}>
                <AreaChart
                  data={accelerometerDataForChartY}
                  margin={{top: 10, right: 30, left: 0, bottom: 0}}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="timestamp" tickFormatter={formatXAxis} />
                  <YAxis />
                  <Tooltip labelFormatter={(time) => new Date(time).toLocaleTimeString()}/>
                  <Area type="monotone" dataKey="value" stroke="#8884d8" fill="#8884d8" />
                </AreaChart>
              </ResponsiveContainer>
              <ResponsiveContainer width="100%" height={200}>
                <AreaChart
                  data={accelerometerDataForChartZ}
                  margin={{top: 10, right: 30, left: 0, bottom: 0}}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="timestamp" tickFormatter={formatXAxis} />
                  <YAxis />
                  <Tooltip labelFormatter={(time) => new Date(time).toLocaleTimeString()}/>
                  <Area type="monotone" dataKey="value" stroke="#8884d8" fill="#8884d8" />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Gyroscope</CardTitle>
              <CardDescription>Realtime gyroscope data</CardDescription>
            </CardHeader>
            <CardContent>
              <p>X: {gyroscopeData.x}</p>
              <p>Y: {gyroscopeData.y}</p>
              <p>Z: {gyroscopeData.z}</p>
              <ResponsiveContainer width="100%" height={200}>
                <AreaChart
                  data={gyroscopeDataForChartX}
                  margin={{top: 10, right: 30, left: 0, bottom: 0}}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="timestamp" tickFormatter={formatXAxis} />
                  <YAxis />
                  <Tooltip labelFormatter={(time) => new Date(time).toLocaleTimeString()}/>
                  <Area type="monotone" dataKey="value" stroke="#82ca9d" fill="#82ca9d" />
                </AreaChart>
              </ResponsiveContainer>
              <ResponsiveContainer width="100%" height={200}>
                <AreaChart
                  data={gyroscopeDataForChartY}
                  margin={{top: 10, right: 30, left: 0, bottom: 0}}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="timestamp" tickFormatter={formatXAxis} />
                  <YAxis />
                  <Tooltip labelFormatter={(time) => new Date(time).toLocaleTimeString()}/>
                  <Area type="monotone" dataKey="value" stroke="#82ca9d" fill="#82ca9d" />
                </AreaChart>
              </ResponsiveContainer>
              <ResponsiveContainer width="100%" height={200}>
                <AreaChart
                  data={gyroscopeDataForChartZ}
                  margin={{top: 10, right: 30, left: 0, bottom: 0}}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="timestamp" tickFormatter={formatXAxis} />
                  <YAxis />
                  <Tooltip labelFormatter={(time) => new Date(time).toLocaleTimeString()}/>
                  <Area type="monotone" dataKey="value" stroke="#82ca9d" fill="#82ca9d" />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Vibration Sensor</CardTitle>
              <CardDescription>
                Realtime vibration data
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p>
                Vibrating: {vibrationData.isVibrating ? 'Yes' : 'No'}
              </p>
              <ResponsiveContainer width="100%" height={200}>
                <AreaChart
                  data={[]}
                  margin={{top: 10, right: 30, left: 0, bottom: 0}}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="timestamp" tickFormatter={formatXAxis} />
                  <YAxis />
                  <Tooltip labelFormatter={(time) => new Date(time).toLocaleTimeString()}/>
                  <Area type="monotone" dataKey="value" stroke="#ffc658" fill="#ffc658" />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>GPS</CardTitle>
              <CardDescription>Realtime GPS data</CardDescription>
            </CardHeader>
            <CardContent>
              <p>Latitude: {gpsData.latitude}</p>
              <p>Longitude: {gpsData.longitude}</p>
               <ResponsiveContainer width="100%" height={200}>
                <AreaChart
                  data={gpsLatitudeDataForChart}
                  margin={{top: 10, right: 30, left: 0, bottom: 0}}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="timestamp" tickFormatter={formatXAxis} />
                  <YAxis />
                  <Tooltip labelFormatter={(time) => new Date(time).toLocaleTimeString()}/>
                  <Area type="monotone" dataKey="value" stroke="#a458ff" fill="#a458ff" />
                </AreaChart>
              </ResponsiveContainer>
               <ResponsiveContainer width="100%" height={200}>
                <AreaChart
                  data={gpsLongitudeDataForChart}
                  margin={{top: 10, right: 30, left: 0, bottom: 0}}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="timestamp" tickFormatter={formatXAxis} />
                  <YAxis />
                  <Tooltip labelFormatter={(time) => new Date(time).toLocaleTimeString()}/>
                  <Area type="monotone" dataKey="value" stroke="#a458ff" fill="#a458ff" />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Acceleration Rate of Change (Da/dt)</CardTitle>
              <CardDescription>Realtime change in acceleration</CardDescription>
            </CardHeader>
            <CardContent>
              <p>Da/dt: {accelerationChange}</p>
              <ResponsiveContainer width="100%" height={200}>
                <AreaChart
                  data={dadtDataForChart}
                  margin={{top: 10, right: 30, left: 0, bottom: 0}}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="timestamp" tickFormatter={formatXAxis} />
                  <YAxis />
                  <Tooltip labelFormatter={(time) => new Date(time).toLocaleTimeString()}/>
                  <Area type="monotone" dataKey="value" stroke="#ffc658" fill="#ffc658" />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>
      </section>
      <section className="mb-8">
        <h2 className="text-2xl font-semibold text-primary mb-4">
          Sensor Data Table
        </h2>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Timestamp</TableHead>
              <TableHead>Accelerometer X</TableHead>
              <TableHead>Accelerometer Y</TableHead>
              <TableHead>Accelerometer Z</TableHead>
              <TableHead>Gyroscope X</TableHead>
              <TableHead>Gyroscope Y</TableHead>
              <TableHead>Gyroscope Z</TableHead>
              <TableHead>Vibration</TableHead>
              <TableHead>GPS Latitude</TableHead>
              <TableHead>GPS Longitude</TableHead>
              <TableHead>Da/dt</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sensorDataList.map((data) => (
              <TableRow key={data.timestamp}>
                <TableCell>{new Date(data.timestamp).toLocaleString()}</TableCell>
                <TableCell>{data.accelerometerX}</TableCell>
                <TableCell>{data.accelerometerY}</TableCell>
                <TableCell>{data.accelerometerZ}</TableCell>
                <TableCell>{data.gyroscopeX}</TableCell>
                <TableCell>{data.gyroscopeY}</TableCell>
                <TableCell>{data.gyroscopeZ}</TableCell>
                <TableCell>{data.vibration ? 'Yes' : 'No'}</TableCell>
                <TableCell>{data.gpsLatitude}</TableCell>
                <TableCell>{data.gpsLongitude}</TableCell>
                <TableCell>{data.dadt}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </section>

      <footer className="flex justify-between items-center">
        <Button
          variant="outline"
          onClick={refreshSensorData}
          className="gap-2"
        >
          <RefreshCw className="h-4 w-4" />
          Refresh Data
        </Button>
        <Button onClick={downloadCSV} className="bg-accent text-white hover:bg-accent-foreground gap-2">
          <Download className="h-4 w-4" />
          Download CSV
        </Button>
      </footer>
    </div>
  );
}
