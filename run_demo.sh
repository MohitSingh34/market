#!/bin/bash

# Market Simulation Demo Runner
# Usage: ./run_demo.sh [--seed SEED]

SEED=${1:-12345}

echo "🚀 Starting Market Simulation Demo with seed: $SEED"

# Start Docker Compose (Postgres)
echo "📦 Starting PostgreSQL..."
docker-compose up -d

# Wait for Postgres to be ready
echo "⏳ Waiting for database..."
sleep 5

# Run migrations
echo "🔧 Running database migrations..."
npx prisma migrate deploy

# Seed the database
echo "🌱 Seeding database with $SEED..."
npm run seed -- --seed $SEED --agents 200 --shops 10

# Start backend server
echo "🖥️  Starting backend server..."
npm run start:dev &
BACKEND_PID=$!

# Wait for backend to start
sleep 3

# Start frontend
echo "🌐 Starting frontend..."
cd client && npm run dev &
FRONTEND_PID=$!

echo ""
echo "✅ Demo is running!"
echo "   Backend: http://localhost:3001"
echo "   Frontend: http://localhost:3000"
echo ""
echo "Press Ctrl+C to stop all services"

# Wait for Ctrl+C
trap "echo '🛑 Stopping services...'; kill $BACKEND_PID $FRONTEND_PID; docker-compose down; exit" INT
wait
