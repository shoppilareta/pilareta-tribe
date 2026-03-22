import SwiftUI
import WatchKit

// MARK: - Workout Summary Model

struct WorkoutSummary {
    let type: String
    let duration: Int
    let avgHeartRate: Double
    let calories: Int
}

// MARK: - Stat Badge Component

struct StatBadge: View {
    let value: String
    let unit: String
    let icon: String

    var body: some View {
        VStack(spacing: 4) {
            Image(systemName: icon)
                .font(.caption)
                .foregroundColor(Color(hex: "f6eddd").opacity(0.6))
            Text(value)
                .font(.system(size: 20, weight: .bold, design: .rounded))
                .foregroundColor(Color(hex: "f6eddd"))
            Text(unit)
                .font(.system(size: 9))
                .foregroundColor(Color(hex: "f6eddd").opacity(0.5))
        }
        .frame(maxWidth: .infinity)
        .padding(.vertical, 8)
        .background(Color(hex: "f6eddd").opacity(0.08))
        .cornerRadius(10)
    }
}

// MARK: - WorkoutTimerView

struct WorkoutTimerView: View {
    @ObservedObject var workoutManager: WorkoutManager
    @Environment(\.isLuminanceReduced) var isLuminanceReduced

    @State private var isActive = false
    @State private var isPaused = false
    @State private var elapsedSeconds: TimeInterval = 0
    @State private var timer: Timer? = nil
    @State private var workoutType: String = "Reformer"
    @State private var showSummary = false
    @State private var workoutSummary: WorkoutSummary? = nil
    @State private var waterLockEnabled = false
    @State private var previousHRZone: Int = 0
    @State private var showCelebration = false
    @State private var celebrationDuration: Int = 0
    @State private var celebrationType: String = ""
    @State private var selectedTypeIndex: Double = 0

    let workoutTypes = ["Reformer", "Mat", "Tower", "Yoga", "Running", "Strength"]

    // Map display names to API values
    private func apiType(for displayType: String) -> String {
        switch displayType {
        case "Reformer": return "reformer"
        case "Mat": return "mat"
        case "Tower": return "tower"
        case "Yoga": return "yoga"
        case "Running": return "running"
        case "Strength": return "strength_training"
        default: return displayType.lowercased()
        }
    }

    var body: some View {
        ZStack {
            if showSummary, let summary = workoutSummary {
                summaryView(summary: summary)
            } else if !isActive {
                preWorkoutView
            } else if isLuminanceReduced {
                alwaysOnView
            } else {
                activeWorkoutView
            }

            // Celebration overlay
            if showCelebration {
                celebrationOverlay
                    .transition(.scale.combined(with: .opacity))
                    .zIndex(100)
            }
        }
        .animation(.spring(response: 0.5, dampingFraction: 0.7), value: showCelebration)
    }

    // MARK: - Celebration Overlay

    private var celebrationOverlay: some View {
        VStack(spacing: 8) {
            Spacer()

            Text("\u{1F389}")
                .font(.system(size: 48))

            Text("Great Work!")
                .font(.system(size: 18, weight: .bold))
                .foregroundColor(Color(hex: "f6eddd"))

            Text("\(celebrationDuration) min of \(celebrationType)")
                .font(.system(size: 13))
                .foregroundColor(Color(hex: "f6eddd").opacity(0.7))

            if workoutManager.currentStreak > 0 {
                HStack(spacing: 4) {
                    Text("\u{1F525}")
                        .font(.system(size: 12))
                    Text("\(workoutManager.currentStreak) day streak")
                        .font(.system(size: 11, weight: .semibold))
                        .foregroundColor(.orange)
                }
                .padding(.top, 4)
            }

            Spacer()
        }
        .frame(maxWidth: .infinity, maxHeight: .infinity)
        .background(Color(hex: "202219").opacity(0.95))
    }

    // MARK: - Pre-Workout View

