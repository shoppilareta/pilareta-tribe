import SwiftUI
import WatchKit

// MARK: - Workout Summary Model

struct WorkoutSummary {
    let type: String
    let duration: Int
    let avgHeartRate: Double
    let calories: Int
    let coolDownSeconds: Int
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
    @State private var motivationText: String? = nil
    @State private var showBadgeCelebration = false

    // Target Duration
    @State private var targetDuration: Int = 0 // 0 means no target
    @State private var goalReached = false

    // Cool-Down Phase
    @State private var showCoolDownPrompt = false
    @State private var inCoolDown = false
    @State private var coolDownSeconds: TimeInterval = 0
    @State private var coolDownTimer: Timer? = nil
    @State private var coolDownPhase: Int = 0

    // Breathing Cues
    @State private var breathingEnabled = false
    @State private var breathingTimer: Timer? = nil
    @State private var isInhaling = true

    let workoutTypes = ["Reformer", "Mat", "Tower", "Yoga", "Running", "Strength"]

    let coolDownPrompts = [
        "Child's Pose \u{2014} breathe deeply",
        "Spinal Twist \u{2014} each side",
        "Hamstring Stretch",
        "Deep Breathing \u{2014} 4 in, 4 out",
        "You're done! Great workout.",
    ]

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
            } else if inCoolDown {
                coolDownView
            } else if !isActive {
                preWorkoutView
            } else if isLuminanceReduced {
                alwaysOnView
            } else {
                activeWorkoutView
            }

            // Cool-down prompt overlay
            if showCoolDownPrompt {
                coolDownPromptOverlay
                    .transition(.opacity)
                    .zIndex(99)
            }

            // Celebration overlay
            if showCelebration {
                celebrationOverlay
                    .transition(.scale.combined(with: .opacity))
                    .zIndex(100)
            }

            // Badge celebration overlay
            if showBadgeCelebration, let badge = workoutManager.newBadgeUnlocked {
                badgeCelebrationOverlay(badge: badge)
                    .transition(.scale.combined(with: .opacity))
                    .zIndex(101)
            }

            // In-workout motivation overlay
            if isActive, let motivation = motivationText {
                VStack {
                    Spacer()
                    Text(motivation)
                        .font(.system(size: 12, weight: .semibold))
                        .foregroundColor(Color(hex: "f6eddd"))
                        .padding(.horizontal, 12)
                        .padding(.vertical, 6)
                        .background(Color(hex: "f6eddd").opacity(0.15))
                        .cornerRadius(8)
                        .padding(.bottom, 60)
                }
                .transition(.opacity)
                .zIndex(50)
            }
        }
        .animation(.spring(response: 0.5, dampingFraction: 0.7), value: showCelebration)
        .animation(.spring(response: 0.5, dampingFraction: 0.7), value: showBadgeCelebration)
        .animation(.easeInOut(duration: 0.3), value: motivationText != nil)
        .animation(.easeInOut(duration: 0.3), value: showCoolDownPrompt)
        .animation(.easeInOut(duration: 0.3), value: inCoolDown)
        .onDisappear {
            timer?.invalidate()
            timer = nil
            breathingTimer?.invalidate()
            breathingTimer = nil
            coolDownTimer?.invalidate()
            coolDownTimer = nil
        }
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

    // MARK: - Badge Celebration Overlay

    private func badgeCelebrationOverlay(badge: String) -> some View {
        VStack(spacing: 8) {
            Spacer()

            Text("\u{1F38A}")
                .font(.system(size: 40))

            Text("Badge Unlocked!")
                .font(.headline)
                .foregroundColor(.yellow)

            Text(badge)
                .font(.caption)
                .foregroundColor(Color(hex: "f6eddd"))

            Spacer()
        }
        .frame(maxWidth: .infinity, maxHeight: .infinity)
        .background(Color(hex: "202219").opacity(0.95))
        .onAppear {
            WKInterfaceDevice.current().play(.success)
            WKInterfaceDevice.current().play(.notification)
        }
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

                // Target duration picker
                VStack(spacing: 8) {
                    Text("GOAL")
                        .font(.system(size: 10, weight: .semibold))
                        .foregroundColor(Color(hex: "f6eddd").opacity(0.4))

                    HStack(spacing: 12) {
                        ForEach([0, 15, 30, 45, 60], id: \.self) { mins in
                            Button(action: {
                                WKInterfaceDevice.current().play(.click)
                                targetDuration = mins
                            }) {
                                Text(mins == 0 ? "\u{221E}" : "\(mins)")
                                    .font(.system(size: 14, weight: targetDuration == mins ? .bold : .regular))
                                    .foregroundColor(targetDuration == mins ? Color(hex: "202219") : Color(hex: "f6eddd"))
                                    .frame(width: 32, height: 28)
                                    .background(targetDuration == mins ? Color(hex: "f6eddd") : Color(hex: "f6eddd").opacity(0.1))
                                    .cornerRadius(6)
                            }
                            .buttonStyle(.plain)
                        }
                    }

                    if targetDuration > 0 {
                        Text("\(targetDuration) min goal")
                            .font(.system(size: 10))
                            .foregroundColor(Color(hex: "f6eddd").opacity(0.5))
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

                // Breathing cues toggle
                Toggle(isOn: $breathingEnabled) {
                    Label("Breathing Cues", systemImage: "wind")
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

            // Timer display with optional progress ring
            ZStack {
                // Target duration progress ring
                if targetDuration > 0 {
                    let targetSeconds = Double(targetDuration * 60)
                    let progress = min(elapsedSeconds / targetSeconds, 1.0)

                    Circle()
                        .stroke(Color(hex: "f6eddd").opacity(0.1), lineWidth: 3)
                        .frame(width: 110, height: 110)

                    Circle()
                        .trim(from: 0, to: progress)
                        .stroke(
                            goalReached
                                ? LinearGradient(colors: [.green, .green.opacity(0.7)], startPoint: .topLeading, endPoint: .bottomTrailing)
                                : LinearGradient(colors: [Color(hex: "f6eddd"), Color(hex: "f6eddd").opacity(0.7)], startPoint: .topLeading, endPoint: .bottomTrailing),
                            style: StrokeStyle(lineWidth: 3, lineCap: .round)
                        )
                        .frame(width: 110, height: 110)
                        .rotationEffect(.degrees(-90))
                        .animation(.easeInOut(duration: 0.5), value: progress)
                }

                VStack(spacing: 2) {
                    // Timer MM:SS
                    Text(formatTime(elapsedSeconds))
                        .font(.system(size: targetDuration > 0 ? 36 : 44, weight: .bold, design: .monospaced))
                        .foregroundColor(goalReached ? .green : Color(hex: "f6eddd"))
                        .minimumScaleFactor(0.7)

                    // Target progress text
                    if targetDuration > 0 {
                        let elapsedMins = Int(elapsedSeconds) / 60
                        Text("\(elapsedMins)/\(targetDuration) min")
                            .font(.system(size: 10, weight: .medium))
                            .foregroundColor(goalReached ? .green.opacity(0.8) : Color(hex: "f6eddd").opacity(0.5))
                    }
                }
            }

            // Goal reached banner
            if goalReached {
                Text("Goal reached!")
                    .font(.system(size: 10, weight: .bold))
                    .foregroundColor(.green)
                    .padding(.horizontal, 8)
                    .padding(.vertical, 2)
                    .background(Color.green.opacity(0.15))
                    .cornerRadius(4)
                    .transition(.scale.combined(with: .opacity))
            }

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
            } else {
                Text("-- BPM")
                    .font(.caption)
                    .foregroundColor(Color(hex: "f6eddd").opacity(0.3))
            }

            // Breathing cue indicator
            if breathingEnabled {
                Text(isInhaling ? "Inhale..." : "Exhale...")
                    .font(.system(size: 10))
                    .foregroundColor(Color(hex: "f6eddd").opacity(0.3))
                    .animation(.easeInOut(duration: 2), value: isInhaling)
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

                // End workout (triggers cool-down prompt)
                Button(action: handleStopTap) {
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

    // MARK: - Cool-Down Prompt Overlay

    private var coolDownPromptOverlay: some View {
        VStack(spacing: 12) {
            Spacer()

            Text("Cool Down?")
                .font(.headline)
                .foregroundColor(Color(hex: "f6eddd"))

            Text("5 minutes of gentle stretching")
                .font(.caption)
                .foregroundColor(Color(hex: "f6eddd").opacity(0.6))
                .multilineTextAlignment(.center)

            HStack(spacing: 12) {
                Button("Skip") {
                    showCoolDownPrompt = false
                    finalizeWorkout()
                }
                .font(.system(size: 14, weight: .medium))
                .foregroundColor(Color(hex: "f6eddd").opacity(0.6))

                Button("Start") {
                    showCoolDownPrompt = false
                    startCoolDown()
                }
                .font(.system(size: 14, weight: .semibold))
                .foregroundColor(.green)
            }

            Spacer()
        }
        .frame(maxWidth: .infinity, maxHeight: .infinity)
        .background(Color(hex: "202219").opacity(0.95))
    }

    // MARK: - Cool-Down View

    private var coolDownView: some View {
        VStack(spacing: 8) {
            Spacer()

            Text("COOL DOWN")
                .font(.system(size: 11, weight: .semibold, design: .rounded))
                .foregroundColor(.cyan.opacity(0.7))

            // Cool-down countdown timer
            let remaining = max(0, 300 - coolDownSeconds)
            Text(formatTime(remaining))
                .font(.system(size: 40, weight: .bold, design: .monospaced))
                .foregroundColor(.cyan)
                .minimumScaleFactor(0.7)

            // Progress bar
            GeometryReader { geo in
                ZStack(alignment: .leading) {
                    Rectangle()
                        .fill(Color.cyan.opacity(0.15))
                        .frame(height: 4)
                        .cornerRadius(2)
                    Rectangle()
                        .fill(Color.cyan)
                        .frame(width: geo.size.width * CGFloat(min(coolDownSeconds / 300.0, 1.0)), height: 4)
                        .cornerRadius(2)
                        .animation(.easeInOut(duration: 0.5), value: coolDownSeconds)
                }
            }
            .frame(height: 4)
            .padding(.horizontal, 16)

            // Current stretch prompt
            Text(coolDownPrompts[min(coolDownPhase, coolDownPrompts.count - 1)])
                .font(.system(size: 12, weight: .medium))
                .foregroundColor(Color(hex: "f6eddd").opacity(0.8))
                .multilineTextAlignment(.center)
                .padding(.horizontal, 8)
                .id("cooldown-phase-\(coolDownPhase)")
                .animation(.easeInOut(duration: 0.5), value: coolDownPhase)

            Spacer()

            // End cool-down button
            Button(action: endCoolDown) {
                HStack(spacing: 6) {
                    Image(systemName: "stop.fill")
                        .font(.caption)
                    Text("End")
                        .font(.system(size: 14, weight: .semibold))
                }
                .frame(width: 80, height: 40)
                .background(Color.cyan.opacity(0.25))
                .foregroundColor(.cyan)
                .cornerRadius(20)
            }
            .buttonStyle(.plain)
            .padding(.bottom, 8)
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

                // Cool-down time if applicable
                if summary.coolDownSeconds > 0 {
                    HStack(spacing: 4) {
                        Image(systemName: "figure.cooldown")
                            .font(.caption)
                            .foregroundColor(.cyan)
                        Text("\(summary.coolDownSeconds / 60) min cool-down")
                            .font(.system(size: 12))
                            .foregroundColor(.cyan.opacity(0.8))
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
        if hr < 100 { return "Zone 1 \u{2014} Easy" }
        if hr < 120 { return "Zone 2 \u{2014} Fat Burn" }
        if hr < 140 { return "Zone 3 \u{2014} Cardio" }
        if hr < 160 { return "Zone 4 \u{2014} Hard" }
        return "Zone 5 \u{2014} Max"
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
        goalReached = false
        coolDownSeconds = 0
        coolDownPhase = 0
        inCoolDown = false
        showCoolDownPrompt = false

        // Start HealthKit workout session
        workoutManager.startHealthKitWorkout(type: apiType(for: workoutType))

        // Start extended runtime session to keep screen active
        workoutManager.startExtendedSession()

        // Enable water lock if selected
        if waterLockEnabled {
            WKInterfaceDevice.current().enableWaterLock()
        }

        startTimer()
        startBreathingCues()
        WKInterfaceDevice.current().play(.start)
    }

    func togglePause() {
        isPaused.toggle()
        WKInterfaceDevice.current().play(.click)
        if isPaused {
            timer?.invalidate()
            timer = nil
            breathingTimer?.invalidate()
            breathingTimer = nil
            WKInterfaceDevice.current().play(.stop)
        } else {
            startTimer()
            startBreathingCues()
            WKInterfaceDevice.current().play(.start)
        }
    }

    func handleStopTap() {
        if inCoolDown {
            endCoolDown()
        } else {
            // Pause the workout timer while showing prompt
            if !isPaused {
                timer?.invalidate()
                timer = nil
                breathingTimer?.invalidate()
                breathingTimer = nil
            }
            showCoolDownPrompt = true
        }
    }

    func startCoolDown() {
        // Stop the main workout timer
        timer?.invalidate()
        timer = nil
        breathingTimer?.invalidate()
        breathingTimer = nil

        inCoolDown = true
        coolDownSeconds = 0
        coolDownPhase = 0

        // Keep isActive true so elapsed time is preserved for summary
        isActive = false
        isPaused = false

        WKInterfaceDevice.current().play(.start)

        coolDownTimer = Timer.scheduledTimer(withTimeInterval: 1, repeats: true) { _ in
            DispatchQueue.main.async {
                self.coolDownSeconds += 1

                // Update phase every 60 seconds
                let newPhase = min(Int(self.coolDownSeconds) / 60, self.coolDownPrompts.count - 1)
                if newPhase != self.coolDownPhase {
                    self.coolDownPhase = newPhase
                    WKInterfaceDevice.current().play(.notification)
                }

                // Auto-end after 5 minutes
                if self.coolDownSeconds >= 300 {
                    self.endCoolDown()
                }
            }
        }
    }

    func endCoolDown() {
        coolDownTimer?.invalidate()
        coolDownTimer = nil
        inCoolDown = false

        let finalCoolDownSeconds = Int(coolDownSeconds)
        finalizeWorkout(coolDownTime: finalCoolDownSeconds)
    }

    /// Called when the user ends the workout (with or without cool-down).
    func finalizeWorkout(coolDownTime: Int = 0) {
        timer?.invalidate()
        timer = nil
        breathingTimer?.invalidate()
        breathingTimer = nil

        let durationMinutes = max(1, Int(round(elapsedSeconds / 60)))

        // Store celebration data before reset
        celebrationDuration = durationMinutes
        celebrationType = workoutType

        // Show celebration overlay
        showCelebration = true
        WKInterfaceDevice.current().play(.success)

        // End HealthKit workout and get summary data
        let capturedType = workoutType
        let capturedCoolDown = coolDownTime
        workoutManager.endHealthKitWorkout { avgHR, calories in
            self.workoutSummary = WorkoutSummary(
                type: capturedType,
                duration: durationMinutes,
                avgHeartRate: avgHR,
                calories: Int(calories),
                coolDownSeconds: capturedCoolDown
            )
        }

        // End extended runtime session
        workoutManager.endExtendedSession()

        // Send workout to phone
        workoutManager.logWorkout(type: apiType(for: workoutType), duration: durationMinutes)

        // Check and unlock achievement badges
        workoutManager.checkAndUnlockBadges()

        // Update pending sync count
        workoutManager.updatePendingSyncCount()

        // Reset active state
        isActive = false
        isPaused = false
        elapsedSeconds = 0
        motivationText = nil
        goalReached = false

        // Dismiss celebration after 3 seconds, then check for badge unlock
        DispatchQueue.main.asyncAfter(deadline: .now() + 3) {
            showCelebration = false

            if workoutManager.newBadgeUnlocked != nil {
                // Show badge celebration before summary
                showBadgeCelebration = true
                DispatchQueue.main.asyncAfter(deadline: .now() + 3) {
                    showBadgeCelebration = false
                    workoutManager.newBadgeUnlocked = nil
                    showSummary = true
                }
            } else {
                showSummary = true
            }
        }
    }

    func startTimer() {
        timer = Timer.scheduledTimer(withTimeInterval: 1, repeats: true) { _ in
            elapsedSeconds += 1
            checkMilestones()
            checkTargetGoal()
        }
    }

    // MARK: - Breathing Cues

    func startBreathingCues() {
        guard breathingEnabled else { return }

        isInhaling = true
        breathingTimer?.invalidate()

        // 8-second cycle: 4s inhale, 4s exhale
        breathingTimer = Timer.scheduledTimer(withTimeInterval: 4.0, repeats: true) { _ in
            DispatchQueue.main.async {
                self.isInhaling.toggle()
                if self.isInhaling {
                    WKInterfaceDevice.current().play(.directionUp) // inhale
                } else {
                    WKInterfaceDevice.current().play(.directionDown) // exhale
                }
            }
        }
    }

    // MARK: - Target Goal Check

    func checkTargetGoal() {
        guard targetDuration > 0, !goalReached else { return }

        let targetSeconds = Double(targetDuration * 60)
        if elapsedSeconds >= targetSeconds {
            goalReached = true
            WKInterfaceDevice.current().play(.success)

            // Secondary haptic for emphasis
            DispatchQueue.main.asyncAfter(deadline: .now() + 0.5) {
                WKInterfaceDevice.current().play(.notification)
            }
        }
    }

    // MARK: - Milestone Haptics & Motivation

    func checkMilestones() {
        let totalSeconds = Int(elapsedSeconds)
        let minutes = totalSeconds / 60
        let seconds = totalSeconds % 60

        if seconds == 0 && minutes > 0 {
            // Show motivation at specific times
            switch minutes {
            case 5: showMotivation("Warmed up! Let's go \u{1F4AA}")
            case 10: showMotivation("You're in the zone! \u{1F525}")
            case 15: showMotivation("Quarter hour done! Keep pushing")
            case 20: showMotivation("20 minutes strong! \u{1F48E}")
            case 30: showMotivation("Halfway hero! \u{1F3C6}")
            case 45: showMotivation("Beast mode! 45 minutes! \u{1F981}")
            case 60: showMotivation("ONE HOUR! Legendary! \u{2B50}")
            default: break
            }

            // Haptic every 5 minutes
            if minutes % 5 == 0 {
                WKInterfaceDevice.current().play(.notification)
            }
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

    func showMotivation(_ text: String) {
        motivationText = text
        DispatchQueue.main.asyncAfter(deadline: .now() + 3) {
            if motivationText == text { motivationText = nil }
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
