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
- Quick workout logging (type + duration)
- Streak display
- Today's calorie count
- Communication with iOS app via WatchConnectivity

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
