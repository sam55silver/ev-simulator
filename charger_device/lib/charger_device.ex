defmodule ChargerDevice do
  use WebSockex
  use GenServer

  defmodule State do
    defstruct [
      :id,
      :websocket_pid,
      status: :available,
      power_level: 0.0,
      connected: false
    ]
  end

  # ==== API ====

  def start_link(id, websocket_url) do
    name = via_tuple(id)
    GenServer.start_link(__MODULE__, %{id: id, url: websocket_url}, name: name)
  end

  def start_charging(id) do
    GenServer.cast(via_tuple(id), :start_charging)
  end

  def stop_charging(id) do
    GenServer.cast(via_tuple(id), :stop_charging)
  end

  def get_status(id) do
    GenServer.call(via_tuple(id), :get_status)
  end

  # ==== GenServer callbacks ====

  @impl true
  def init(%{id: id, url: url}) do
    {:ok, websocket_pid} = WebSockex.start_link(url, __MODULE__, %{parent_pid: self()})
    state = %State{id: id, websocket_pid: websocket_pid}
    {:ok, state}
  end

  @impl true
  def handle_call(:get_status, _from, state) do
    {:reply, state, state}
  end

  @impl true
  def handle_cast(:start_charging, state) do
    if state.status == :available do
      # Give a random power level between 30% and 50% when starting
      new_state = %{
        state
        | status: :charging,
          power_level: Enum.random(30..50) / 10
      }

      send_status_update(new_state)
      {:noreply, new_state}
    else
      {:noreply, state}
    end
  end

  def handle_cast(:stop_charging, state) do
    new_state = %{state | status: :available}
    send_status_update(new_state)
    {:noreply, new_state}
  end

  def handle_info(:heartbeat, state) do
    send_status_update(state)
    {:noreply, state}
  end

  # ==== WebSocket callbacks ====

  @impl true
  def handle_connect(state) do
    {:ok, %{state | connected: true}}
  end

  @impl true
  def handle_disconnect(state) do
    {:ok, %{state | connected: false}}
  end

  @impl true
  def handle_frame({:text, message}, state) do
    IO.puts("Received message: #{message}")

    case Jason.decode(message) do
      {:ok, command} ->
        handle_command(command, state)

      {:error, _} ->
        {:ok, state}
    end
  end

  # ==== Helper Functions ====

  defp via_tuple(id) do
    {:via, Registry, {ChargerDevice.Registry, id}}
  end

  defp send_status_update(state) do
    message = %{
      type: "status_update",
      id: state.id,
      status: state.status,
      power_level: state.power_level,
      timestamp: DateTime.utc_now() |> DateTime.to_iso8601()
    }

    WebSockex.send_frame(state.websocket_pid, {:text, Jason.encode!(message)})
  end

  defp handle_command(%{"command" => "start_charging"}, state) do
    GenServer.cast(self(), :start_charging)
    {:ok, state}
  end

  defp handle_command(%{"command" => "stop_charging"}, state) do
    GenServer.cast(self(), :stop_charging)
    {:ok, state}
  end

  defp handle_command(%{"command" => "heartbeat"}, state) do
    GenServer.cast(self(), :heartbeat)
    {:ok, state}
  end

  defp handle_command(_, state) do
    {:ok, state}
  end
end
