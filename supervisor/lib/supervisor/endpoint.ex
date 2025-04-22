defmodule Supervisor.Endpoint do
  use Phoenix.Endpoint, otp_app: :supervisor

  socket("/socket", Supervisor.UserSocket,
    websocket: true,
    longpoll: false
  )

  # Code reloading can be explicitly enabled under the
  # :code_reloader configuration of your endpoint.
  if code_reloading? do
    plug(Phoenix.CodeReloader)
  end

  plug(Plug.RequestId)
  plug(Plug.Telemetry, event_prefix: [:phoenix, :endpoint])

  plug(Plug.Parsers,
    parsers: [:urlencoded, :multipart, :json],
    pass: ["*/*"],
    json_decoder: Phoenix.json_library()
  )

  plug(Plug.MethodOverride)
  plug(Plug.Head)

  # Configure session handling
  @session_options [
    store: :cookie,
    key: "_supervisor_key",
    signing_salt: "your_signing_salt"
  ]
  plug(Plug.Session, @session_options)
  plug(Supervisor.Router)

  def child_spec(opts) do
    %{
      id: __MODULE__,
      start: {__MODULE__, :start_link, [opts]},
      type: :supervisor,
      restart: :permanent,
      shutdown: 5000
    }
  end
end
