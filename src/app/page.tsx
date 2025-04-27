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

const data = [
  {name: 'Jan', uv: 400, pv: 2400, amt: 2400},
  {name: 'Feb', uv: 300, pv: 1398, amt: 2210},
  {name: 'Mar', uv: 200, pv: 9800, amt: 2290},
  {name: 'Apr', uv: 278, pv: 3908, amt: 2000},
  {name: 'May', uv: 189, pv: 4800, amt: 2181},
  {name: 'Jun', uv: 239, pv: 3800, amt: 2500},
  {name: 'Jul', uv: 349, pv: 4300, amt: 2100},
];

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
              <p>
                Da/dt:{accelerationChange}
              </p>
              <ResponsiveContainer width="100%" height={200}>
                <AreaChart
                  data={data}
                  margin={{top: 10, right: 30, left: 0, bottom: 0}}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Area type="monotone" dataKey="pv" stroke="#8884d8" fill="#8884d8" />
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
                  data={data}
                  margin={{top: 10, right: 30, left: 0, bottom: 0}}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Area type="monotone" dataKey="uv" stroke="#82ca9d" fill="#82ca9d" />
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
                  data={data}
                  margin={{top: 10, right: 30, left: 0, bottom: 0}}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Area type="monotone" dataKey="amt" stroke="#ffc658" fill="#ffc658" />
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
                  data={data}
                  margin={{top: 10, right: 30, left: 0, bottom: 0}}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Area type="monotone" dataKey="pv" stroke="#a458ff" fill="#a458ff" />
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
