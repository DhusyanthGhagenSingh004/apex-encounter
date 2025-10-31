# Mobile Setup Instructions for Android Studio

This guide will help you set up and run your Battle Royale game in Android Studio.

## Prerequisites

Before you begin, make sure you have:

1. **Android Studio** installed ([Download here](https://developer.android.com/studio))
2. **Node.js** (v18 or higher) and npm installed
3. **Git** installed on your computer
4. A **GitHub account** connected to your Lovable project

## Step-by-Step Setup

### 1. Export Your Project to GitHub

1. In Lovable, click the **GitHub** button in the top right
2. Click **"Connect to GitHub"** if not already connected
3. Click **"Create Repository"** to push your code to GitHub
4. Wait for the repository to be created

### 2. Clone the Project Locally

Open your terminal/command prompt and run:

```bash
git clone https://github.com/YOUR-USERNAME/YOUR-REPO-NAME.git
cd YOUR-REPO-NAME
```

### 3. Install Dependencies

```bash
npm install
```

### 4. Add Android Platform

```bash
npx cap add android
```

This creates the `android/` folder with all native Android files.

### 5. Update Android Platform

```bash
npx cap update android
```

This ensures all Capacitor plugins are properly linked.

### 6. Build Your Web App

```bash
npm run build
```

This creates the `dist/` folder with your compiled app.

### 7. Sync to Android

```bash
npx cap sync
```

This copies your web app into the Android project.

### 8. Open in Android Studio

```bash
npx cap open android
```

Or manually open Android Studio and select `File > Open` and choose the `android/` folder.

## Running the App

### Option A: Using Android Studio

1. In Android Studio, wait for Gradle sync to complete
2. Click the **green play button** (▶) in the toolbar
3. Select an emulator or connected device
4. The app will build and launch

### Option B: Using Command Line

With a device connected or emulator running:

```bash
npx cap run android
```

## Testing Mobile Controls

The app automatically detects if it's running on a mobile device and shows:

- **Virtual Joystick** (bottom-left) - for movement
- **Shoot Button** (bottom-right) - hold to fire continuously
- **Pick Up Button** (right side) - appears when near weapons

You can also test mobile controls on desktop by adding `?mobile=true` to the URL:
```
http://localhost:8080/?mobile=true
```

## Making Changes

### Development Workflow:

1. **Make changes in Lovable** (easiest way)
2. Changes auto-sync to GitHub
3. **Pull changes locally:**
   ```bash
   git pull
   ```
4. **Rebuild if needed:**
   ```bash
   npm run build
   ```
5. **Sync to Android:**
   ```bash
   npx cap sync
   ```
6. **Reload in Android Studio** or re-run the app

### Hot Reload (Development Mode):

The Capacitor config is set up to load from the Lovable preview URL, so you can:
- Make changes in Lovable
- Reload the app in Android Studio (Cmd+R / Ctrl+R)
- See changes instantly without rebuilding

## Troubleshooting

### Build Fails in Android Studio

- Ensure you have Java 17 installed (Android Studio should prompt you)
- Check that Gradle sync completed successfully
- Try `File > Invalidate Caches / Restart`

### App Shows White Screen

- Make sure you ran `npm run build` before `npx cap sync`
- Check that the `dist/` folder exists and has files
- Verify the `webDir` in `capacitor.config.ts` is set to `"dist"`

### Controls Not Working

- Make sure you're testing on an actual device or emulator (not browser)
- Check that touch events aren't being blocked by other elements
- Try force-enabling mobile mode with `?mobile=true` parameter

### Hot Reload Not Working

- Verify the `server.url` in `capacitor.config.ts` is correct
- Make sure your device/emulator can reach the Lovable preview URL
- Check that both device and computer are on the same network (for local testing)

## Publishing to Google Play Store

When you're ready to publish:

1. **Remove the development server config** from `capacitor.config.ts`:
   ```typescript
   // Remove or comment out:
   // server: {
   //   url: '...',
   //   cleartext: true
   // }
   ```

2. **Build production version:**
   ```bash
   npm run build
   npx cap sync
   ```

3. **In Android Studio:**
   - Go to `Build > Generate Signed Bundle / APK`
   - Create a keystore (save it securely!)
   - Select "Android App Bundle" (AAB)
   - Build release version

4. **Upload to Google Play Console:**
   - Create app listing
   - Upload the AAB file
   - Fill in store listing details
   - Submit for review

## Useful Commands Reference

```bash
# Install dependencies
npm install

# Add platform
npx cap add android

# Update platform
npx cap update android

# Build web app
npm run build

# Sync to native platform
npx cap sync

# Open in Android Studio
npx cap open android

# Run on device/emulator
npx cap run android

# Pull latest changes
git pull

# Check Capacitor doctor
npx cap doctor
```

## Need Help?

- [Capacitor Documentation](https://capacitorjs.com/docs)
- [Android Studio Guide](https://developer.android.com/studio/intro)
- [Lovable Documentation](https://docs.lovable.dev/)
- [Lovable Discord Community](https://discord.gg/lovable)

## Next Steps

- Test all game features on mobile
- Adjust control sensitivity if needed
- Add custom app icon and splash screen
- Configure app permissions in `AndroidManifest.xml`
- Test on different screen sizes
- Optimize performance for lower-end devices

Happy coding! 🎮📱
