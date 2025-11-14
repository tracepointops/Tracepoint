#!/bin/bash
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"

# Increase Node.js memory limit for large builds (WSL recommendation)
export NODE_OPTIONS="--max-old-space-size=8192"

cd "/mnt/c/Users/lytle/Desktop/Swanson CRM/twenty"

echo "======================================"
echo "Starting Twenty CRM"
echo "======================================"
echo ""

# Make sure services are running
echo "Checking database services..."
sudo service postgresql start > /dev/null 2>&1
sudo service redis-server start > /dev/null 2>&1
echo "✓ PostgreSQL and Redis are running"
echo ""

echo "Starting Twenty (migrations will run automatically)..."
echo "Press Ctrl+C to stop"
echo ""
echo "Once started:"
echo "  Frontend: http://localhost:3001"
echo "  Backend:  http://localhost:3000"
echo "  Login:    tim@apple.dev / tim@apple.dev"
echo ""
echo "======================================"
echo ""

# Start all services at once (with daemon disabled for better WSL performance)
NX_DAEMON=false npx nx start
