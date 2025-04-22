defmodule Supervisor.Router do
  use Phoenix.Router
  import Plug.Conn
  import Phoenix.Controller

  pipeline :api do
    plug(:accepts, ["json"])
  end

  scope "/api", Supervisor do
    pipe_through(:api)
  end
end
