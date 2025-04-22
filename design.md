# EV Charger Simulator - Design Document

## Overview

A simple demonstration project that simulates an EV charger management system using Elixir for the backend and React for the frontend. The demo creates an Elixir GenServer to act as a fake network of charger devices. The Frontend then connects with the GenServer via a websocket and gains a live feed.

## Key Components

### Backend
1. **WebSocket Server**: Maintains connections with EV chargers
2. **Device Registry**: Keeps track of all connected devices and their state
3. **Scaling Manager**: Controls how many simulated devices are active

### Frontend
1. **Device Control Panel**: Adjust number of simulated devices with a slider
2. **Dashboard**: Shows connected devices and their status
4. **Control Interface**: Start/stop charging on individual devices


This demonstration focuses on EV charger management at scale.