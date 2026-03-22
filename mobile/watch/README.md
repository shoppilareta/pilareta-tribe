# Pilareta Watch App

## Setup Instructions

The Apple Watch app requires a native iOS project (expo prebuild) and Xcode configuration.

### Steps

1. **Prebuild the iOS project:**
   ```bash
   cd mobile
   npx expo prebuild --platform ios
   ```

2. **Open in Xcode:**
   ```bash
   open ios/PilaretaTribe.xcworkspace
   ```

3. **Add watchOS target:**
   - File > New > Target > watchOS App
   - Product Name: `PilaretaWatch`
   - Bundle ID: `com.pilareta.tribe.watchkitapp`
   - Language: Swift
   - Interface: SwiftUI

4. **Copy watch app files:**
   ```bash
   cp watch/PilaretaWatch/*.swift ios/PilaretaWatch/
   ```

5. **Configure WatchConnectivity:**
   - Add `WatchConnectivity` framework to both iOS and watchOS targets
   - Enable "Watch Connectivity" capability on both targets

6. **Build & test:**
   - Select the PilaretaWatch scheme
   - Run on Apple Watch simulator paired with iPhone simulator

### Features
- **Dashboard** (Tab 1): Streak ring display, today's calories, weekly workout count, refresh button, last-synced indicator, offline badge
- **Workout Timer** (Tab 2): Select workout type, start/pause/resume/stop timer, haptic feedback at milestones (every 5 min), completion alert with duration logged
- **Quick Log** (Tab 3): Manual past-workout logging with type picker, duration stepper, success confirmation
- **WatchConnectivity**: Real-time sync with iPhone app, 5-second timeout on all messages, automatic fallback to `transferUserInfo` queue when phone is unreachable
- **Offline support**: Stats cached to UserDefaults, restored on launch, "Offline" badge shown when disconnected
- **Haptic feedback**: Start/stop/pause haptics, milestone notifications every 5 minutes, button click feedback throughout

### File Structure
- `PilaretaWatchApp.swift` -- App entry point
- `ContentView.swift` -- TabView with Dashboard, Timer, Quick Log tabs + Color hex extension
- `WorkoutTimerView.swift` -- Full workout timer with type selection and controls
- `QuickLogView.swift` -- Manual workout log form
- `WorkoutManager.swift` -- WatchConnectivity manager with caching, timeout, and error recovery

### Custom EAS Build
Add to `eas.json`:
```json
{
  "build": {
    "preview-watch": {
      "extends": "preview",
      "ios": {
        "scheme": "PilaretaTribe"
      }
    }
  }
}
```

Note: EAS Build with a watchOS target requires the managed workflow to be converted
to bare workflow via `expo prebuild`. This changes the build pipeline.
