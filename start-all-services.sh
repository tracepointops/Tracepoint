#!/bin/bash

echo "🚀 Starting TracePoint CRM Services..."

# Kill any existing processes
echo "Stopping existing processes..."
pkill -f "yarn start:prod" 2>/dev/null
pkill -f "yarn worker:prod" 2>/dev/null
pkill -f "ngrok" 2>/dev/null
sleep 2

# Start Backend
echo "Starting backend server..."
cd /home/lytle/twenty-dev/packages/twenty-server
# Load environment variables from .env file and start backend
nohup bash -c 'set -a; source .env; set +a; yarn start:prod' > /tmp/tracepoint-backend.log 2>&1 &
BACKEND_PID=$!
echo "✅ Backend started (PID: $BACKEND_PID)"

# Wait for backend to initialize
sleep 10

# Start Worker
echo "Starting background worker..."
cd /home/lytle/twenty-dev/packages/twenty-server
nohup yarn worker:prod > /tmp/tracepoint-worker.log 2>&1 &
WORKER_PID=$!
echo "✅ Worker started (PID: $WORKER_PID)"

# Start Ngrok
echo "Starting ngrok tunnel..."
nohup ngrok http --domain=tracepoint-api.ngrok.app 3000 > /tmp/tracepoint-ngrok.log 2>&1 &
NGROK_PID=$!
echo "✅ Ngrok started (PID: $NGROK_PID)"

sleep 3

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅ All services started successfully!"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "📊 Service Status:"
echo "  Backend:  PID $BACKEND_PID (Log: /tmp/tracepoint-backend.log)"
echo "  Worker:   PID $WORKER_PID (Log: /tmp/tracepoint-worker.log)"
echo "  Ngrok:    PID $NGROK_PID (Log: /tmp/tracepoint-ngrok.log)"
echo ""
echo "🌐 URLs:"
echo "  Frontend:    https://top.tracepointops.com"
echo "  Backend API: https://tracepoint-api.ngrok.app"
echo "  Ngrok Web:   http://localhost:4040"
echo ""
echo "📝 View logs:"
echo "  tail -f /tmp/tracepoint-backend.log"
echo "  tail -f /tmp/tracepoint-worker.log"
echo "  tail -f /tmp/tracepoint-ngrok.log"
echo ""
echo "🛑 Stop all services:"
echo "  ./stop-all-services.sh"
echo ""
