# SensorStream - Realtime Sensor Data Web Application

## Overview

SensorStream is a web application designed to display realtime sensor data from various sensors including MPU6050 (accelerometer and gyroscope), SW420 vibration sensor, and GPS. The application visualizes the sensor data using graphs and allows users to download the data in CSV format.

## Core Features

-   **Live Sensor Data:** Display live sensor data from MPU6050, SW420 vibration sensor, and GPS.
-   **Data Visualization:** Visualize sensor data using graphs: acceleration (x, y, z), gyroscope (x, y, z), rate of change of acceleration, and GPS coordinates (latitude, longitude).
-   **CSV Export:** Allow users to download all sensor data in CSV format.

## UI Style Guidelines

-   Primary color: Dark blue (#1A237E) for a professional and data-focused feel.
-   Secondary color: Light gray (#EEEEEE) for backgrounds and neutral elements.
-   Accent: Teal (#00ACC1) for interactive elements and data highlights.
-   Clean and responsive layout with clear sections for each sensor and its corresponding graph.
-   Use simple, recognizable icons to represent each sensor type and data dimension.
-   Subtle animations for graph updates and data loading to improve user experience.

## Project Structure

-   `.env`: Environment variables (API keys, etc.)
-   `.vscode/settings.json`: VS Code settings for the project.
-   `README.md`: Project documentation.
-   `components.json`: Configuration for ShadCN UI components.
-   `next.config.ts`: Next.js configuration.
-   `package.json`: Project dependencies and scripts.
-   `src/ai/`: Contains AI-related code (if any).
-   `src/app/`: Next.js App Router files (pages, layouts, etc.).
-   `src/components/ui/`: Reusable UI components built with ShadCN.
-   `src/hooks/`: Custom React hooks.
-   `src/lib/`: Utility functions.
-   `src/services/`: Data fetching and sensor-related services.
-   `tailwind.config.ts`: Tailwind CSS configuration.
-   `tsconfig.json`: TypeScript configuration.

## Arduino Code (ESP32)

Below is the Arduino code for the ESP32 that will send sensor data to the web application. Ensure that you have the necessary libraries installed in the Arduino IDE.

```arduino
#include <WiFi.h>
#include <HTTPClient.h>
#include <ArduinoJson.h> // Ensure you have this library installed

// WiFi credentials
const char* ssid = "your_SSID";
const char* password = "your_PASSWORD";

// Web app endpoint
const char* serverURL = "http://your_web_app_ip:9002/api/sensor_data"; // Replace with your web app's IP address and port

// Sensor pins
const int vibrationSensorPin = 4; // Example pin

// Variables for da/dt calculation
float prevAccel = 0;
unsigned long prevTime = 0;

void setup() {
    Serial.begin(115200);
    pinMode(vibrationSensorPin, INPUT);

    // WiFi connection
    WiFi.begin(ssid, password);
    while (WiFi.status() != WL_CONNECTED) {
        delay(1000);
        Serial.println("Connecting to WiFi...");
    }
    Serial.println("Connected to WiFi");
}

void loop() {
    // Simulate sensor data (replace with actual sensor readings)
    float accelX = random(0, 100) / 10.0;
    float accelY = random(0, 100) / 10.0;
    float accelZ = random(0, 100) / 10.0;
    float gyroX = random(0, 100) / 10.0;
    float gyroY = random(0, 100) / 10.0;
    float gyroZ = random(0, 100) / 10.0;
    bool isVibrating = digitalRead(vibrationSensorPin) == HIGH;
    float gpsLatitude = random(0, 100) / 10.0;
    float gpsLongitude = random(0, 100) / 10.0;

    // Compute total acceleration magnitude
    float totalAccel = sqrt(accelX * accelX + accelY * accelY + accelZ * accelZ);

    // Compute da/dt
    unsigned long currentTime = millis();
    float dt = (currentTime - prevTime) / 1000.0;
    float dadt = 0;
    if (dt > 0) {
        dadt = abs((totalAccel - prevAccel) / dt);
    }

    // Prepare JSON payload
    StaticJsonDocument<200> doc;
    doc["accelerometerX"] = accelX;
    doc["accelerometerY"] = accelY;
    doc["accelerometerZ"] = accelZ;
    doc["gyroscopeX"] = gyroX;
    doc["gyroscopeY"] = gyroY;
    doc["gyroscopeZ"] = gyroZ;
    doc["vibration"] = isVibrating;
    doc["gpsLatitude"] = gpsLatitude;
    doc["gpsLongitude"] = gpsLongitude;
    doc["dadt"] = dadt;

    String json;
    serializeJson(doc, json);

    // Send data to web app
    HTTPClient http;
    http.begin(serverURL);
    http.addHeader("Content-Type", "application/json");
    int httpResponseCode = http.POST(json);

    if (httpResponseCode > 0) {
        Serial.print("HTTP Response code: ");
        Serial.println(httpResponseCode);
    } else {
        Serial.print("Error sending data: ");
        Serial.println(httpResponseCode);
    }
    http.end();

    // Update previous values
    prevAccel = totalAccel;
    prevTime = currentTime;

    delay(5000); // Send data every 5 seconds
}
```

### Explanation:

1.  **Include Libraries**: Includes necessary libraries for WiFi, HTTP client, and JSON serialization.
2.  **WiFi Credentials**: Replace `your_SSID` and `your_PASSWORD` with your actual WiFi credentials.
3.  **Web App Endpoint**: Replace `http://your_web_app_ip:9002/api/sensor_data` with the actual IP address and port where your web application is running.
4.  **Sensor Pins**: Define the pins connected to your sensors.
5.  **da/dt Calculation**: Calculates the rate of change of acceleration using the provided formula.
6.  **JSON Payload**: Creates a JSON payload with the sensor data.
7.  **HTTP Request**: Sends the JSON payload to the web application using an HTTP POST request.

## API Endpoint (Next.js)

Create an API endpoint in your Next.js application to receive the sensor data from the ESP32.

1.  Create a file `src/app/api/sensor_data/route.ts` with the following content:

```typescript
import {NextResponse} from 'next/server';

export async function POST(request: Request) {
  try {
    const data = await request.json();

    // Log the received data (for debugging)
    console.log('Received sensor data:', data);

    // TODO: Process the sensor data (e.g., store it in a database)

    return NextResponse.json({message: 'Data received successfully'}, {status: 200});
  } catch (error) {
    console.error('Error processing sensor data:', error);
    return NextResponse.json({message: 'Failed to process data'}, {status: 500});
  }
}
```

### Explanation:

-   This code creates a POST endpoint at `/api/sensor_data` that receives the sensor data from the ESP32.
-   It logs the received data to the console (for debugging purposes).
-   It returns a JSON response with a success or error message.
-   **TODO**: You should replace the `// TODO: Process the sensor data` comment with your actual data processing logic (e.g., storing the data in a database).

## Setup

1.  **Clone the repository:**

    ```bash
    git clone [repository_url]
    cd [repository_name]
    ```

2.  **Install dependencies:**

    ```bash
    npm install
    ```

3.  **Set up environment variables:**

    -   Create a `.env` file in the root directory.
    -   Add the necessary environment variables (e.g., API keys, database credentials).

        ```
        GOOGLE_GENAI_API_KEY=YOUR_API_KEY
        ```

4.  **Run the development server:**

    ```bash
    npm run dev
    ```

    Open your browser and navigate to `http://localhost:9002` to view the application.

## Deployment

To deploy the application, you can use platforms like Vercel, Netlify, or Firebase Hosting. Follow the deployment instructions provided by the respective platforms.

## Contributing

Contributions are welcome! Please feel free to submit pull requests or open issues to suggest improvements or report bugs.
