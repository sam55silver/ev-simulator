import { useState } from "react";
import { useWebSocketContext } from "../contexts/WebSocketContext";

export const DeviceControlPanel = () => {
  const { setDeviceCount } = useWebSocketContext();
  const [deviceCount, setLocalDeviceCount] = useState(20);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const count = parseInt(e.target.value);
    setLocalDeviceCount(count);
  };

  const handleSubmit = () => {
    setDeviceCount(deviceCount);
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
          className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors"
        >
          Apply Changes
        </button>
      </div>
    </div>
  );
};
