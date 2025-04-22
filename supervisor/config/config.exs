import Config

config :supervisor, Supervisor.Endpoint,
  url: [host: "localhost"],
  http: [port: 4000],
  debug_errors: true,
  code_reloader: true,
  check_origin: false,
  watchers: []

# Use Jason for JSON parsing in Phoenix
config :phoenix, :json_library, Jason

# Dev stuff
config :logger, :console, format: "[$level] $message\n"
config :phoenix, :stacktrace_depth, 20
config :phoenix, :plug_init_mode, :runtime
