import { useState } from "react";
import { useWebSocketContext } from "../contexts/WebSocketContext";

export const DeviceControlPanel = () => {
  const { setDeviceCount, devices, startCharging, stopCharging } =
    useWebSocketContext();
  const [deviceCount, setLocalDeviceCount] = useState(20);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const count = parseInt(e.target.value);
    setLocalDeviceCount(count);
  };

  const handleSubmit = () => {
    setDeviceCount(deviceCount);
  };

  const handleStartAllCharging = () => {
    devices.forEach((device) => {
      startCharging(device.id);
    });
  };

  const handleStopAllCharging = () => {
    devices.forEach((device) => {
      stopCharging(device.id);
    });
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-xl font-semibold mb-4">Device Simulator Control</h2>
      <div className="space-y-4">
        <div>
          <label
            htmlFor="deviceCount"
            className="block text-sm font-medium text-gray-700"
          >
            Number of Simulated Devices: {deviceCount}
          </label>
          <input
            type="range"
            id="deviceCount"
            min="1"
            max="100"
            value={deviceCount}
            onChange={handleChange}
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer mt-2"
          />
        </div>
        <button
          onClick={handleSubmit}
          className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors hover:cursor-pointer"
        >
          Apply Changes
        </button>
        <div className="grid grid-cols-2 gap-4 mt-4 text-sm">
          <button
            onClick={handleStartAllCharging}
            className="bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 transition-colors hover:cursor-pointer"
          >
            Start Charging All
          </button>
          <button
            onClick={handleStopAllCharging}
            className="bg-red-600 text-white py-2 px-4 rounded-md hover:bg-red-700 transition-colors hover:cursor-pointer"
          >
            Stop Charging All
          </button>
        </div>
      </div>
    </div>
  );
};
