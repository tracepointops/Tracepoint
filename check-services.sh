#!/bin/bash

echo "📊 TracePoint CRM Service Status"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Check Backend
if pgrep -f "yarn start:prod" > /dev/null; then
    BACKEND_PID=$(pgrep -f "yarn start:prod" | head -1)
    echo "✅ Backend:  Running (PID: $BACKEND_PID)"
else
    echo "❌ Backend:  Not running"
fi

# Check Worker
if pgrep -f "yarn worker:prod" > /dev/null; then
    WORKER_PID=$(pgrep -f "yarn worker:prod" | head -1)
    echo "✅ Worker:   Running (PID: $WORKER_PID)"
else
    echo "❌ Worker:   Not running"
fi

# Check Ngrok
if pgrep -f "ngrok" > /dev/null; then
    NGROK_PID=$(pgrep -f "ngrok" | head -1)
    echo "✅ Ngrok:    Running (PID: $NGROK_PID)"
    NGROK_URL=$(curl -s http://localhost:4040/api/tunnels 2>/dev/null | grep -o '"public_url":"https://[^"]*"' | head -1 | cut -d'"' -f4)
    if [ ! -z "$NGROK_URL" ]; then
        echo "   URL: $NGROK_URL"
    fi
else
    echo "❌ Ngrok:    Not running"
fi

# Check PostgreSQL
if systemctl is-active --quiet postgresql; then
    echo "✅ PostgreSQL: Running"
else
    echo "❌ PostgreSQL: Not running"
fi

# Check Redis
if systemctl is-active --quiet redis-server; then
    echo "✅ Redis:     Running"
else
    echo "❌ Redis:     Not running"
fi

echo ""
echo "🌐 URLs:"
echo "  Frontend:    https://top.tracepointops.com"
echo "  Backend API: https://tracepoint-api.ngrok.app"
echo "  Ngrok Web:   http://localhost:4040"
echo ""
