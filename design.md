# EV Charger Simulator - Design Document

## Overview

A simple demonstration project that simulates an EV charger management system using Elixir for the backend and React for the frontend. The demo shows how Elixir can efficiently handle many IoT devices communicating via WebSockets.

## Key Components

### Backend
1. **WebSocket Server**: Maintains connections with EV chargers using 15-second heartbeats
2. **Device Registry**: Keeps track of all connected devices
3. **Scaling Manager**: Controls how many simulated devices are active

### Device Simulators
1. **Fake EV Chargers**: Independent GenServer processes that mimic real EV chargers
2. **State Management**: Each simulator maintains its own status, power level, and error state
3. **WebSocket Client**: Connects to the main server with regular heartbeats
4. **Behavior Simulation**: Mimics realistic charging patterns and occasional errors

### Frontend
1. **Device Control Panel**: Adjust number of simulated devices with a slider
2. **Dashboard**: Shows connected devices and their status
3. **Visualization**: Real-time graph of power consumption
4. **Control Interface**: Start/stop charging on individual devices

## How It Works

1. **Setup**:
   - Backend creates simulated EV chargers as needed
   - Each device connects via WebSocket to the server
   - Frontend displays device status and controls

2. **Communication Flow**:
   - Devices send regular heartbeat messages
   - Devices report status changes (available, charging, error)
   - User can send commands to specific devices
   - Dashboard updates in real-time

3. **Scaling Demo**:
   - User can scale from 10 to 1,000+ simulated devices
   - System continues to function smoothly due to Elixir's concurrency


This demonstration focuses on EV charger management at scale.