    private var preWorkoutView: some View {
        ScrollView {
            VStack(spacing: 12) {
                Text("Start Workout")
                    .font(.headline)
                    .foregroundColor(Color(hex: "f6eddd"))

                // Workout type grid
                LazyVGrid(columns: [
                    GridItem(.flexible()),
                    GridItem(.flexible()),
                ], spacing: 8) {
                    ForEach(workoutTypes, id: \.self) { type in
                        Button(action: {
                            WKInterfaceDevice.current().play(.click)
                            workoutType = type
                        }) {
                            VStack(spacing: 4) {
                                Image(systemName: iconForType(type))
                                    .font(.system(size: 18))
                                Text(type)
                                    .font(.system(size: 11, weight: .medium))
                            }
                            .frame(maxWidth: .infinity)
                            .padding(.vertical, 8)
                            .background(
                                workoutType == type
                                    ? Color(hex: "f6eddd")
                                    : Color(hex: "f6eddd").opacity(0.1)
                            )
                            .foregroundColor(
                                workoutType == type
                                    ? Color(hex: "202219")
                                    : Color(hex: "f6eddd")
                            )
                            .cornerRadius(10)
                        }
                        .buttonStyle(.plain)
                    }
                }

                // Water Lock toggle
                Toggle(isOn: $waterLockEnabled) {
                    Label("Water Lock", systemImage: "drop.fill")
                        .font(.caption)
                        .foregroundColor(Color(hex: "f6eddd").opacity(0.7))
                }
                .toggleStyle(.switch)
                .tint(Color(hex: "f6eddd").opacity(0.5))

                Button(action: startWorkout) {
                    HStack {
                        Image(systemName: "play.fill")
                        Text("Start")
                    }
                    .font(.headline)
                    .frame(maxWidth: .infinity)
                    .padding(.vertical, 10)
                    .background(Color(hex: "f6eddd"))
                    .foregroundColor(Color(hex: "202219"))
                    .cornerRadius(12)
                }
                .padding(.top, 4)
            }
            .padding(.horizontal, 4)
        }
        .focusable()
        .digitalCrownRotation(
            $selectedTypeIndex,
            from: 0,
            through: Double(workoutTypes.count - 1),
            by: 1,
            sensitivity: .medium,
            isContinuous: false
        )
        .onChange(of: selectedTypeIndex) { _, newValue in
            let index = Int(round(newValue))
            let clampedIndex = max(0, min(index, workoutTypes.count - 1))
            let newType = workoutTypes[clampedIndex]
            if newType != workoutType {
                workoutType = newType
                WKInterfaceDevice.current().play(.click)
            }
        }
        .onAppear {
            workoutManager.requestHealthKitPermission()
            // Sync crown position with selected type
            if let index = workoutTypes.firstIndex(of: workoutType) {
                selectedTypeIndex = Double(index)
            }
        }
    }

    // MARK: - Always-On Display View (Simplified)

    private var alwaysOnView: some View {
        VStack(spacing: 8) {
            Spacer()
            Text(formatTime(elapsedSeconds))
                .font(.system(size: 36, weight: .bold, design: .monospaced))
                .foregroundColor(Color(hex: "f6eddd").opacity(0.6))
            if workoutManager.currentHeartRate > 0 {
                HStack(spacing: 4) {
                    Image(systemName: "heart.fill")
                        .font(.caption2)
                        .foregroundColor(.red.opacity(0.6))
                    Text("\(Int(workoutManager.currentHeartRate))")
                        .font(.system(size: 16, weight: .semibold, design: .rounded))
                        .foregroundColor(.red.opacity(0.6))
                }
            }
            if isPaused {
                Text("PAUSED")
                    .font(.system(size: 10, weight: .bold))
                    .foregroundColor(.yellow.opacity(0.5))
            }
            Spacer()
        }
    }

    // MARK: - Active Workout View

