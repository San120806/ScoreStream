# 🏏 ScoreStream

ScoreStream is a real-time event streaming and data visualization platform designed to showcase distributed system concepts using cricket match events. It consists of a **Python WebSocket server** (acting as the event producer/broadcaster) and a premium, responsive **React + Vite frontend** (acting as the event consumer/visualizer).

---

## 🏗️ Architecture Overview

The system illustrates a real-time event-driven architecture utilizing:
1. **Producer-Consumer / Pub-Sub Pattern**: The Python backend generates granular match events (Runs, Wickets, Dots, Wides, Fours, Sixes) and broadcasts them to all connected clients over WebSockets.
2. **CQRS (Command Query Responsibility Segregation)**: Demonstrates the separation of mutation commands (incoming events from the Python server) from query-optimized read models (processed states displayed on pages like Analytics and Metrics).
3. **Fault Tolerance**: The frontend automatically detects disconnection from the Python server and seamlessly fails over to an internal **Simulation Mode** (which continues generating realistic events locally), then automatically reconnects and returns to **Live Mode** when the Python server comes back online.

```
                      +-----------------------------+
                      |      Python Backend         |
                      |   (WebSocket Producer)      |
                      +--------------+--------------+
                                     |
                                     |  ws://localhost:8000/live
                                     v
                      +--------------+--------------+
                      |      React Frontend         |
                      |    (WebSocket Consumer)     |
                      +-------+--------------+------+
                              |              |
                              |              |
           Live WebSocket Data|              |Failover
                              v              v
                     +--------+---+      +---+--------+
                     |  Live Mode |      | Simulation |
                     |            |      |    Mode    |
                     +------------+      +------------+
```

---

## 🚀 Quick Start Guide

To run the full demonstration, open two terminal windows or tabs:

### 1. Start the Python Backend
First, ensure you have the `websockets` dependency installed:
```bash
pip install websockets
```

Run the server script:
```bash
python server.py
```
*The server will start listening on `ws://localhost:8000/live` and output real-time match simulation streams in the terminal.*

### 2. Start the React Frontend
Install the Node.js packages:
```bash
npm install
```

Start the Vite development server:
```bash
npm run dev
```
*Open **[http://localhost:3000](http://localhost:3000)** in your browser to view the dashboard.*

---

## 🖥️ Application Features & Pages

The interface is structured as an interactive sports-tech workspace:

*   **📊 Live Dashboard**: The main cockpit of the demo. Highlights WebSocket connection status (Live/Simulation), displays live scorecards for matches (e.g. `IND-AUS`, `ENG-PAK`), graphs incoming events by type (Sixes, Wickets, etc.), and displays a raw stream of the incoming JSON packets alongside the last received payload.
*   **📋 Event Log**: A high-frequency scrollable stream showing every individual match event packet. Features search/filtering by Match ID and Event Type.
*   **📐 Architecture Overview**: An interactive page displaying the logical data flow and architectural design patterns implemented in the project.
*   **📈 Metrics & Monitoring**: Simulates real-time system performance, charting metrics like event throughput (events/sec), system latency (ms), and packet success rate.
*   **⚡ CQRS Visualizer**: Interactive demonstration of CQRS. Shows how write operations (events broadcasted from Python) flow through an event store and update separate read database models without blocking client views.
*   **🛡️ Fault Tolerance**: An interactive panel where you can test resilience. Features instructions and visual guides on how the frontend gracefully handles network partition, auto-reconnections (every 3 seconds), and fallback mode.
*   **📊 Analytics & Trends**: Provides deep-dive charts, cumulative runs, wickets distribution, and predictive scoring trends calculated using the stream history.
*   **🔔 Notifications**: A log of system notifications triggered by critical match milestones (e.g. half-centuries, centuries, wickets fall).

---

## 🛠️ Tech Stack

*   **Backend**: Python 3, `asyncio`, `websockets`
*   **Frontend**: React 18, Vite 5, React Router 6, Framer Motion 11 (animations), Recharts 2 (data visualization), Vanilla CSS
