import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";

interface WebSocketContextType {
  socket: WebSocket | null;
  connected: boolean;
  devices: Device[];
  startDevice: (deviceId: string) => void;
  stopDevice: (deviceId: string) => void;
  startCharging: (deviceId: string) => void;
  stopCharging: (deviceId: string) => void;
  getDeviceState: (deviceId: string) => void;
  setDeviceCount: (count: number) => void;
}

interface Device {
  id: string;
  status: "charging" | "idle" | "offline";
  currentPower?: number;
}

const WebSocketContext = createContext<WebSocketContextType | null>(null);

export const WebSocketProvider = ({ children }: { children: ReactNode }) => {
  const [socket, setSocket] = useState<WebSocket | null>(null);
  const [connected, setConnected] = useState(false);
  const [devices, setDevices] = useState<Device[]>([]);

  useEffect(() => {
    console.log("Devices:", devices);
  }, [devices]);

  useEffect(() => {
    const ws = new WebSocket("ws://localhost:4000/devices/websocket");

    ws.onopen = () => {
      console.log("Connected to supervisor");
      setConnected(true);

      // Join the devices channel
      ws.send(
        JSON.stringify({
          topic: "devices:lobby",
          event: "phx_join",
          payload: {},
          ref: "1",
        })
      );

      // Request initial device list
      ws.send(
        JSON.stringify({
          topic: "devices:lobby",
          event: "get_all_devices",
          payload: {},
          ref: "2",
        })
      );
    };

    ws.onclose = () => {
      console.log("Disconnected from supervisor");
      setConnected(false);
      setDevices([]);
    };

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.event === "device_update") {
        // Handle individual device update
        console.log("Received device update:", data.payload);
        // Update the specific device in the devices array
        setDevices((prevDevices) => {
          const updatedDevice = data.payload;
          const deviceExists = prevDevices.some(
            (device) => device.id === updatedDevice.id
          );

          if (!deviceExists) {
            return [...prevDevices, updatedDevice];
          }

          return prevDevices.map((device) =>
            device.id === updatedDevice.id ? updatedDevice : device
          );
        });
      } else if (data.event === "all_devices") {
        // Handle initial devices list
        console.log("Received all devices:", data.payload);
        setDevices(data.payload.devices);
      }
    };

    setSocket(ws);

    return () => {
      ws.close();
    };
  }, []);

  const startDevice = (deviceId: string) => {
    socket?.send(
      JSON.stringify({
        topic: "devices:lobby",
        event: "start_device",
        payload: { device_id: deviceId },
        ref: "1",
      })
    );
  };

  const stopDevice = (deviceId: string) => {
    socket?.send(
      JSON.stringify({
        topic: "devices:lobby",
        event: "stop_device",
        payload: { device_id: deviceId },
        ref: "1",
      })
    );
  };

  const startCharging = (deviceId: string) => {
    socket?.send(
      JSON.stringify({
        topic: "devices:lobby",
        event: "start_charging",
        payload: { device_id: deviceId },
        ref: "1",
      })
    );
  };

  const stopCharging = (deviceId: string) => {
    socket?.send(
      JSON.stringify({
        topic: "devices:lobby",
        event: "stop_charging",
        payload: { device_id: deviceId },
        ref: "1",
      })
    );
  };

  const getDeviceState = (deviceId: string) => {
    socket?.send(
      JSON.stringify({
        topic: "devices:lobby",
        event: "get_device_state",
        payload: { device_id: deviceId },
        ref: "1",
      })
    );
  };

  const setDeviceCount = (count: number) => {
    socket?.send(
      JSON.stringify({
        topic: "devices:lobby",
        event: "set_device_count",
        payload: { count },
        ref: "1",
      })
    );
  };

  return (
    <WebSocketContext.Provider
      value={{
        socket,
        connected,
        devices,
        startDevice,
        stopDevice,
        startCharging,
        stopCharging,
        getDeviceState,
        setDeviceCount,
      }}
    >
      {children}
    </WebSocketContext.Provider>
  );
};

export const useWebSocket = () => {
  const context = useContext(WebSocketContext);
  if (!context) {
    throw new Error("useWebSocket must be used within a WebSocketProvider");
  }
  return context;
};