    private var activeWorkoutView: some View {
        VStack(spacing: 4) {
            Spacer()

            // Workout type label
            HStack(spacing: 4) {
                Image(systemName: iconForType(workoutType))
                    .font(.caption2)
                Text(workoutType.uppercased())
                    .font(.system(size: 11, weight: .semibold, design: .rounded))
            }
            .foregroundColor(Color(hex: "f6eddd").opacity(0.6))

            // Timer display MM:SS
            Text(formatTime(elapsedSeconds))
                .font(.system(size: 44, weight: .bold, design: .monospaced))
                .foregroundColor(Color(hex: "f6eddd"))
                .minimumScaleFactor(0.7)

            // Heart rate display
            if workoutManager.currentHeartRate > 0 {
                VStack(spacing: 2) {
                    HStack(spacing: 4) {
                        Image(systemName: "heart.fill")
                            .foregroundColor(.red)
                            .font(.caption)
                        Text("\(Int(workoutManager.currentHeartRate))")
                            .font(.system(size: 20, weight: .bold, design: .rounded))
                            .foregroundColor(.red)
                        Text("BPM")
                            .font(.caption2)
                            .foregroundColor(Color(hex: "f6eddd").opacity(0.5))
                    }
                    // HR Zone indicator
                    Text(hrZone)
                        .font(.system(size: 9, weight: .semibold))
                        .foregroundColor(hrZoneColor)
                        .padding(.horizontal, 6)
                        .padding(.vertical, 2)
                        .background(hrZoneColor.opacity(0.15))
                        .cornerRadius(4)
                }
            }

            // Pause indicator
            if isPaused {
                Text("PAUSED")
                    .font(.system(size: 10, weight: .bold))
                    .foregroundColor(.yellow)
                    .padding(.horizontal, 8)
                    .padding(.vertical, 2)
                    .background(Color.yellow.opacity(0.15))
                    .cornerRadius(4)
            }

            Spacer()

            // Control buttons
            HStack(spacing: 16) {
                // Pause / Resume
                Button(action: togglePause) {
                    Image(systemName: isPaused ? "play.fill" : "pause.fill")
                        .font(.title3)
                        .frame(width: 48, height: 48)
                        .background(Color(hex: "f6eddd").opacity(0.2))
                        .foregroundColor(Color(hex: "f6eddd"))
                        .clipShape(Circle())
                }
                .buttonStyle(.plain)

                // End workout
                Button(action: endWorkout) {
                    Image(systemName: "stop.fill")
                        .font(.title3)
                        .frame(width: 48, height: 48)
                        .background(Color.red.opacity(0.3))
                        .foregroundColor(.red)
                        .clipShape(Circle())
                }
                .buttonStyle(.plain)
            }
            .padding(.bottom, 4)
        }
    }

    // MARK: - Post-Workout Summary View

    private func summaryView(summary: WorkoutSummary) -> some View {
        ScrollView {
            VStack(spacing: 12) {
                Image(systemName: "checkmark.circle.fill")
                    .font(.system(size: 40))
                    .foregroundColor(.green)

                Text("Workout Complete!")
                    .font(.headline)
                    .foregroundColor(Color(hex: "f6eddd"))

                // Stats grid
                HStack(spacing: 8) {
                    StatBadge(
                        value: "\(summary.duration)",
                        unit: "MIN",
                        icon: "clock"
                    )
                    if summary.avgHeartRate > 0 {
                        StatBadge(
                            value: "\(Int(summary.avgHeartRate))",
                            unit: "AVG HR",
                            icon: "heart.fill"
                        )
                    }
                }

                if summary.calories > 0 {
                    HStack(spacing: 4) {
                        Image(systemName: "flame.fill")
                            .font(.caption)
                            .foregroundColor(.orange)
                        Text("\(summary.calories) cal")
                            .font(.system(size: 14, weight: .semibold))
                            .foregroundColor(Color(hex: "f6eddd"))
                    }
                }

                HStack(spacing: 4) {
                    Image(systemName: iconForType(summary.type))
                        .font(.caption2)
                    Text(summary.type)
                        .font(.caption)
                }
                .foregroundColor(Color(hex: "f6eddd").opacity(0.6))

                Button(action: {
                    showSummary = false
                    workoutSummary = nil
                }) {
                    Text("Done")
                        .font(.system(size: 15, weight: .semibold))
                        .frame(maxWidth: .infinity)
                        .padding(.vertical, 10)
                        .background(Color(hex: "f6eddd"))
                        .foregroundColor(Color(hex: "202219"))
                        .cornerRadius(12)
                }
                .buttonStyle(.plain)
                .padding(.top, 4)
            }
            .padding(.horizontal, 4)
        }
    }

    // MARK: - Heart Rate Zone Helpers

    var hrZone: String {
        let hr = workoutManager.currentHeartRate
        if hr < 100 { return "Zone 1 — Easy" }
        if hr < 120 { return "Zone 2 — Fat Burn" }
        if hr < 140 { return "Zone 3 — Cardio" }
        if hr < 160 { return "Zone 4 — Hard" }
        return "Zone 5 — Max"
    }

