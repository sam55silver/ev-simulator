import {
  createContext,
  useContext,
  useCallback,
  useState,
  ReactNode,
  useEffect,
} from "react";
import useWebSocket, { ReadyState } from "react-use-websocket";

interface WebSocketContextType {
  connected: boolean;
  devices: Device[];
  startDevice: (deviceId: string) => void;
  stopDevice: (deviceId: string) => void;
  startCharging: (deviceId: string) => void;
  stopCharging: (deviceId: string) => void;
  bulkStartCharging: (deviceIds?: string[]) => void;
  bulkStopCharging: (deviceIds?: string[]) => void;
  getDeviceState: (deviceId: string) => void;
  setDeviceCount: (count: number) => void;
}

export interface Device {
  id: string;
  status: "available" | "charging" | "error";
  power_level: number;
  total_energy: number;
  connected_at: string;
}

const WebSocketContext = createContext<WebSocketContextType | null>(null);

export const WebSocketProvider = ({ children }: { children: ReactNode }) => {
  const [devices, setDevices] = useState<Device[]>([]);

  const { sendJsonMessage, readyState } = useWebSocket(
    "ws://localhost:4000/devices/websocket",
    {
      onOpen: () => {
        console.log("Connected to supervisor");
        // Join the devices channel
        sendJsonMessage({
          topic: "devices:lobby",
          event: "phx_join",
          payload: {},
          ref: "join",
        });
      },
      onMessage: (event: MessageEvent) => {
        const data = JSON.parse(event.data);
        console.log("Received Event:", data.event);

        switch (data.event) {
          case "phx_reply":
            if (data.payload.response.devices) {
              console.log("Received reply to join:", data.payload);
              setDevices(data.payload.response.devices);
            }
            break;
          case "all_devices":
            setDevices(data.payload.devices);
            break;
        }
      },
      onError: (error: Event) => {
        console.error("WebSocket error:", error);
      },
      reconnectAttempts: 5,
      reconnectInterval: (attemptNumber: number) =>
        Math.min(1000 * Math.pow(2, attemptNumber), 30000),
      shouldReconnect: () => true,
    }
  );

  const connected = readyState === ReadyState.OPEN;

  const startDevice = useCallback(
    (deviceId: string) => {
      sendJsonMessage({
        topic: "devices:lobby",
        event: "start_device",
        payload: { device_id: deviceId },
        ref: "1",
      });
    },
    [sendJsonMessage]
  );

  const stopDevice = useCallback(
    (deviceId: string) => {
      sendJsonMessage({
        topic: "devices:lobby",
        event: "stop_device",
        payload: { device_id: deviceId },
        ref: "1",
      });
    },
    [sendJsonMessage]
  );

  const startCharging = useCallback(
    (deviceId: string) => {
      sendJsonMessage({
        topic: "devices:lobby",
        event: "start_charging",
        payload: { device_id: deviceId },
        ref: "1",
      });
    },
    [sendJsonMessage]
  );

  const stopCharging = useCallback(
    (deviceId: string) => {
      sendJsonMessage({
        topic: "devices:lobby",
        event: "stop_charging",
        payload: { device_id: deviceId },
        ref: "1",
      });
    },
    [sendJsonMessage]
  );

  const bulkStartCharging = useCallback(
    (deviceIds?: string[]) => {
      sendJsonMessage({
        topic: "devices:lobby",
        event: "bulk_start_charging",
        payload: deviceIds ? { device_ids: deviceIds } : { all: true },
        ref: "1",
      });
    },
    [sendJsonMessage]
  );

  const bulkStopCharging = useCallback(
    (deviceIds?: string[]) => {
      sendJsonMessage({
        topic: "devices:lobby",
        event: "bulk_stop_charging",
        payload: deviceIds ? { device_ids: deviceIds } : { all: true },
        ref: "1",
      });
    },
    [sendJsonMessage]
  );

  const getDeviceState = useCallback(
    (deviceId: string) => {
      sendJsonMessage({
        topic: "devices:lobby",
        event: "get_device_state",
        payload: { device_id: deviceId },
        ref: "1",
      });
    },
    [sendJsonMessage]
  );

  const setDeviceCount = useCallback(
    (count: number) => {
      sendJsonMessage({
        topic: "devices:lobby",
        event: "set_device_count",
        payload: { count },
        ref: "1",
      });
    },
    [sendJsonMessage]
  );

  return (
    <WebSocketContext.Provider
      value={{
        connected,
        devices,
        startDevice,
        stopDevice,
        startCharging,
        stopCharging,
        bulkStartCharging,
        bulkStopCharging,
        getDeviceState,
        setDeviceCount,
      }}
    >
      {children}
    </WebSocketContext.Provider>
  );
};

export const useWebSocketContext = () => {
  const context = useContext(WebSocketContext);
  if (!context) {
    throw new Error(
      "useWebSocketContext must be used within a WebSocketProvider"
    );
  }
  return context;
};
