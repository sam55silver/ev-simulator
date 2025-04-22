defmodule Supervisor.Application do
  use Application

  @impl true
  def start(_type, _args) do
    children = [
      # Start the PubSub system
      {Phoenix.PubSub, name: Supervisor.PubSub},

      # Start the Registry for device processes
      {Registry, keys: :unique, name: Supervisor.DeviceRegistry},

      # Start the device supervisor
      Supervisor.DeviceSupervisor,

      # Start the heartbeat manager
      Supervisor.HeartbeatManager,

      # Start the Endpoint with proper configuration
      {Supervisor.Endpoint, []}
    ]

    opts = [strategy: :one_for_one, name: Supervisor.Supervisor]
    Supervisor.start_link(children, opts)
  end

  # Tell Phoenix to update the endpoint configuration
  # whenever the application is updated.
  @impl true
  def config_change(changed, _new, removed) do
    Supervisor.Endpoint.config_change(changed, removed)
    :ok
  end
end