    var hrZoneColor: Color {
        let hr = workoutManager.currentHeartRate
        if hr < 100 { return .green }
        if hr < 120 { return .blue }
        if hr < 140 { return .yellow }
        if hr < 160 { return .orange }
        return .red
    }

    private func currentHRZoneIndex() -> Int {
        let hr = workoutManager.currentHeartRate
        if hr < 100 { return 1 }
        if hr < 120 { return 2 }
        if hr < 140 { return 3 }
        if hr < 160 { return 4 }
        return 5
    }

    // MARK: - Timer Controls

    func startWorkout() {
        isActive = true
        isPaused = false
        elapsedSeconds = 0
        previousHRZone = 0
        showSummary = false
        workoutSummary = nil

        // Start HealthKit workout session
        workoutManager.startHealthKitWorkout(type: apiType(for: workoutType))

        // Start extended runtime session to keep screen active
        workoutManager.startExtendedSession()

        // Enable water lock if selected
        if waterLockEnabled {
            WKInterfaceDevice.current().enableWaterLock()
        }

        startTimer()
        WKInterfaceDevice.current().play(.start)
    }

    func togglePause() {
        isPaused.toggle()
        WKInterfaceDevice.current().play(.click)
        if isPaused {
            timer?.invalidate()
            timer = nil
            WKInterfaceDevice.current().play(.stop)
        } else {
            startTimer()
            WKInterfaceDevice.current().play(.start)
        }
    }

    func endWorkout() {
        timer?.invalidate()
        timer = nil

        let durationMinutes = max(1, Int(round(elapsedSeconds / 60)))

        // Store celebration data before reset
        celebrationDuration = durationMinutes
        celebrationType = workoutType

        // Show celebration overlay
        showCelebration = true
        WKInterfaceDevice.current().play(.success)

        // End HealthKit workout and get summary data
        workoutManager.endHealthKitWorkout { avgHR, calories in
            self.workoutSummary = WorkoutSummary(
                type: self.workoutType,
                duration: durationMinutes,
                avgHeartRate: avgHR,
                calories: Int(calories)
            )
        }

        // End extended runtime session
        workoutManager.endExtendedSession()

        // Send workout to phone
        workoutManager.logWorkout(type: apiType(for: workoutType), duration: durationMinutes)

        // Update pending sync count
        workoutManager.updatePendingSyncCount()

        // Reset active state
        isActive = false
        isPaused = false
        elapsedSeconds = 0

        // Dismiss celebration after 3 seconds, then show summary
        DispatchQueue.main.asyncAfter(deadline: .now() + 3) {
            showCelebration = false
            showSummary = true
        }
    }

    func startTimer() {
        timer = Timer.scheduledTimer(withTimeInterval: 1, repeats: true) { _ in
            elapsedSeconds += 1
            checkMilestones()
        }
    }

    // MARK: - Milestone Haptics

    func checkMilestones() {
        let totalSeconds = Int(elapsedSeconds)
        let minutes = totalSeconds / 60
        let seconds = totalSeconds % 60

        // Every 5 minutes: achievement haptic
        if seconds == 0 && minutes > 0 && minutes % 5 == 0 {
            WKInterfaceDevice.current().play(.notification)
        }

        // Subtle haptic every minute (for first 3 minutes, as a "warm-up" cue)
        if totalSeconds <= 180 && seconds == 0 && minutes > 0 {
            WKInterfaceDevice.current().play(.directionUp)
        }

        // HR zone change detection: warn when entering Zone 4+
        let currentZone = currentHRZoneIndex()
        if currentZone != previousHRZone {
            if currentZone >= 4 && previousHRZone < 4 {
                WKInterfaceDevice.current().play(.retry)
            }
            previousHRZone = currentZone
        }
    }

    // MARK: - Helpers

    func formatTime(_ seconds: TimeInterval) -> String {
        let totalSeconds = Int(seconds)
        let mins = totalSeconds / 60
        let secs = totalSeconds % 60
        return String(format: "%02d:%02d", mins, secs)
    }

    func iconForType(_ type: String) -> String {
        switch type {
        case "Reformer": return "figure.pilates"
        case "Mat": return "figure.mind.and.body"
        case "Tower": return "figure.strengthtraining.functional"
        case "Yoga": return "figure.yoga"
        case "Running": return "figure.run"
        case "Strength": return "figure.strengthtraining.traditional"
        default: return "figure.mixed.cardio"
        }
    }
}
