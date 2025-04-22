# EV Charger Simulator

A demonstration project that simulates an EV charger management system with real-time monitoring and control capabilities. Built with Elixir (backend) and React (frontend).

## Features

- Live WebSocket connection for real-time updates
- Simulated network of EV charger devices
- Interactive device control panel
- Real-time dashboard showing device status
- Scalable device simulation

## Getting Started

### Backend Setup

```bash
cd supervisor

# Install dependencies
mix deps.get

# Start the Phoenix server
mix phx.server
```

### Frontend Setup

```bash
cd frontend

# Install dependencies
npm i

# Start the development server
npm run dev
```

## Easter Egg

One can edit `./frontend/src/components/DeviceControlPanel.tsx` line `41` to adjust the MAX number of simulated devices one can create.

I tried 10,000, react broke before the Elixir Pheonix server did... Elixir is great!
