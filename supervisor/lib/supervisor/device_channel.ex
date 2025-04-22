defmodule Supervisor.DeviceChannel do
  use Phoenix.Channel
  require Logger
  alias Supervisor.DeviceState

  def join("devices:lobby", _payload, socket) do
    # Subscribe to device updates
    Phoenix.PubSub.subscribe(Supervisor.PubSub, "devices")
    {:ok, %{devices: DeviceState.get_all_devices_state()}, socket}
  end

  def handle_in("start_device", %{"device_id" => device_id}, socket) do
    case Supervisor.DeviceSupervisor.start_device(device_id) do
      {:ok, _pid} ->
        {:reply, {:ok, %{message: "Device started"}}, socket}

      {:error, reason} ->
        {:reply, {:error, %{reason: inspect(reason)}}, socket}
    end
  end

  def handle_in("stop_device", %{"device_id" => device_id}, socket) do
    case Supervisor.DeviceSupervisor.stop_device(device_id) do
      :ok ->
        {:reply, {:ok, %{message: "Device stopped"}}, socket}

      {:error, reason} ->
        {:reply, {:error, %{reason: inspect(reason)}}, socket}
    end
  end

  def handle_in("start_charging", %{"device_id" => device_id}, socket) do
    Supervisor.Device.start_charging(device_id)
    {:reply, :ok, socket}
  end

  def handle_in("stop_charging", %{"device_id" => device_id}, socket) do
    Supervisor.Device.stop_charging(device_id)
    {:reply, :ok, socket}
  end

  def handle_in("get_device_state", %{"device_id" => device_id}, socket) do
    case Supervisor.Device.get_state(device_id) do
      state when is_map(state) ->
        {:reply, {:ok, state}, socket}

      _ ->
        {:reply, {:error, %{reason: "Device not found"}}, socket}
    end
  end

  def handle_in("set_device_count", %{"count" => count}, socket)
      when is_integer(count) and count >= 0 do
    # Stop all existing devices
    Registry.select(Supervisor.DeviceRegistry, [{{:"$1", :_, :_}, [], [:"$1"]}])
    |> Enum.each(&Supervisor.DeviceSupervisor.stop_device/1)

    # Start new devices
    Enum.each(1..count, fn i ->
      device_id = "device_#{i}"
      Supervisor.DeviceSupervisor.start_device(device_id)
    end)

    # Broadcast updated device list
    broadcast!(socket, "all_devices", %{devices: DeviceState.get_all_devices_state()})
    {:reply, :ok, socket}
  end

  def handle_in("set_device_count", _payload, socket) do
    {:reply, {:error, %{reason: "Invalid count parameter"}}, socket}
  end

  # Handle device updates from PubSub
  def handle_info({:all_devices, %{devices: devices}}, socket) do
    broadcast!(socket, "all_devices", %{devices: devices})
    {:noreply, socket}
  end
end
