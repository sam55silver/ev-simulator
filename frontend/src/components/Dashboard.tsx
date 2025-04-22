import { useWebSocket } from "../contexts/WebSocketContext";

export const Dashboard = () => {
  const { devices, startCharging, stopCharging } = useWebSocket();

  const getStatusColor = (status: string) => {
    switch (status) {
      case "charging":
        return "bg-green-500";
      case "idle":
        return "bg-yellow-500";
      case "offline":
        return "bg-red-500";
      default:
        return "bg-gray-500";
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-xl font-semibold mb-4">Connected Devices</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {devices.map((device) => (
          <div
            key={device.id}
            className="border rounded-lg p-4 hover:shadow-md transition-shadow"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="font-medium">Device {device.id}</span>
              <div
                className={`h-3 w-3 rounded-full ${getStatusColor(
                  device.status
                )}`}
              />
            </div>
            <div className="text-sm text-gray-600 mb-2">
              Status: {device.status}
              {device.currentPower && (
                <span className="ml-2">({device.currentPower}kW)</span>
              )}
            </div>
            <button
              onClick={() =>
                device.status === "charging"
                  ? stopCharging(device.id)
                  : startCharging(device.id)
              }
              className={`w-full py-2 px-4 rounded-md transition-colors ${
                device.status === "charging"
                  ? "bg-red-600 hover:bg-red-700 text-white"
                  : "bg-green-600 hover:bg-green-700 text-white"
              }`}
            >
              {device.status === "charging"
                ? "Stop Charging"
                : "Start Charging"}
            </button>
          </div>
        ))}
      </div>
      {devices.length === 0 && (
        <div className="text-center text-gray-500 py-8">
          No devices connected
        </div>
      )}
    </div>
  );
};
