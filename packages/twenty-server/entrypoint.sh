#!/bin/sh
set -e

cd /app/packages/twenty-server

echo "🔍 Checking if database needs initialization..."

# Check if core schema exists
SCHEMA_EXISTS=$(node -e "
const { Client } = require('pg');
const client = new Client({ connectionString: process.env.PG_DATABASE_URL });
client.connect().then(() => {
  return client.query(\"SELECT EXISTS (SELECT 1 FROM information_schema.schemata WHERE schema_name = 'core')\");
}).then(result => {
  console.log(result.rows[0].exists ? 'true' : 'false');
  client.end();
}).catch(err => {
  console.log('false');
  client.end();
});
")

if [ "$SCHEMA_EXISTS" = "false" ]; then
  echo "📦 Database is empty - running setup from compiled scripts..."
  node dist/scripts/setup-db.js
  echo "🌱 Running database migrations..."
  yarn database:migrate:prod
  echo "🌱 Seeding dev workspaces..."
  yarn command:prod workspace:seed:dev
else
  echo "✅ Database already initialized"
  # Run upgrade command in case there are pending migrations
  yarn command:prod upgrade || echo "⚠️  Upgrade failed but continuing..."
fi

echo "🚀 Starting Twenty server..."
exec node /app/packages/twenty-server/dist/src/main.js
