defmodule Supervisor.Device do
  use GenServer
  require Logger

  # Client API

  def start_link(device_id) do
    GenServer.start_link(__MODULE__, device_id, name: via_tuple(device_id))
  end

  def get_state(device_id) do
    GenServer.call(via_tuple(device_id), :get_state)
  end

  def start_charging(device_id) do
    GenServer.cast(via_tuple(device_id), :start_charging)
  end

  def stop_charging(device_id) do
    GenServer.cast(via_tuple(device_id), :stop_charging)
  end

  # Server Callbacks

  @impl true
  def init(device_id) do
    initial_state = %{
      id: device_id,
      # :available, :charging, :error
      status: :available,
      # Current power draw in kW
      power_level: 0.0,
      # Total energy delivered in kWh
      total_energy: 0.0,
      connected_at: DateTime.utc_now()
    }

    # Start the power update timer for periodic updates
    schedule_power_update()

    {:ok, initial_state}
  end

  @impl true
  def handle_call(:get_state, _from, state) do
    {:reply, state, state}
  end

  @impl true
  def handle_cast(:start_charging, state) do
    if state.status == :available do
      # Set a random power level between 0 and 7.2kW
      new_state = %{state | status: :charging, power_level: 7.2 * :rand.uniform()}
      {:noreply, new_state}
    else
      {:noreply, state}
    end
  end

  @impl true
  def handle_cast(:stop_charging, state) do
    if state.status == :charging do
      new_state = %{state | status: :available, power_level: 0.0}
      {:noreply, new_state}
    else
      {:noreply, state}
    end
  end

  @impl true
  def handle_info(:update_power, state) do
    new_state =
      if state.status == :charging do
        # Update total energy based on time elapsed
        # 5 seconds in hours
        new_total = state.total_energy + state.power_level * (5 / 3600)
        %{state | total_energy: new_total}
      else
        state
      end

    schedule_power_update()
    {:noreply, new_state}
  end

  # Private Functions

  defp schedule_power_update do
    # Update every 200 milliseconds
    Process.send_after(self(), :update_power, 200)
  end

  defp via_tuple(device_id) do
    {:via, Registry, {Supervisor.DeviceRegistry, device_id}}
  end
end
