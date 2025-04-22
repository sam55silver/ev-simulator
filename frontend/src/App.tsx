import { WebSocketProvider } from "./contexts/WebSocketContext";
import { Dashboard } from "./components/Dashboard";
import { DeviceControlPanel } from "./components/DeviceControlPanel";

function App() {
  return (
    <WebSocketProvider>
      <div className="min-h-screen bg-gray-100 py-8 px-4">
        <div className="max-w-7xl mx-auto space-y-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">
            EV Charger Simulator
          </h1>
          <DeviceControlPanel />
          <Dashboard />
        </div>
      </div>
    </WebSocketProvider>
  );
}

export default App;
