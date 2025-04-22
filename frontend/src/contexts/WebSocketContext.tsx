import {
  createContext,
  useContext,
  useEffect,
  useCallback,
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
  status: "available" | "charging" | "error";
  power_level: number;
  total_energy: number;
  connected_at: string;
}

const WebSocketContext = createContext<WebSocketContextType | null>(null);

export const WebSocketProvider = ({ children }: { children: ReactNode }) => {
  const [socket, setSocket] = useState<WebSocket | null>(null);
  const [connected, setConnected] = useState(false);
  const [devices, setDevices] = useState<Device[]>([]);

  const [retryCount, setRetryCount] = useState(0);
  const MAX_RETRIES = 5;
  const DELAY = 1000;

  const connectWebSocket = useCallback(() => {
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
          ref: "join",
        })
      );
    };

    ws.onclose = () => {
      console.log("Disconnected from supervisor");
      setConnected(false);

      if (retryCount < MAX_RETRIES) {
        setTimeout(() => {
          setRetryCount((prev) => prev + 1);
          connectWebSocket();
        }, DELAY * Math.pow(2, retryCount));
      }
    };

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);

      console.log("Received Event:", data.event);

      switch (data.event) {
        case "phx_reply":
          if (data.ref === "join") {
            console.log("Received reply to join:", data.payload);
            setDevices(data.payload.response.devices);
          }
          break;
        case "all_devices":
          setDevices(data.payload.devices);
          break;
        case "device_update":
          console.log("Received device update:", data.payload);
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
          break;
      }
    };

    setSocket(ws);

    return () => {
      ws.close();
    };
  }, [retryCount]);

  useEffect(() => {
    connectWebSocket();
  }, [connectWebSocket]);

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
