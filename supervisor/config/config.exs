import Config

# Configures the endpoint
config :supervisor, Supervisor.Endpoint,
  url: [host: "localhost"],
  render_errors: [
    formats: [json: Supervisor.ErrorJSON],
    layout: false
  ],
  pubsub_server: Supervisor.PubSub,
  server: true

# Use Jason for JSON parsing in Phoenix
config :phoenix, :json_library, Jason

import_config "#{config_env()}.exs"
