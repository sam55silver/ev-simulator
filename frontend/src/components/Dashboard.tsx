import { useWebSocketContext, Device } from "../contexts/WebSocketContext";

export const Dashboard = () => {
  const { devices, startCharging, stopCharging, connected } =
    useWebSocketContext();

  const getStatusColor = (status: string) => {
    switch (status) {
      case "charging":
        return "bg-green-500";
      case "available":
        return "bg-yellow-500";
      case "error":
        return "bg-red-500";
      default:
        return "bg-gray-500";
    }
  };

  const getStatusText = (status: string) => {
    return status.charAt(0).toUpperCase() + status.slice(1);
  };

  return (
    <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-gray-900">
          EV Charging Stations ({devices.length})
        </h2>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <div className="h-2.5 w-2.5 rounded-full bg-green-500"></div>
            <span className="text-sm text-gray-600">Charging</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-2.5 w-2.5 rounded-full bg-yellow-500"></div>
            <span className="text-sm text-gray-600">Available</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-2.5 w-2.5 rounded-full bg-red-500"></div>
            <span className="text-sm text-gray-600">Error</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {devices.map((device: Device) => (
          <div
            key={device.id}
            className="rounded-lg p-4 border border-gray-200 hover:shadow-md transition-all duration-200"
          >
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div
                  className={`h-3 w-3 rounded-full ${getStatusColor(
                    device.status
                  )}`}
                />
                <h3 className="text-base font-medium text-gray-900">
                  {device.id}
                </h3>
              </div>
              <span className="px-2 py-0.5 rounded-full text-sm font-medium bg-gray-100 text-gray-800">
                {getStatusText(device.status)}
              </span>
            </div>

            <div className="space-y-2 mb-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Power Draw</span>
                <span className="text-sm font-medium text-gray-900">
                  {device.power_level.toFixed(2)} kW
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Total Energy</span>
                <span className="text-sm font-medium text-gray-900">
                  {device.total_energy.toFixed(2)} kWh
                </span>
              </div>
            </div>

            <button
              onClick={() =>
                device.status === "charging"
                  ? stopCharging(device.id)
                  : startCharging(device.id)
              }
              disabled={device.status === "error"}
              className={`hover:cursor-pointer w-full py-2 px-3 rounded-md transition-colors duration-200 text-sm font-medium
                  ${
                    device.status === "charging"
                      ? "bg-red-600 hover:bg-red-700 text-white"
                      : device.status === "error"
                      ? "bg-gray-300 cursor-not-allowed text-gray-500"
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

      {!connected && (
        <div className="text-center py-8">
          <div className="text-gray-400 text-3xl mb-3">🔌</div>
          <h3 className="text-base font-medium text-gray-900 mb-1">
            Connection Lost
          </h3>
          <p className="text-sm text-gray-500">
            Unable to connect to the charging network. Please check your
            connection and try again.
          </p>
        </div>
      )}

      {connected && devices.length === 0 && (
        <div className="text-center py-8">
          <div className="text-gray-400 text-3xl mb-3">⚡</div>
          <h3 className="text-base font-medium text-gray-900 mb-1">
            No Charging Stations Connected
          </h3>
          <p className="text-sm text-gray-500">
            Adjust and apply the number of devices in the control panel to get
            started.
          </p>
        </div>
      )}
    </div>
  );
};
