#!/bin/bash

echo "========================================="
echo "   Tracepoint Firebase Deployment"
echo "========================================="
echo ""

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${BLUE}This script will help you deploy the Tracepoint ecosystem to Firebase${NC}"
echo ""
echo "You will deploy:"
echo "  1. Landing Page → www.tracepointops.com"
echo "  2. TOP (Twenty CRM) → top.tracepointops.com"
echo "  3. TOPS (Your app) → tops.tracepointops.com"
echo ""

read -p "Continue? (y/n) " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]
then
    exit 1
fi

echo ""
echo -e "${YELLOW}Step 1: Checking Firebase CLI${NC}"
if ! command -v firebase &> /dev/null
then
    echo "Firebase CLI not found. Installing..."
    npm install -g firebase-tools
else
    echo -e "${GREEN}✓ Firebase CLI installed${NC}"
fi

echo ""
echo -e "${YELLOW}Step 2: Logging in to Firebase${NC}"
firebase login

echo ""
echo -e "${YELLOW}Step 3: Building TOP (Twenty CRM)${NC}"
echo "This may take a few minutes..."

cd "$(dirname "$0")"

# Build frontend
echo "Building frontend..."
yarn nx build twenty-front --configuration=production

# Build server
echo "Building server..."
yarn nx build twenty-server --configuration=production

# Build emails
echo "Building emails..."
yarn nx build twenty-emails

echo -e "${GREEN}✓ Build complete${NC}"

echo ""
echo -e "${YELLOW}Step 4: Deploying Landing Page${NC}"
cd tracepoint-landing
firebase deploy --only hosting
cd ..

echo ""
echo -e "${YELLOW}Step 5: Deploying TOP Frontend${NC}"
cd packages/twenty-front

# Initialize if needed
if [ ! -f ".firebaserc" ]; then
    echo "Initializing Firebase in twenty-front..."
    firebase init hosting
fi

firebase deploy --only hosting
cd ../..

echo ""
echo -e "${GREEN}=========================================${NC}"
echo -e "${GREEN}   Deployment Complete!${NC}"
echo -e "${GREEN}=========================================${NC}"
echo ""
echo "Your apps are now live:"
echo -e "${BLUE}  Landing: https://www.tracepointops.com${NC}"
echo -e "${BLUE}  TOP:     https://top.tracepointops.com${NC}"
echo ""
echo -e "${YELLOW}Important Next Steps:${NC}"
echo "  1. Deploy backend to Google Cloud Run"
echo "  2. Setup custom domains in Firebase Console"
echo "  3. Configure DNS records"
echo "  4. Test all applications"
echo ""
echo "See FIREBASE_DEPLOYMENT_COMPLETE_GUIDE.md for full instructions"
