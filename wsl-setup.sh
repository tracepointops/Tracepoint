#!/bin/bash
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"

cd "/mnt/c/Users/lytle/Desktop/Swanson CRM/twenty"

echo "Starting services..."
sudo service postgresql start
sudo service redis-server start

echo "Initializing database..."
npx nx database:reset twenty-server

echo ""
echo "✓ Twenty database initialized!"
echo ""
echo "To start Twenty, run:"
echo "  cd '/mnt/c/Users/lytle/Desktop/Swanson CRM/twenty'"
echo "  npx nx start"
echo ""
echo "Frontend: http://localhost:3001"
echo "Backend: http://localhost:3000"
echo "Login: tim@apple.dev / tim@apple.dev"
