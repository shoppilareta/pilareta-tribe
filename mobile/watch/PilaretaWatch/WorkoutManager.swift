import Foundation
import WatchConnectivity
import WatchKit

class WorkoutManager: NSObject, ObservableObject, WCSessionDelegate {
    // MARK: - Published State

    @Published var currentStreak: Int = 0
    @Published var todayCalories: Int = 0
    @Published var weeklyWorkouts: Int = 0
    @Published var lastSyncStatus: String = ""
    @Published var lastSyncTime: Date? = nil
    @Published var isLoading: Bool = false
    @Published var isPhoneReachable: Bool = false

    // Offline cache keys
    private let cacheStreakKey = "cached_streak"
    private let cacheCaloriesKey = "cached_calories"
    private let cacheWeeklyKey = "cached_weekly"
    private let cacheSyncTimeKey = "cached_sync_time"

    // Timeout duration for WCSession calls
    private let messageTimeout: TimeInterval = 5.0

    override init() {
        super.init()
        loadCachedStats()

        if WCSession.isSupported() {
            let session = WCSession.default
            session.delegate = self
            session.activate()
        }
    }

    // MARK: - Fetch Stats

    func fetchStats() {
        guard WCSession.default.activationState == .activated else {
            lastSyncStatus = "Not activated"
            return
        }

        guard WCSession.default.isReachable else {
            isPhoneReachable = false
            lastSyncStatus = "iPhone not connected"
            return
        }

        isPhoneReachable = true
        isLoading = true
        lastSyncStatus = "Syncing..."

        // Timeout timer -- if no reply within messageTimeout, mark as timed out
        var didReceiveReply = false
        let timeoutWork = DispatchWorkItem { [weak self] in
            guard let self = self, !didReceiveReply else { return }
            DispatchQueue.main.async {
                self.isLoading = false
                self.lastSyncStatus = "Sync timed out"
            }
        }
        DispatchQueue.main.asyncAfter(deadline: .now() + messageTimeout, execute: timeoutWork)

        WCSession.default.sendMessage(["action": "getStats"], replyHandler: { [weak self] response in
            didReceiveReply = true
            timeoutWork.cancel()
            guard let self = self else { return }

            DispatchQueue.main.async {
                self.currentStreak = response["currentStreak"] as? Int ?? self.currentStreak
                self.todayCalories = response["todayCalories"] as? Int ?? self.todayCalories
                self.weeklyWorkouts = response["weeklyWorkouts"] as? Int ?? self.weeklyWorkouts
                self.lastSyncTime = Date()
                self.lastSyncStatus = "Synced"
                self.isLoading = false
                self.cacheStats()
            }
        }, errorHandler: { [weak self] error in
            didReceiveReply = true
            timeoutWork.cancel()
            guard let self = self else { return }

            DispatchQueue.main.async {
                self.isLoading = false
                self.lastSyncStatus = "Sync failed"
                print("WC fetchStats error: \(error.localizedDescription)")
            }
        })
    }

    // MARK: - Log Workout

