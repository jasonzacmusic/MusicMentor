#!/bin/bash
set -e

echo "🚀 Deploying ChordCraft Music Learning App to Firebase..."

# Build the app
echo "📦 Building production app..."
cd client
npm run build
cd ..

# Check if Firebase is logged in
echo "🔐 Checking Firebase authentication..."
if ! firebase projects:list &> /dev/null; then
    echo "❌ Not logged into Firebase. Please run: firebase login"
    exit 1
fi

# Deploy to Firebase Hosting
echo "🌐 Deploying to Firebase Hosting..."
firebase deploy

echo "✅ Deployment complete!"
echo "🌍 Your app is live at: https://musicmentor-d33b2.web.app"