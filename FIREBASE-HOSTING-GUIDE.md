# Firebase Hosting Guide for ChordCraft Music Learning App

This guide will help you deploy your music learning app to Firebase Hosting.

## Prerequisites
- A Google account
- Node.js installed locally
- Firebase CLI installed

## Step 1: Install Firebase CLI
```bash
npm install -g firebase-tools
```

## Step 2: Set Up Firebase Project
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Create a project" or "Add project"
3. Enter project name (e.g., "chordcraft-music-app")
4. Disable Google Analytics (optional for this project)
5. Click "Create project"

## Step 3: Enable Firebase Hosting
1. In your Firebase project console
2. Go to "Hosting" in the left sidebar
3. Click "Get started"
4. Follow the setup instructions

## Step 4: Build Your App for Production
From your project root directory:
```bash
# Build the client for production
cd client
npm run build
```

This creates a `dist` folder with optimized production files.

## Step 5: Initialize Firebase in Your Project
```bash
# From your project root
firebase login
firebase init hosting
```

Configuration options:
- **Use an existing project**: Select your Firebase project
- **Public directory**: Enter `client/dist`
- **Configure as single-page app**: Yes
- **Set up automatic builds**: No (for now)
- **Overwrite index.html**: No

## Step 6: Deploy to Firebase
```bash
firebase deploy
```

## Step 7: Access Your Live App
After deployment, Firebase will provide you with:
- **Hosting URL**: `https://your-project-id.web.app`
- **Custom domain setup** (optional): Available in Firebase Console

## Project Structure for Hosting
```
your-project/
├── client/
│   ├── dist/          # Production build (created by npm run build)
│   └── src/           # Source code
├── firebase.json      # Firebase configuration
└── .firebaserc        # Firebase project settings
```

## Important Notes
- Always run `npm run build` before deploying
- The app runs entirely in the browser (no server needed)
- All audio processing uses Web Audio API (browser-based)
- Music theory and chord generation work offline after initial load

## Custom Domain (Optional)
1. In Firebase Console → Hosting → Add custom domain
2. Follow verification steps
3. Firebase handles SSL certificates automatically

## Continuous Deployment (Optional)
Set up GitHub Actions for automatic deployment:
1. Connect your GitHub repository to Firebase
2. Enable GitHub integration in Firebase Console
3. Commits to main branch will auto-deploy

Your music learning app will be live and accessible worldwide at your Firebase Hosting URL!

## Firebase Analytics Integration
Your app now includes Firebase Analytics to track user engagement:

### Tracked Events:
- **play_sequence**: When users play musical sequences
- **generate_chords**: When users generate new chord progressions
- **Music interactions**: Various chord and note selections

### Analytics Dashboard:
1. Go to Firebase Console → Analytics
2. View real-time user activity and engagement metrics
3. Track popular features and usage patterns

### Privacy Note:
Analytics only activates in production builds, not during development.

## Rebuilding for Updates:
When you make changes to your app:
```bash
cd client
npm run build
firebase deploy
```

This ensures your live app includes the latest features and analytics tracking.