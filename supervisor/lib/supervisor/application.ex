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

      # Start the Endpoint with proper configuration
      {Supervisor.Endpoint, []}
    ]

    opts = [strategy: :one_for_one, name: Supervisor.Supervisor]
    Supervisor.start_link(children, opts)
  end
end
