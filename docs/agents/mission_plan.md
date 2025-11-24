# Agent Orchestration Plan

## Mission Overview
This plan details the missions for Antigravity agents to build the Market Simulation.

## Agent Missions

### Agent A: Infrastructure & Backend Scaffold
**Objective**: Initialize the repo, setup Node.js/TypeScript environment, and build the core simulation engine.
- [ ] Initialize `package.json` with dependencies (fastify, prisma, typescript, etc.).
- [ ] Create `Dockerfile` and `docker-compose.yml` for Postgres.
- [ ] Implement `server/src/simulation/engine.ts` (Tick loop).
- [ ] Implement `server/src/simulation/agent.ts` (FSM).
- [ ] Create `scripts/seed.ts`.

### Agent B: Frontend & Visualization
**Objective**: Build the Next.js frontend and MapCanvas.
- [ ] Initialize Next.js app in `client/`.
- [ ] Install `konva`, `react-konva`.
- [ ] Create `MapCanvas` component.
- [ ] Implement WebSocket client for realtime updates.
- [ ] Create "Add Shop" modal.

### Agent C: API & Integration
**Objective**: Connect Backend and Frontend, implement API endpoints.
- [ ] Implement Fastify routes in `server/src/api/`.
- [ ] Connect Frontend to API (Add Shop).
- [ ] Verify end-to-end flow (Add Shop -> Map Update).

### Agent D: Testing & Verification
**Objective**: Write tests and verify scenarios.
- [ ] Write unit tests for Simulation Engine.
- [ ] Create `scenarios/supply_shock.json`.
- [ ] Write E2E test script.
- [ ] Run final demo verification.
