import Foundation
import HealthKit
import WatchConnectivity
import WatchKit

class WorkoutManager: NSObject, ObservableObject, WCSessionDelegate, WKExtendedRuntimeSessionDelegate {
    // MARK: - Published State

    @Published var currentStreak: Int = 0
    @Published var todayCalories: Int = 0
    @Published var weeklyWorkouts: Int = 0
    @Published var lastSyncStatus: String = ""
    @Published var lastSyncTime: Date? = nil
    @Published var isLoading: Bool = false
    @Published var isPhoneReachable: Bool = false
    @Published var pendingSyncCount: Int = 0
    @Published var newBadgeUnlocked: String? = nil

    // MARK: - HealthKit State

    @Published var currentHeartRate: Double = 0
    @Published var averageHeartRate: Double = 0
    @Published var activeCalories: Double = 0

    private let healthStore = HKHealthStore()
    private var workoutSession: HKWorkoutSession?
    private var workoutBuilder: HKLiveWorkoutBuilder?
    private var heartRateQuery: HKAnchoredObjectQuery?
    private var heartRateSamples: [Double] = []

    // MARK: - Extended Runtime

    private var extendedSession: WKExtendedRuntimeSession?

    // Offline cache keys
    private let cacheStreakKey = "cached_streak"
    private let cacheCaloriesKey = "cached_calories"
    private let cacheWeeklyKey = "cached_weekly"
    private let cacheSyncTimeKey = "cached_sync_time"

    // Timeout duration for WCSession calls
    private let messageTimeout: TimeInterval = 5.0

    // Shared date formatter (avoid creating new instances per call)
    private static let isoFormatter = ISO8601DateFormatter()

    override init() {
        super.init()
        loadCachedStats()

        if WCSession.isSupported() {
            let session = WCSession.default
            session.delegate = self
            session.activate()
        }
    }

    // MARK: - HealthKit Authorization

    func requestHealthKitPermission() {
        guard HKHealthStore.isHealthDataAvailable() else {
            print("[HealthKit] Health data not available on this device")
            return
        }

        let typesToShare: Set<HKSampleType> = [HKObjectType.workoutType()]
        guard let heartRateType = HKObjectType.quantityType(forIdentifier: .heartRate),
              let energyType = HKObjectType.quantityType(forIdentifier: .activeEnergyBurned) else {
            print("[HealthKit] Failed to create quantity types")
            return
        }
        let typesToRead: Set<HKObjectType> = [heartRateType, energyType]

        healthStore.requestAuthorization(toShare: typesToShare, toRead: typesToRead) { success, error in
            if success {
                print("[HealthKit] Authorization granted")
            } else if let error = error {
                print("[HealthKit] Authorization failed: \(error.localizedDescription)")
            }
        }
    }

    // MARK: - HealthKit Workout Session

    func startHealthKitWorkout(type: String) {
        let config = HKWorkoutConfiguration()
        config.activityType = mapToHKActivityType(type)
        config.locationType = .indoor

        do {
            workoutSession = try HKWorkoutSession(healthStore: healthStore, configuration: config)
            workoutBuilder = workoutSession?.associatedWorkoutBuilder()
            workoutBuilder?.dataSource = HKLiveWorkoutDataSource(
                healthStore: healthStore, workoutConfiguration: config
            )

            workoutSession?.startActivity(with: Date())
            workoutBuilder?.beginCollection(withStart: Date()) { [weak self] success, error in
                if success {
                    print("[HealthKit] Workout collection started")
                    DispatchQueue.main.async {
                        self?.heartRateSamples = []
                        self?.currentHeartRate = 0
                        self?.averageHeartRate = 0
                        self?.activeCalories = 0
                    }
                    self?.startHeartRateQuery()
                } else if let error = error {
                    print("[HealthKit] Failed to begin collection: \(error.localizedDescription)")
                }
            }
        } catch {
            print("[HealthKit] Failed to start workout session: \(error.localizedDescription)")
        }
    }

