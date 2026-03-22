import WatchConnectivity
import Foundation
import Security

/// iPhone-side WCSession handler for the Pilareta Apple Watch app.
///
/// This singleton activates a WCSession on the phone, receives messages from
/// the watch (real-time `sendMessage` and queued `transferUserInfo`), and
/// fulfils them by calling the Pilareta Tribe REST API.
///
/// Integration:
///   Call `WatchSessionManager.shared` early in the app lifecycle (e.g. from
///   `AppDelegate.application(_:didFinishLaunchingWithOptions:)` or from a
///   native module `initialize()`) so the session is ready before the watch
///   sends its first message.
class WatchSessionManager: NSObject, WCSessionDelegate {

    static let shared = WatchSessionManager()

    // MARK: - Configuration

    private var apiBaseURL: String {
        // In production this could read from a plist / build config.
        return "https://tribe.pilareta.com"
    }

    /// Reads the access token that the React Native app (expo-secure-store)
    /// wrote to the iOS Keychain.
    ///
    /// expo-secure-store stores items with:
    ///   kSecAttrService  = "<keychainService ?? 'app'>:<auth-tag>"
    ///   kSecAttrAccount  = Data(key.utf8)
    ///   kSecAttrGeneric  = Data(key.utf8)
    ///
    /// The Pilareta app uses the defaults (no custom keychainService, no
    /// biometric auth), so the service is "app:no-auth" and the account is
    /// the raw UTF-8 bytes of "pilareta_access_token".
    private var accessToken: String? {
        let key = "pilareta_access_token"
        let keyData = Data(key.utf8)

        let query: [String: Any] = [
            kSecClass as String:       kSecClassGenericPassword,
            kSecAttrService as String:  "app:no-auth",
            kSecAttrAccount as String:  keyData,
            kSecAttrGeneric as String:  keyData,
            kSecReturnData as String:   true,
            kSecMatchLimit as String:   kSecMatchLimitOne,
        ]

        var result: AnyObject?
        let status = SecItemCopyMatching(query as CFDictionary, &result)

        guard status == errSecSuccess, let data = result as? Data else {
            // Fall back to the legacy key format (no auth tag) which
            // expo-secure-store also checks during reads.
            return readLegacyToken()
        }
        return String(data: data, encoding: .utf8)
    }

    /// Fallback: expo-secure-store writes both a tagged and a legacy entry.
    /// If the tagged lookup fails, try the legacy one (service = "app").
    private func readLegacyToken() -> String? {
        let key = "pilareta_access_token"
        let keyData = Data(key.utf8)

        let query: [String: Any] = [
            kSecClass as String:       kSecClassGenericPassword,
            kSecAttrService as String:  "app",
            kSecAttrAccount as String:  keyData,
            kSecAttrGeneric as String:  keyData,
            kSecReturnData as String:   true,
            kSecMatchLimit as String:   kSecMatchLimitOne,
        ]

        var result: AnyObject?
        let status = SecItemCopyMatching(query as CFDictionary, &result)
        guard status == errSecSuccess, let data = result as? Data else { return nil }
        return String(data: data, encoding: .utf8)
    }

    // MARK: - Lifecycle

    override init() {
        super.init()
        if WCSession.isSupported() {
            let session = WCSession.default
            session.delegate = self
            session.activate()
        }
    }

    // MARK: - WCSessionDelegate (Required on iOS)

    func session(_ session: WCSession,
                 activationDidCompleteWith activationState: WCSessionActivationState,
                 error: Error?) {
        if let error = error {
            print("[WatchSession] Activation error: \(error.localizedDescription)")
        } else {
            print("[WatchSession] Activated with state: \(activationState.rawValue)")
        }
    }

    func sessionDidBecomeInactive(_ session: WCSession) {
        // Required on iOS -- no action needed.
    }

    func sessionDidDeactivate(_ session: WCSession) {
        // Re-activate for the next paired watch (multi-watch support).
        WCSession.default.activate()
    }

    // MARK: - Handle Real-Time Messages from Watch

    func session(_ session: WCSession,
                 didReceiveMessage message: [String: Any],
                 replyHandler: @escaping ([String: Any]) -> Void) {
        guard let action = message["action"] as? String else {
            replyHandler(["error": "Missing action"])
            return
        }

        switch action {
        case "getStats":
            fetchStats { stats in
                replyHandler(stats)
            }
        case "logWorkout":
            logWorkout(data: message) { result in
                replyHandler(result)
            }
        default:
            replyHandler(["error": "Unknown action: \(action)"])
        }
    }

