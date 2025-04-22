defmodule Supervisor.DeviceSupervisor do
  use DynamicSupervisor
  require Logger

  def start_link(init_arg) do
    DynamicSupervisor.start_link(__MODULE__, init_arg, name: __MODULE__)
  end

  @impl true
  def init(_init_arg) do
    DynamicSupervisor.init(strategy: :one_for_one)
  end

  def start_device(device_id) do
    child_spec = %{
      id: Supervisor.Device,
      start: {Supervisor.Device, :start_link, [device_id]},
      restart: :transient
    }

    case DynamicSupervisor.start_child(__MODULE__, child_spec) do
      {:ok, pid} ->
        Logger.info("Started device #{device_id} with PID #{inspect(pid)}")
        {:ok, pid}

      {:error, {:already_started, pid}} ->
        Logger.info("Device #{device_id} already running with PID #{inspect(pid)}")
        {:ok, pid}

      error ->
        Logger.error("Failed to start device #{device_id}: #{inspect(error)}")
        error
    end
  end

  def stop_device(device_id) do
    case Registry.lookup(Supervisor.DeviceRegistry, device_id) do
      [{pid, _}] ->
        DynamicSupervisor.terminate_child(__MODULE__, pid)

      [] ->
        {:error, :not_found}
    end
  end

  def count_devices do
    DynamicSupervisor.count_children(__MODULE__)
  end
end