    func endHealthKitWorkout(completion: ((Double, Double) -> Void)? = nil) {
        stopHeartRateQuery()

        workoutSession?.end()
        workoutBuilder?.endCollection(withEnd: Date()) { [weak self] success, error in
            guard let self = self else { return }
            if success {
                self.workoutBuilder?.finishWorkout { workout, error in
                    if let workout = workout {
                        print("[HealthKit] Workout saved: \(workout)")
                    }
                    let avgHR = self.heartRateSamples.isEmpty
                        ? 0
                        : self.heartRateSamples.reduce(0, +) / Double(self.heartRateSamples.count)
                    let cals = self.activeCalories
                    DispatchQueue.main.async {
                        self.averageHeartRate = avgHR
                        completion?(avgHR, cals)
                    }
                }
            } else {
                let avgHR = self.heartRateSamples.isEmpty
                    ? 0
                    : self.heartRateSamples.reduce(0, +) / Double(self.heartRateSamples.count)
                let cals = self.activeCalories
                DispatchQueue.main.async {
                    self.averageHeartRate = avgHR
                    completion?(avgHR, cals)
                }
            }
        }

        workoutSession = nil
        workoutBuilder = nil
    }

    // MARK: - Heart Rate Monitoring

    func startHeartRateQuery() {
        guard let heartRateType = HKObjectType.quantityType(forIdentifier: .heartRate) else { return }

        let query = HKAnchoredObjectQuery(
            type: heartRateType,
            predicate: nil,
            anchor: nil,
            limit: HKObjectQueryNoLimit
        ) { [weak self] _, samples, _, _, _ in
            self?.processHeartRateSamples(samples)
        }

        query.updateHandler = { [weak self] _, samples, _, _, _ in
            self?.processHeartRateSamples(samples)
        }

        heartRateQuery = query
        healthStore.execute(query)
    }

    func stopHeartRateQuery() {
        if let query = heartRateQuery {
            healthStore.stop(query)
            heartRateQuery = nil
        }
    }

    private func processHeartRateSamples(_ samples: [HKSample]?) {
        guard let quantitySamples = samples as? [HKQuantitySample], !quantitySamples.isEmpty else { return }
        let bpmUnit = HKUnit.count().unitDivided(by: .minute())

        let newValues = quantitySamples.map { $0.quantity.doubleValue(for: bpmUnit) }
        let latestHR = newValues.last ?? 0

        DispatchQueue.main.async {
            self.heartRateSamples.append(contentsOf: newValues)
            self.currentHeartRate = latestHR
            if !self.heartRateSamples.isEmpty {
                self.averageHeartRate = self.heartRateSamples.reduce(0, +)
                    / Double(self.heartRateSamples.count)
            }
        }
    }

    private func mapToHKActivityType(_ type: String) -> HKWorkoutActivityType {
        switch type.lowercased() {
        case "reformer", "mat", "tower": return .pilates
        case "yoga": return .yoga
        case "running": return .running
        case "strength", "strength_training": return .traditionalStrengthTraining
        default: return .other
        }
    }

    // MARK: - Extended Runtime Session

    func startExtendedSession() {
        guard extendedSession == nil else { return }
        let session = WKExtendedRuntimeSession()
        session.delegate = self
        session.start()
        extendedSession = session
        print("[ExtendedRuntime] Session started")
    }

