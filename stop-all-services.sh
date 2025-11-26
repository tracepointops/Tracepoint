#!/bin/bash

echo "🛑 Stopping TracePoint CRM Services..."

# Kill yarn processes
pkill -f "yarn start:prod" 2>/dev/null
pkill -f "yarn worker:prod" 2>/dev/null
pkill -f "ngrok" 2>/dev/null

# Kill actual node processes
pkill -f "node.*dist/src/main" 2>/dev/null
pkill -f "node.*queue-worker" 2>/dev/null

# Force kill any remaining on port 3000
lsof -ti:3000 2>/dev/null | xargs kill -9 2>/dev/null

sleep 2

echo "✅ All services stopped!"
echo ""
echo "Check if anything is still running:"
echo "  ps aux | grep -E 'node.*dist/src|ngrok' | grep -v grep"