    /// Log a workout from the timer or quick-log. Sends to phone, falls back to transferUserInfo.
    func logWorkout(type: String, duration: Int, completion: (() -> Void)? = nil) {
        let payload: [String: Any] = [
            "action": "logWorkout",
            "workoutType": type,
            "durationMinutes": duration,
            "rpe": 5,
            "workoutDate": ISO8601DateFormatter().string(from: Date()),
        ]

        guard WCSession.default.activationState == .activated else {
            // Queue for later delivery
            WCSession.default.transferUserInfo(payload)
            DispatchQueue.main.async {
                self.lastSyncStatus = "Queued (offline)"
                WKInterfaceDevice.current().play(.failure)
                completion?()
            }
            return
        }

        if WCSession.default.isReachable {
            var didReceiveReply = false
            let timeoutWork = DispatchWorkItem { [weak self] in
                guard let self = self, !didReceiveReply else { return }
                // Timeout -- fall back to transferUserInfo
                WCSession.default.transferUserInfo(payload)
                DispatchQueue.main.async {
                    self.lastSyncStatus = "Queued (timeout)"
                    WKInterfaceDevice.current().play(.retry)
                    completion?()
                }
            }
            DispatchQueue.main.asyncAfter(deadline: .now() + messageTimeout, execute: timeoutWork)

            WCSession.default.sendMessage(payload, replyHandler: { [weak self] response in
                didReceiveReply = true
                timeoutWork.cancel()
                guard let self = self else { return }

                DispatchQueue.main.async {
                    if let newStreak = response["currentStreak"] as? Int {
                        self.currentStreak = newStreak
                    }
                    if let newCalories = response["todayCalories"] as? Int {
                        self.todayCalories = newCalories
                    }
                    if let newWeekly = response["weeklyWorkouts"] as? Int {
                        self.weeklyWorkouts = newWeekly
                    }
                    self.lastSyncTime = Date()
                    self.lastSyncStatus = "Logged"
                    self.cacheStats()
                    WKInterfaceDevice.current().play(.success)
                    completion?()
                }
            }, errorHandler: { [weak self] error in
                didReceiveReply = true
                timeoutWork.cancel()
                guard let self = self else { return }

                // Fall back to queued delivery
                WCSession.default.transferUserInfo(payload)
                DispatchQueue.main.async {
                    self.lastSyncStatus = "Queued"
                    print("WC logWorkout error: \(error.localizedDescription)")
                    WKInterfaceDevice.current().play(.retry)
                    completion?()
                }
            })
        } else {
            // Phone not reachable -- queue
            WCSession.default.transferUserInfo(payload)
            DispatchQueue.main.async {
                self.lastSyncStatus = "Queued (offline)"
                WKInterfaceDevice.current().play(.retry)
                completion?()
            }
        }
    }

    // MARK: - Caching

    private func cacheStats() {
        let defaults = UserDefaults.standard
        defaults.set(currentStreak, forKey: cacheStreakKey)
        defaults.set(todayCalories, forKey: cacheCaloriesKey)
        defaults.set(weeklyWorkouts, forKey: cacheWeeklyKey)
        defaults.set(Date().timeIntervalSince1970, forKey: cacheSyncTimeKey)
    }

    private func loadCachedStats() {
        let defaults = UserDefaults.standard
        currentStreak = defaults.integer(forKey: cacheStreakKey)
        todayCalories = defaults.integer(forKey: cacheCaloriesKey)
        weeklyWorkouts = defaults.integer(forKey: cacheWeeklyKey)

        let cachedTime = defaults.double(forKey: cacheSyncTimeKey)
        if cachedTime > 0 {
            lastSyncTime = Date(timeIntervalSince1970: cachedTime)
            lastSyncStatus = "Cached"
        }
    }

    // MARK: - Helpers

    var timeSinceLastSync: String {
        guard let syncTime = lastSyncTime else {
            return "Never synced"
        }
        let interval = Date().timeIntervalSince(syncTime)
        if interval < 60 {
            return "Just now"
        } else if interval < 3600 {
            let mins = Int(interval / 60)
            return "\(mins)m ago"
        } else if interval < 86400 {
            let hours = Int(interval / 3600)
            return "\(hours)h ago"
        } else {
            let days = Int(interval / 86400)
            return "\(days)d ago"
        }
    }

    var isOffline: Bool {
        return !WCSession.default.isReachable
    }

    // MARK: - WCSessionDelegate

    func session(_ session: WCSession, activationDidCompleteWith activationState: WCSessionActivationState, error: Error?) {
        DispatchQueue.main.async {
            if activationState == .activated {
                self.isPhoneReachable = session.isReachable
                self.fetchStats()
            } else if let error = error {
                self.lastSyncStatus = "Activation failed"
                print("WCSession activation error: \(error.localizedDescription)")
            }
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
            if let weekly = message["weeklyWorkouts"] as? Int {
                self.weeklyWorkouts = weekly
            }
            self.lastSyncTime = Date()
            self.lastSyncStatus = "Updated"
            self.cacheStats()
        }
    }

    func sessionReachabilityDidChange(_ session: WCSession) {
        DispatchQueue.main.async {
            self.isPhoneReachable = session.isReachable
            if session.isReachable {
                self.lastSyncStatus = "Connected"
                self.fetchStats()
            } else {
                self.lastSyncStatus = "iPhone disconnected"
            }
        }
    }
}