    // MARK: - Handle Queued UserInfo from Watch (Offline Deliveries)

    func session(_ session: WCSession,
                 didReceiveUserInfo userInfo: [String: Any] = [:]) {
        guard let action = userInfo["action"] as? String else { return }

        switch action {
        case "logWorkout":
            logWorkout(data: userInfo) { result in
                if let success = result["success"] as? Bool, success {
                    print("[WatchSession] Queued workout logged successfully")
                } else {
                    print("[WatchSession] Queued workout failed: \(result)")
                }
            }
        default:
            print("[WatchSession] Unknown queued action: \(action)")
        }
    }

    // MARK: - API: Fetch Stats

    private func fetchStats(completion: @escaping ([String: Any]) -> Void) {
        let fallback: [String: Any] = [
            "currentStreak": 0,
            "todayCalories": 0,
            "weeklyWorkouts": 0,
        ]

        guard let token = accessToken else {
            print("[WatchSession] No access token -- returning zeroed stats")
            completion(fallback)
            return
        }

        guard let url = URL(string: "\(apiBaseURL)/api/track/stats") else {
            completion(fallback)
            return
        }

        var request = URLRequest(url: url)
        request.setValue("Bearer \(token)", forHTTPHeaderField: "Authorization")
        request.timeoutInterval = 10

        URLSession.shared.dataTask(with: request) { data, response, error in
            if let error = error {
                print("[WatchSession] fetchStats network error: \(error.localizedDescription)")
                completion(fallback)
                return
            }

            guard let data = data,
                  let json = try? JSONSerialization.jsonObject(with: data) as? [String: Any],
                  let stats = json["stats"] as? [String: Any] else {
                print("[WatchSession] fetchStats: bad response body")
                completion(fallback)
                return
            }

            // The API returns stats.totalCalories and stats.weeklyWorkouts.
            // Map to the keys the watch expects.
            completion([
                "currentStreak":  stats["currentStreak"] as? Int ?? 0,
                "todayCalories":  stats["totalCalories"] as? Int ?? 0,
                "weeklyWorkouts": stats["weeklyWorkouts"] as? Int ?? 0,
            ])
        }.resume()
    }

    // MARK: - API: Log Workout

    /// The watch sends:
    ///   "action":          "logWorkout"
    ///   "workoutType":     String   (e.g. "pilates", "yoga")
    ///   "durationMinutes": Int
    ///   "rpe":             Int      (defaults to 5)
    ///   "workoutDate":     String   (ISO 8601)
    ///   "focusAreas":      [String] (optional)
    private func logWorkout(data: [String: Any],
                            completion: @escaping ([String: Any]) -> Void) {
        guard let token = accessToken else {
            completion(["success": false, "error": "Not authenticated"])
            return
        }

        guard let url = URL(string: "\(apiBaseURL)/api/track/logs") else {
            completion(["success": false, "error": "Invalid URL"])
            return
        }

        // Read fields using the same keys the watch WorkoutManager sends.
        let workoutType = data["workoutType"] as? String ?? "pilates"
        let durationMinutes = data["durationMinutes"] as? Int ?? 30
        let rpe = data["rpe"] as? Int ?? 5
        let workoutDate = data["workoutDate"] as? String
            ?? ISO8601DateFormatter().string(from: Date())
        let focusAreas = data["focusAreas"] as? [String] ?? []

        let body: [String: Any] = [
            "workoutDate":     workoutDate,
            "durationMinutes": durationMinutes,
            "workoutType":     workoutType,
            "rpe":             rpe,
            "focusAreas":      focusAreas,
        ]

        var request = URLRequest(url: url)
        request.httpMethod = "POST"
        request.setValue("Bearer \(token)", forHTTPHeaderField: "Authorization")
        request.setValue("application/json", forHTTPHeaderField: "Content-Type")
        request.timeoutInterval = 10
        request.httpBody = try? JSONSerialization.data(withJSONObject: body)

        URLSession.shared.dataTask(with: request) { data, response, error in
            if let error = error {
                print("[WatchSession] logWorkout network error: \(error.localizedDescription)")
                completion(["success": false, "error": error.localizedDescription])
                return
            }

            if let httpResponse = response as? HTTPURLResponse,
               (200...201).contains(httpResponse.statusCode) {
                completion(["success": true])
            } else {
                let code = (response as? HTTPURLResponse)?.statusCode ?? -1
                print("[WatchSession] logWorkout failed with HTTP \(code)")
                completion(["success": false, "error": "HTTP \(code)"])
            }
        }.resume()
    }
}
