# Pilareta Watch App

## Architecture

The Apple Watch integration has two halves:

| Side | Directory | Runs on | Role |
|------|-----------|---------|------|
| **Watch app** | `watch/PilaretaWatch/` | Apple Watch | UI, timers, offline cache |
| **Companion handler** | `watch/CompanionHandler/` | iPhone | Receives watch messages, calls Pilareta API |

The watch sends `WCSession.sendMessage` (real-time) or `transferUserInfo` (queued/offline) messages. The companion handler on the iPhone receives them, reads the user's access token from the iOS Keychain, and calls the Pilareta Tribe REST API on behalf of the watch.

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

5. **Add the companion handler to the iOS target:**
   ```bash
   cp watch/CompanionHandler/WatchSessionManager.swift ios/PilaretaTribe/
   ```
   Then in Xcode:
   - Drag `WatchSessionManager.swift` into the **PilaretaTribe** (iOS) target group if it is not already included
   - Verify it is listed under Build Phases > Compile Sources for the iOS target
   - Add `WatchConnectivity.framework` to the iOS target under Frameworks, Libraries, and Embedded Content (or via Build Phases > Link Binary With Libraries)

6. **Activate the companion handler on app launch:**

   In `AppDelegate.swift` (created by expo prebuild), add the following so the
   WCSession is ready before the watch sends its first message:

   ```swift
   // Near the top of the file
   import WatchConnectivity

   // Inside application(_:didFinishLaunchingWithOptions:), before the return:
   _ = WatchSessionManager.shared
   ```

   If you are using a native module bridge instead of modifying AppDelegate
   directly, call `WatchSessionManager.shared` from the module's `initialize()`
   method.

7. **Configure WatchConnectivity capability:**
   - In Xcode, select the PilaretaTribe iOS target > Signing & Capabilities
   - Tap "+ Capability" and add "Background Modes" if not present
   - Enable "Background fetch" (needed so queued `transferUserInfo` payloads are delivered even when the app is backgrounded)
   - No explicit "WatchConnectivity" capability toggle exists -- the framework is linked in step 5

8. **Build & test:**
   - Select the PilaretaWatch scheme
   - Run on Apple Watch simulator paired with iPhone simulator
   - To test the companion handler, also run the PilaretaTribe iOS scheme on the paired iPhone simulator

## Companion Handler Details

### File

`watch/CompanionHandler/WatchSessionManager.swift`

### What It Does

- **Singleton**: `WatchSessionManager.shared` -- activates WCSession on init
- **`getStats` handler**: Calls `GET /api/track/stats` with the user's Bearer token, returns `currentStreak`, `todayCalories` (mapped from `totalCalories`), and `weeklyWorkouts`
- **`logWorkout` handler**: Calls `POST /api/track/logs` with JSON body containing `workoutDate`, `durationMinutes`, `workoutType`, `rpe`, and `focusAreas`
- **`transferUserInfo` handler**: Processes offline-queued workout logs when the watch could not reach the phone in real time

### Keychain Access

The companion handler reads the access token from the iOS Keychain using the
same storage format as `expo-secure-store`:

| Keychain attribute | Value |
|--------------------|-------|
| `kSecAttrService`  | `"app:no-auth"` (expo-secure-store default, no biometric auth) |
| `kSecAttrAccount`  | `Data("pilareta_access_token".utf8)` |
| `kSecAttrGeneric`  | `Data("pilareta_access_token".utf8)` |

If the primary lookup fails, it falls back to the legacy key (service = `"app"`).
This matches the expo-secure-store read path which checks both formats.

**Important**: If the app is updated to use a custom `keychainService` option in
`expo-secure-store`, the `kSecAttrService` value in `WatchSessionManager.swift`
must be updated to match.

### Message Protocol

Messages from the watch always include an `"action"` key:

**`getStats`**
```
Watch sends:  { "action": "getStats" }
Phone replies: { "currentStreak": 5, "todayCalories": 180, "weeklyWorkouts": 3 }
```

**`logWorkout`** (real-time or queued via transferUserInfo)
```
Watch sends:  {
  "action": "logWorkout",
  "workoutType": "pilates",
  "durationMinutes": 45,
  "rpe": 5,
  "workoutDate": "2026-03-22T10:00:00Z",
  "focusAreas": ["core"]
}
Phone replies: { "success": true }
```

## Watch App Features

- **Dashboard** (Tab 1): Streak ring display, today's calories, weekly workout count, refresh button, last-synced indicator, offline badge
- **Workout Timer** (Tab 2): Select workout type, start/pause/resume/stop timer, haptic feedback at milestones (every 5 min), completion alert with duration logged
- **Quick Log** (Tab 3): Manual past-workout logging with type picker, duration stepper, success confirmation
- **WatchConnectivity**: Real-time sync with iPhone app, 5-second timeout on all messages, automatic fallback to `transferUserInfo` queue when phone is unreachable
- **Offline support**: Stats cached to UserDefaults, restored on launch, "Offline" badge shown when disconnected
- **Haptic feedback**: Start/stop/pause haptics, milestone notifications every 5 minutes, button click feedback throughout

## File Structure

```
watch/
  PilaretaWatch/                         # watchOS target files
    PilaretaWatchApp.swift                  App entry point
    ContentView.swift                       TabView with Dashboard, Timer, Quick Log + Color hex extension
    WorkoutTimerView.swift                  Full workout timer with type selection and controls
    QuickLogView.swift                      Manual workout log form
    WorkoutManager.swift                    Watch-side WCSession manager with caching/timeout/recovery
  CompanionHandler/                      # iOS target files
    WatchSessionManager.swift               iPhone-side WCSession handler (API bridge)
  README.md                              This file
```

## Custom EAS Build

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

## Troubleshooting

**Watch shows "iPhone not connected"**
- Make sure the iOS app is running (at least backgrounded) on the paired iPhone
- Verify `WatchSessionManager.shared` is called in `AppDelegate`
- Check that WCSession activates without error in the Xcode console (`[WatchSession] Activated with state: 2`)

**Stats come back as zeros**
- The user may not be logged in -- check that `accessToken` is non-nil
- Verify the Keychain service name matches (`"app:no-auth"`)
- Test the API endpoint directly: `curl -H "Authorization: Bearer <token>" https://tribe.pilareta.com/api/track/stats`

**Queued workouts not delivered**
- Background fetch must be enabled on the iOS target
- The phone must eventually come into range / be unlocked for queued `transferUserInfo` payloads to be delivered
- Check Xcode console for `[WatchSession] Queued workout logged successfully` messages
