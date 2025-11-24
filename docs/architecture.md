# Market Simulation Architecture

## Overview
The system is a web-based, self-running market simulation. It consists of a deterministic simulation engine running on the backend, a realtime WebSocket layer for state updates, and a Next.js frontend for visualization and interaction.

## System Components

```mermaid
graph TD
    subgraph Client [Frontend (Next.js)]
        UI[React UI Components]
        Canvas[Konva MapCanvas]
        SocketClient[WebSocket Client]
        APIClient[REST API Client]
    end

    subgraph Server [Backend (Node.js/Fastify)]
        API[REST API Layer]
        WS[WebSocket Broadcaster]
        Engine[Simulation Engine (Worker)]
        
        subgraph EngineComponents [Engine Components]
            Loop[Tick Loop]
            FSM[Agent FSM]
            Market[Market Logic]
            Path[Pathfinding]
        end
    end

    subgraph Data [Persistence]
        DB[(PostgreSQL / Supabase)]
        Redis[(Redis - Optional)]
    end

    UI --> APIClient
    Canvas --> SocketClient
    APIClient --> API
    SocketClient <--> WS
    
    API --> Engine
    WS <--> Engine
    
    Engine --> Loop
    Loop --> FSM
    Loop --> Market
    Loop --> Path
    
    Engine --> DB
    API --> DB
```

## Component Responsibilities

### Frontend (`/client`)
- **MapCanvas**: Renders the game world using `react-konva`. Handles LOD (Level of Detail) - rendering individual sprites at high zoom, and aggregated dots at low zoom.
- **UI Overlay**: React components for "Add Shop" modal, "Shop Card" (details & ancestry), "Analytics Panel", and Play/Pause controls.
- **State Management**: Receives batched diffs via WebSocket and updates the local state tree. Interpolates positions for smooth animation between ticks.

### Backend (`/server`)
- **API Layer**: Fastify REST endpoints for creating shops, querying state, and managing the simulation (start/stop/snapshot).
- **WebSocket Broadcaster**: Pushes state deltas to connected clients. Optimizes bandwidth by sending only changed fields (diffs).
- **Simulation Engine**:
    - Runs in a deterministic tick loop (default 500ms/tick).
    - **Agent FSM**: Manages agent states (Idle, Buying, Working, etc.).
    - **Market Logic**: Handles transactions, price updates, and inventory management.
    - **Pathfinding**: Grid-based A* or BFS with Manhattan distance for movement.

### Persistence
- **PostgreSQL**: Stores the canonical state of the world (Shops, Agents, Items, Transactions).
- **Seeding**: A deterministic seeder script populates the DB with initial agents and shops based on a numeric seed.

## Data Flow
1. **Initialization**: Server starts, seeds DB (if empty) or loads snapshot. Engine warms up.
2. **Simulation Tick**:
    - Engine processes all Agent FSMs.
    - Resolves interactions (Buy/Sell).
    - Updates positions.
    - Generates a "Diff" of changes.
3. **Broadcast**: The Diff is sent to the WebSocket Broadcaster.
4. **Client Update**: Frontend receives Diff, applies it to local state, and triggers a re-render.
5. **User Action**: User clicks "Add Shop". API request sent. Server validates, updates DB, and injects "New Shop" event into the Engine queue.
