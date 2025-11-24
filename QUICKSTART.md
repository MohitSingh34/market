# Market Simulation - Quick Start Guide

## Current Status

✅ **Backend Server**: Running on port 3001
✅ **Database**: PostgreSQL running in Docker
✅ **Seeded Data**: 200 agents + 10 shops
✅ **WebSocket**: Realtime updates working
✅ **Enhanced Agent FSM**: Agents now have intelligent pathfinding and shop-seeking behavior

## Starting the Application

### Terminal 1: Backend (Already Running)
```bash
cd /home/mohit/Projects/market
npm run start:dev
```
**Status**: ✅ Running

### Terminal 2: Frontend
```bash
cd /home/mohit/Projects/market/client
npm run dev
```

Then open: **http://localhost:3000**

## What's Been Implemented

### Phase 1-3 (Complete ✅)
- ✅ Architecture & Design Documents
- ✅ Database Schema (Prisma)
- ✅ Backend API (Fastify + TypeScript)
- ✅ Deterministic Simulation Engine
- ✅ WebSocket Realtime Updates
- ✅ Next.js Frontend
- ✅ MapCanvas with Konva Rendering
- ✅ AddShop Modal

### Phase 4 (In Progress 🚧)
- ✅ Enhanced Agent FSM with:
  - Intelligent pathfinding (move towards target)
  - Shop seeking behavior (find nearest shop when hungry)
  - Random wandering when idle
  - Hunger and fatigue systems
  - State transitions: IDLE → SEARCHING → TRAVELING → BUYING → RESTING
- ✅ Shop name labels on map
- ✅ Improved UI styling with gradients and shadows
- ✅ ControlPanel component (Play/Pause/Speed controls)

## Features

### Agents (200 total)
- **Green dots**: Workers
- **Orange dots**: Consumers
- **Behavior**: Agents wander, seek shops when hungry, buy food, rest when tired
- **Movement**: Smooth pathfinding towards targets

### Shops (10 initial)
- **Blue rectangles** with name labels
- **Dynamic creation**: Click "Add Shop" button
- **Realtime sync**: New shops appear immediately for all clients

### UI Controls
- **Tick Counter**: Shows simulation progress
- **Agent Count**: Live count of agents
- **Shop Count**: Live count of shops
- **Add Shop Button**: Create new shops dynamically

## Next Steps

### Immediate (To Run Demo)
1. Start frontend: `cd client && npm run dev`
2. Open browser: http://localhost:3000
3. Watch agents move and interact with shops
4. Click "Add Shop" to create new shops

### Future Enhancements
- [ ] Auto-restock logic for shops
- [ ] Price dynamics (supply/demand)
- [ ] Item ancestry UI (ShopCard component)
- [ ] Money flow visualization
- [ ] Test scenarios (supply shock, festival demand, worker strike)
- [ ] Performance optimization (LOD for large agent counts)

## Files Modified/Created

### Backend
- `server/src/simulation/agent.ts` - Enhanced FSM with pathfinding
- `server/src/simulation/engine.ts` - Updated to use enhanced agents
- `server/src/index.ts` - API endpoints

### Frontend
- `client/components/MapCanvas.tsx` - Fixed SSR, added labels, improved styling
- `client/components/ControlPanel.tsx` - NEW: Play/Pause/Speed controls
- `client/components/AddShopModal.tsx` - Shop creation modal

### Documentation
- `README.md` - Project overview
- `docs/architecture.md` - System architecture
- `docs/simulation.md` - Simulation design
- `walkthrough.md` - Implementation walkthrough

## Troubleshooting

### Frontend won't start
```bash
cd client
rm -rf .next node_modules
npm install
npm run dev
```

### Backend issues
```bash
# Restart Docker
docker-compose down
docker-compose up -d

# Re-run migrations
npx prisma migrate dev

# Re-seed
npm run seed -- --seed 12345
```

### WebSocket not connecting
- Check backend is running on port 3001
- Check browser console for errors
- Verify CORS is enabled in backend