    func endExtendedSession() {
        extendedSession?.invalidate()
        extendedSession = nil
        print("[ExtendedRuntime] Session ended")
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
        let timeoutWork = DispatchWorkItem { [weak self] in
            guard let self = self else { return }
            DispatchQueue.main.async {
                self.isLoading = false
                self.lastSyncStatus = "Sync timed out"
            }
        }
        DispatchQueue.main.asyncAfter(deadline: .now() + messageTimeout, execute: timeoutWork)

        WCSession.default.sendMessage(["action": "getStats"], replyHandler: { [weak self] response in
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
    func logWorkout(type: String, duration: Int, rpe: Int = 5, completion: (() -> Void)? = nil) {
        let payload: [String: Any] = [
            "action": "logWorkout",
            "workoutType": type,
            "durationMinutes": duration,
            "rpe": rpe,
            "workoutDate": Self.isoFormatter.string(from: Date()),
        ]

        guard WCSession.default.activationState == .activated else {
            // Queue for later delivery
            WCSession.default.transferUserInfo(payload)
            DispatchQueue.main.async {
                self.lastSyncStatus = "Queued (offline)"
                self.updatePendingSyncCount()
                WKInterfaceDevice.current().play(.failure)
                completion?()
            }
            return
        }

        if WCSession.default.isReachable {
            let timeoutWork = DispatchWorkItem { [weak self] in
                guard let self = self else { return }
                // Timeout -- fall back to transferUserInfo
                WCSession.default.transferUserInfo(payload)
                DispatchQueue.main.async {
                    self.lastSyncStatus = "Queued (timeout)"
                    self.updatePendingSyncCount()
                    WKInterfaceDevice.current().play(.retry)
                    completion?()
                }
            }
            DispatchQueue.main.asyncAfter(deadline: .now() + messageTimeout, execute: timeoutWork)

            WCSession.default.sendMessage(payload, replyHandler: { [weak self] response in
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
                    self.updatePendingSyncCount()
                    WKInterfaceDevice.current().play(.success)
                    completion?()
                }
            }, errorHandler: { [weak self] error in
                timeoutWork.cancel()
                guard let self = self else { return }

                // Fall back to queued delivery
                WCSession.default.transferUserInfo(payload)
                DispatchQueue.main.async {
                    self.lastSyncStatus = "Queued"
                    self.updatePendingSyncCount()
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
                self.updatePendingSyncCount()
                WKInterfaceDevice.current().play(.retry)
                completion?()
            }
        }
    }

    // MARK: - Achievement Badges

    func checkAndUnlockBadges() {
        let totalWorkouts = UserDefaults.standard.integer(forKey: "total_workouts_logged") + 1
        UserDefaults.standard.set(totalWorkouts, forKey: "total_workouts_logged")

        // Reset badge notification
        newBadgeUnlocked = nil

        // Check streak badges (highest first so the best badge wins)
        if currentStreak >= 30 && !UserDefaults.standard.bool(forKey: "badge_streak_30") {
            UserDefaults.standard.set(true, forKey: "badge_streak_30")
            newBadgeUnlocked = "Monthly Master \u{1F3C6}"
        } else if currentStreak >= 14 && !UserDefaults.standard.bool(forKey: "badge_streak_14") {
            UserDefaults.standard.set(true, forKey: "badge_streak_14")
            newBadgeUnlocked = "Consistency King \u{1F451}"
        } else if currentStreak >= 7 && !UserDefaults.standard.bool(forKey: "badge_streak_7") {
            UserDefaults.standard.set(true, forKey: "badge_streak_7")
            newBadgeUnlocked = "Week Warrior \u{1F525}"
        }

        // Check workout count badges (highest first)
        if totalWorkouts >= 100 && !UserDefaults.standard.bool(forKey: "badge_workouts_100") {
            UserDefaults.standard.set(true, forKey: "badge_workouts_100")
            newBadgeUnlocked = "Century Club \u{1F3AF}"
        } else if totalWorkouts >= 50 && !UserDefaults.standard.bool(forKey: "badge_workouts_50") {
            UserDefaults.standard.set(true, forKey: "badge_workouts_50")
            newBadgeUnlocked = "Dedicated \u{1F48E}"
        } else if totalWorkouts >= 10 && !UserDefaults.standard.bool(forKey: "badge_workouts_10") {
            UserDefaults.standard.set(true, forKey: "badge_workouts_10")
            newBadgeUnlocked = "Getting Started \u{2B50}"
        }

        // Early bird check
        let hour = Calendar.current.component(.hour, from: Date())
        if hour < 7 && !UserDefaults.standard.bool(forKey: "badge_early_bird") {
            UserDefaults.standard.set(true, forKey: "badge_early_bird")
            newBadgeUnlocked = "Early Bird \u{1F305}"
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
        return WCSession.default.activationState != .activated || !WCSession.default.isReachable
    }

    /// Update count of workouts queued but not yet delivered to iPhone
    func updatePendingSyncCount() {
        DispatchQueue.main.async {
            if WCSession.default.activationState == .activated {
                self.pendingSyncCount = WCSession.default.outstandingUserInfoTransfers.count
            }
        }
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

    // MARK: - WKExtendedRuntimeSessionDelegate

    func extendedRuntimeSessionDidStart(_ extendedRuntimeSession: WKExtendedRuntimeSession) {
        print("[ExtendedRuntime] Session did start")
    }

    func extendedRuntimeSessionWillExpire(_ extendedRuntimeSession: WKExtendedRuntimeSession) {
        print("[ExtendedRuntime] Session will expire")
    }

    func extendedRuntimeSession(_ extendedRuntimeSession: WKExtendedRuntimeSession, didInvalidateWith reason: WKExtendedRuntimeSessionInvalidationReason, error: Error?) {
        if let error = error {
            print("[ExtendedRuntime] Invalidated with error: \(error.localizedDescription)")
        } else {
            print("[ExtendedRuntime] Invalidated with reason: \(reason.rawValue)")
        }
        DispatchQueue.main.async {
            self.extendedSession = nil
        }
    }
}
