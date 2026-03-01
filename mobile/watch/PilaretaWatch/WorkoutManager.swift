import Foundation
import WatchConnectivity

class WorkoutManager: NSObject, ObservableObject, WCSessionDelegate {
    @Published var currentStreak: Int = 0
    @Published var todayCalories: Int = 0

    private let baseURL: String

    override init() {
        // In production, this would be configured via WatchConnectivity from the iOS app
        self.baseURL = "https://tribe.pilareta.com"
        super.init()

        if WCSession.isSupported() {
            let session = WCSession.default
            session.delegate = self
            session.activate()
        }
    }

    func fetchStats() {
        // Request stats from the iOS app via WatchConnectivity
        if WCSession.default.isReachable {
            WCSession.default.sendMessage(["action": "getStats"], replyHandler: { response in
                DispatchQueue.main.async {
                    self.currentStreak = response["currentStreak"] as? Int ?? 0
                    self.todayCalories = response["todayCalories"] as? Int ?? 0
                }
            }, errorHandler: { error in
                print("WC error: \(error)")
            })
        }
    }

    func logWorkout(type: String, duration: Int, completion: @escaping () -> Void) {
        let payload: [String: Any] = [
            "action": "logWorkout",
            "workoutType": type,
            "durationMinutes": duration,
            "rpe": 5,
            "workoutDate": ISO8601DateFormatter().string(from: Date()),
        ]

        if WCSession.default.isReachable {
            WCSession.default.sendMessage(payload, replyHandler: { response in
                DispatchQueue.main.async {
                    if let newStreak = response["currentStreak"] as? Int {
                        self.currentStreak = newStreak
                    }
                    completion()
                }
            }, errorHandler: { error in
                print("Log error: \(error)")
                DispatchQueue.main.async { completion() }
            })
        } else {
            // Queue for later via transferUserInfo
            WCSession.default.transferUserInfo(payload)
            DispatchQueue.main.async { completion() }
        }
    }

    // MARK: - WCSessionDelegate

    func session(_ session: WCSession, activationDidCompleteWith activationState: WCSessionActivationState, error: Error?) {
        if activationState == .activated {
            fetchStats()
        }
    }

    func session(_ session: WCSession, didReceiveMessage message: [String: Any]) {
        DispatchQueue.main.async {
            if let streak = message["currentStreak"] as? Int {
                self.currentStreak = streak
            }
            if let calories = message["todayCalories"] as? Int {
                self.todayCalories = calories
            }
        }
    }
}
