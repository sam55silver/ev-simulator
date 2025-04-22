defmodule Supervisor.DeviceState do
  @moduledoc """
  Shared functionality for handling device state operations.
  """

  @doc """
  Gets the state of all devices in the registry.
  Returns a list of device states.
  """
  def get_all_devices_state do
    Registry.select(Supervisor.DeviceRegistry, [
      {{:"$1", :"$2", :"$3"}, [], [{{:"$1", :"$2", :"$3"}}]}
    ])
    |> Enum.map(fn {device_id, _pid, _} ->
      case Supervisor.Device.get_state(device_id) do
        state when is_map(state) -> state
        _ -> %{id: device_id, status: "offline"}
      end
    end)
  end

  @doc """
  Broadcasts the current state of all devices through PubSub.
  """
  def broadcast_all_devices do
    devices = get_all_devices_state()

    Phoenix.PubSub.broadcast(
      Supervisor.PubSub,
      "devices",
      {:all_devices, %{devices: devices}}
    )
  end
end
