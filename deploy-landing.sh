#!/bin/bash
set -e

echo "🚀 Deploying Tracepoint Landing Page to Firebase..."

cd /home/lytle/twenty-dev/tracepoint-landing

# Check if Firebase CLI is installed
if ! command -v firebase &> /dev/null; then
    echo "❌ Firebase CLI not found. Installing..."
    npm install -g firebase-tools
fi

# Login to Firebase (if not already logged in)
echo "🔐 Checking Firebase authentication..."
firebase login --reauth

# Deploy to Firebase Hosting
echo "📦 Deploying to Firebase Hosting..."
firebase deploy --only hosting

echo ""
echo "✅ Deployment complete!"
echo "🌐 Your landing page is now live at:"
echo "   https://tracepoint-d4c9d.web.app"
echo ""
echo "📋 Next steps:"
echo "   1. Add custom domain www.tracepointops.com in Firebase Console"
echo "   2. Update DNS A records to point to Firebase"
echo "   3. SSL certificate will be auto-provisioned by Firebase"
