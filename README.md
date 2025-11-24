# Market Simulation

A web-based, self-running market simulation with 200 agents, dynamic shop creation, supply-chain lineage, and realtime money-flow visualization.

## Quick Start

### Prerequisites
- Node.js 18+
- Docker & Docker Compose
- PostgreSQL (via Docker)

### Installation

```bash
# Install dependencies
npm install
cd client && npm install && cd ..

# Start PostgreSQL
docker-compose up -d

# Run migrations
npx prisma migrate dev

# Seed database (200 agents, 10 shops)
npm run seed -- --seed 12345 --agents 200 --shops 10
```

### Running the Demo

```bash
# Option 1: Run everything with the demo script
./run_demo.sh --seed 12345

# Option 2: Run manually
# Terminal 1: Backend
npm run start:dev

# Terminal 2: Frontend
cd client && npm run dev
```

Visit:
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:3001

## Features

- ✅ **200 Agents**: Autonomous agents with FSM (Finite State Machine)
- ✅ **Dynamic Shops**: Add shops in realtime via UI
- ✅ **Realtime Updates**: WebSocket-based state synchronization
- ✅ **Deterministic Simulation**: Reproducible with seed parameter
- ✅ **Konva Canvas**: High-performance rendering with LOD

## Project Structure

```
market/
├── server/           # Backend (Fastify + TypeScript)
│   └── src/
│       ├── index.ts           # API server
│       └── simulation/
│           ├── engine.ts      # Tick loop
│           └── agent.ts       # Agent FSM
├── client/           # Frontend (Next.js)
│   ├── app/
│   └── components/
│       ├── MapCanvas.tsx      # Main canvas
│       └── AddShopModal.tsx   # Shop creation UI
├── prisma/           # Database schema
├── scripts/          # Seeding scripts
└── docs/             # Documentation
```

## Development

```bash
# Backend dev server (with hot reload)
npm run start:dev

# Frontend dev server
cd client && npm run dev

# Seed with custom parameters
npm run seed -- --seed 99999 --agents 100 --shops 5
```

## Documentation

- [Architecture](docs/architecture.md)
- [Simulation Design](docs/simulation.md)
- [API Specification](openapi.yaml)

## License

MIT
