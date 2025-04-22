defmodule Supervisor.DeviceChannel do
  use Phoenix.Channel
  require Logger

  def join("devices:lobby", _payload, socket) do
    # Subscribe to device updates
    Phoenix.PubSub.subscribe(Supervisor.PubSub, "devices")
    {:ok, socket}
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

  # Handle device updates from PubSub
  def handle_info({:device_update, state}, socket) do
    push(socket, "device_update", state)
    {:noreply, socket}
  end
end
