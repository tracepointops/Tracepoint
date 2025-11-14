#!/bin/bash
set -e

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

# Prevent WSL from timing out
export WSL_INTEROP=/run/WSL/1_interop

echo "Building dependencies first..."
npx nx run-many -t build -p twenty-shared twenty-ui twenty-emails --skip-nx-cache=false

echo ""
echo "Starting services..."
echo "Frontend: http://localhost:3001"
echo "Backend:  http://localhost:3000"
echo "Login:    tim@apple.dev / tim@apple.dev"
echo ""
echo "Press Ctrl+C to stop"
echo "======================================"
echo ""

# Start with daemon disabled and in non-interactive mode
exec npx nx start --skip-nx-cache=false
