defmodule Supervisor.HeartbeatManager do
  use GenServer
  require Logger
  alias Supervisor.DeviceState

  # 500 milliseconds interval
  @heartbeat_interval 500

  def start_link(_) do
    GenServer.start_link(__MODULE__, [], name: __MODULE__)
  end

  @impl true
  def init(_) do
    schedule_heartbeat()
    {:ok, %{}}
  end

  @impl true
  def handle_info(:heartbeat, state) do
    DeviceState.broadcast_all_devices()
    schedule_heartbeat()
    {:noreply, state}
  end

  defp schedule_heartbeat do
    Process.send_after(self(), :heartbeat, @heartbeat_interval)
  end
end
