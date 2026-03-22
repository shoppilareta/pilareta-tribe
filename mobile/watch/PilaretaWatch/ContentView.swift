import SwiftUI
import WatchKit

struct ContentView: View {
    @EnvironmentObject var workoutManager: WorkoutManager
    @State private var selectedTab = 0

    var body: some View {
        TabView(selection: $selectedTab) {
            // Tab 1: Dashboard
            DashboardView(workoutManager: workoutManager)
                .tag(0)

            // Tab 2: Workout Timer (with pending sync badge)
            ZStack(alignment: .topTrailing) {
                WorkoutTimerView(workoutManager: workoutManager)

                // Pending sync badge
                if workoutManager.pendingSyncCount > 0 {
                    HStack(spacing: 3) {
                        Circle()
                            .fill(Color.red)
                            .frame(width: 7, height: 7)
                        Text("\(workoutManager.pendingSyncCount)")
                            .font(.system(size: 9, weight: .bold))
                            .foregroundColor(.red)
                    }
                    .padding(.top, 4)
                    .padding(.trailing, 8)
                    .transition(.scale.combined(with: .opacity))
                    .animation(.easeInOut(duration: 0.3), value: workoutManager.pendingSyncCount)
                }
            }
            .tag(1)

            // Tab 3: Quick Log
            NavigationStack {
                QuickLogView(workoutManager: workoutManager)
            }
            .tag(2)
        }
        .tabViewStyle(.verticalPage)
        .onAppear {
            workoutManager.fetchStats()
            workoutManager.updatePendingSyncCount()
        }
        .onContinueUserActivity("com.pilareta.tribe.workout") { _ in
            // Navigate to timer tab when complication is tapped
            selectedTab = 1
        }
    }
}

// MARK: - Dashboard View

struct DashboardView: View {
    @ObservedObject var workoutManager: WorkoutManager
    @State private var isRefreshing = false
    @State private var showStreakDetail = false
    @State private var showAchievements = false

    // Animation state for rings
    @State private var ringAnimationProgress: CGFloat = 0

    // MARK: - Morning Briefing

    var greeting: String {
        let hour = Calendar.current.component(.hour, from: Date())
        if hour < 12 { return "Good morning" }
        if hour < 17 { return "Good afternoon" }
        return "Good evening"
    }

    var motivationalMessage: String {
        let streak = workoutManager.currentStreak
        let calories = workoutManager.todayCalories

        if calories > 0 {
            return "You've burned \(calories) cal today. Keep going! \u{1F4AA}"
        } else if streak > 0 {
            return "\u{1F525} \(streak)-day streak! Don't let it end today."
        } else {
            return "Today's a great day for Pilates. Let's go! \u{2728}"
        }
    }

    var unlockedCount: Int {
        let streak = workoutManager.currentStreak
        let totalWorkouts = UserDefaults.standard.integer(forKey: "total_workouts_logged")
        var count = 0
        if totalWorkouts >= 1 { count += 1 }
        if streak >= 7 || UserDefaults.standard.bool(forKey: "badge_streak_7") { count += 1 }
        if streak >= 14 || UserDefaults.standard.bool(forKey: "badge_streak_14") { count += 1 }
        if streak >= 30 || UserDefaults.standard.bool(forKey: "badge_streak_30") { count += 1 }
        if totalWorkouts >= 10 { count += 1 }
        if totalWorkouts >= 50 { count += 1 }
        if totalWorkouts >= 100 { count += 1 }
        if UserDefaults.standard.bool(forKey: "badge_early_bird") { count += 1 }
        return count
    }

    var body: some View {
        ScrollView {
            VStack(spacing: 12) {
                // Morning briefing
                VStack(spacing: 6) {
                    Text(greeting)
                        .font(.caption)
                        .foregroundColor(Color(hex: "f6eddd").opacity(0.6))

                    Text(motivationalMessage)
                        .font(.system(size: 13, weight: .medium))
                        .foregroundColor(Color(hex: "f6eddd"))
                        .multilineTextAlignment(.center)
                        .padding(.horizontal, 8)
                }

                // Offline indicator
                if workoutManager.isOffline {
                    HStack(spacing: 4) {
                        Image(systemName: "iphone.slash")
                            .font(.system(size: 9))
                        Text("Offline")
                            .font(.system(size: 9, weight: .semibold))
                    }
                    .foregroundColor(.orange)
                    .padding(.horizontal, 8)
                    .padding(.vertical, 3)
                    .background(Color.orange.opacity(0.12))
                    .cornerRadius(6)
                }

                // Three activity rings (Apple Fitness style)
                ZStack {
                    // Background track rings
                    Circle()
                        .stroke(Color.green.opacity(0.15), lineWidth: 6)
                        .frame(width: 90, height: 90)
                    Circle()
                        .stroke(Color.orange.opacity(0.15), lineWidth: 6)
                        .frame(width: 74, height: 74)
                    Circle()
                        .stroke(Color.red.opacity(0.15), lineWidth: 6)
                        .frame(width: 58, height: 58)

                    // Outer ring: Weekly workouts (X/7)
                    Circle()
                        .trim(from: 0, to: CGFloat(min(workoutManager.weeklyWorkouts, 7)) / 7.0 * ringAnimationProgress)
                        .stroke(
                            LinearGradient(
                                colors: [Color.green, Color.green.opacity(0.7)],
                                startPoint: .topLeading,
                                endPoint: .bottomTrailing
                            ),
                            style: StrokeStyle(lineWidth: 6, lineCap: .round)
                        )
                        .frame(width: 90, height: 90)
                        .rotationEffect(.degrees(-90))

                    // Middle ring: Streak progress (X/30)
                    Circle()
                        .trim(from: 0, to: min(CGFloat(workoutManager.currentStreak) / 30.0, 1.0) * ringAnimationProgress)
                        .stroke(
                            LinearGradient(
                                colors: [Color.orange, Color.yellow],
                                startPoint: .topLeading,
                                endPoint: .bottomTrailing
                            ),
                            style: StrokeStyle(lineWidth: 6, lineCap: .round)
                        )
                        .frame(width: 74, height: 74)
                        .rotationEffect(.degrees(-90))

                    // Inner ring: Today's activity (calories > 0 means workout done today)
                    Circle()
                        .trim(from: 0, to: (workoutManager.todayCalories > 0 ? 1.0 : 0.0) * ringAnimationProgress)
                        .stroke(
                            LinearGradient(
                                colors: [Color.red, Color.pink],
                                startPoint: .topLeading,
                                endPoint: .bottomTrailing
                            ),
                            style: StrokeStyle(lineWidth: 6, lineCap: .round)
                        )
                        .frame(width: 58, height: 58)
                        .rotationEffect(.degrees(-90))

                    // Center text
                    VStack(spacing: 0) {
                        if workoutManager.isLoading {
                            ProgressView()
                                .tint(Color(hex: "f6eddd"))
                        } else {
                            Text("\u{1F525}")
                                .font(.system(size: 16))
                            Text("\(workoutManager.currentStreak)")
                                .font(.system(size: 22, weight: .bold, design: .rounded))
                                .foregroundColor(Color(hex: "f6eddd"))
                        }
                    }
                }
                .padding(.top, 4)
                .onTapGesture {
                    WKInterfaceDevice.current().play(.click)
                    showStreakDetail = true
                }
                .onAppear {
                    withAnimation(.easeOut(duration: 1.0)) {
                        ringAnimationProgress = 1.0
                    }
                }
                .sheet(isPresented: $showStreakDetail) {
                    StreakDetailView(workoutManager: workoutManager)
                }

                // Ring legend
                HStack(spacing: 10) {
                    ringLegendItem(color: .green, label: "\(workoutManager.weeklyWorkouts)/7", caption: "week")
                    ringLegendItem(color: .orange, label: "\(workoutManager.currentStreak)", caption: "streak")
                    ringLegendItem(color: .red, label: workoutManager.todayCalories > 0 ? "\u{2713}" : "-", caption: "today")
                }
                .padding(.vertical, 2)

                // Stats row
                HStack(spacing: 16) {
                    // Calories
                    VStack(spacing: 2) {
                        HStack(spacing: 3) {
                            Image(systemName: "flame.fill")
                                .font(.system(size: 11))
                                .foregroundColor(.orange)
                            Text("\(workoutManager.todayCalories)")
                                .font(.system(size: 16, weight: .bold, design: .rounded))
                                .foregroundColor(Color(hex: "f6eddd"))
                        }
                        Text("cal today")
                            .font(.system(size: 9))
                            .foregroundColor(Color(hex: "f6eddd").opacity(0.4))
                    }

                    // Divider
                    Rectangle()
                        .fill(Color(hex: "f6eddd").opacity(0.15))
                        .frame(width: 1, height: 24)

                    // Weekly workouts
                    VStack(spacing: 2) {
                        HStack(spacing: 3) {
                            Image(systemName: "calendar")
                                .font(.system(size: 11))
                                .foregroundColor(.green)
                            Text("\(workoutManager.weeklyWorkouts)")
                                .font(.system(size: 16, weight: .bold, design: .rounded))
                                .foregroundColor(Color(hex: "f6eddd"))
                        }
                        Text("this week")
                            .font(.system(size: 9))
                            .foregroundColor(Color(hex: "f6eddd").opacity(0.4))
                    }
                }
                .padding(.vertical, 4)

                // Weekly trends bar
                if workoutManager.weeklyWorkouts > 0 {
                    VStack(spacing: 4) {
                        HStack {
                            Text("This week")
                                .font(.system(size: 10))
                                .foregroundColor(Color(hex: "f6eddd").opacity(0.5))
                            Spacer()
                            Text("\(workoutManager.weeklyWorkouts) workouts")
                                .font(.system(size: 10, weight: .semibold))
                                .foregroundColor(Color(hex: "f6eddd"))
                        }

                        GeometryReader { geo in
                            ZStack(alignment: .leading) {
                                Rectangle()
                                    .fill(Color(hex: "f6eddd").opacity(0.1))
                                    .frame(height: 4)
                                    .cornerRadius(2)
                                Rectangle()
                                    .fill(Color.green)
                                    .frame(width: geo.size.width * CGFloat(min(workoutManager.weeklyWorkouts, 7)) / 7.0, height: 4)
                                    .cornerRadius(2)
                            }
                        }
                        .frame(height: 4)
                    }
                    .padding(.horizontal, 16)
                }

                // Refresh button
                Button(action: refreshStats) {
                    HStack(spacing: 6) {
                        if isRefreshing {
                            ProgressView()
                                .tint(Color(hex: "f6eddd"))
                                .scaleEffect(0.7)
                        } else {
                            Image(systemName: "arrow.clockwise")
                                .font(.system(size: 12))
                        }
                        Text("Refresh")
                            .font(.system(size: 12, weight: .medium))
                    }
                    .foregroundColor(Color(hex: "f6eddd").opacity(0.6))
                    .frame(maxWidth: .infinity)
                    .padding(.vertical, 8)
                    .background(Color(hex: "f6eddd").opacity(0.08))
                    .cornerRadius(10)
                }
                .buttonStyle(.plain)
                .disabled(isRefreshing)

                // Achievements button
                Button(action: { showAchievements = true }) {
                    HStack {
                        Text("\u{1F3C6}")
                        Text("\(unlockedCount) badges")
                            .font(.caption2)
                            .foregroundColor(Color(hex: "f6eddd").opacity(0.6))
                    }
                    .frame(maxWidth: .infinity)
                    .padding(.vertical, 6)
                    .background(Color(hex: "f6eddd").opacity(0.08))
                    .cornerRadius(10)
                }
                .buttonStyle(.plain)
                .sheet(isPresented: $showAchievements) {
                    AchievementsView().environmentObject(workoutManager)
                }

                // Last synced indicator
                HStack(spacing: 4) {
                    Circle()
                        .fill(workoutManager.isPhoneReachable ? Color.green : Color.orange)
                        .frame(width: 5, height: 5)
                    Text("Synced: \(workoutManager.timeSinceLastSync)")
                        .font(.system(size: 9))
                        .foregroundColor(Color(hex: "f6eddd").opacity(0.35))
                }

                // Swipe hint
                HStack(spacing: 4) {
                    Image(systemName: "chevron.down")
                        .font(.system(size: 8))
                    Text("Swipe down for timer")
                        .font(.system(size: 9))
                }
                .foregroundColor(Color(hex: "f6eddd").opacity(0.2))
                .padding(.top, 4)
            }
            .padding(.horizontal, 8)
        }
    }

    private func ringLegendItem(color: Color, label: String, caption: String) -> some View {
        HStack(spacing: 3) {
            Circle()
                .fill(color)
                .frame(width: 5, height: 5)
            VStack(alignment: .leading, spacing: 0) {
                Text(label)
                    .font(.system(size: 10, weight: .semibold, design: .rounded))
                    .foregroundColor(Color(hex: "f6eddd"))
                Text(caption)
                    .font(.system(size: 7))
                    .foregroundColor(Color(hex: "f6eddd").opacity(0.4))
            }
        }
    }

    private func refreshStats() {
        isRefreshing = true
        WKInterfaceDevice.current().play(.click)
        workoutManager.fetchStats()
        ringAnimationProgress = 0

        // Re-animate rings after refresh
        DispatchQueue.main.asyncAfter(deadline: .now() + 0.5) {
            withAnimation(.easeOut(duration: 1.0)) {
                ringAnimationProgress = 1.0
            }
        }

        // Auto-reset refreshing state after a delay
        DispatchQueue.main.asyncAfter(deadline: .now() + 2) {
            isRefreshing = false
        }
    }
}

// MARK: - Streak Detail View (shown on ring tap)

struct StreakDetailView: View {
    @ObservedObject var workoutManager: WorkoutManager

    var body: some View {
        ScrollView {
            VStack(spacing: 12) {
                Text("\u{1F525} Streak History")
                    .font(.system(size: 16, weight: .bold))
                    .foregroundColor(Color(hex: "f6eddd"))

                // Current streak card
                VStack(spacing: 4) {
                    Text("\(workoutManager.currentStreak)")
                        .font(.system(size: 44, weight: .bold, design: .rounded))
                        .foregroundColor(Color(hex: "f6eddd"))
                    Text("current streak")
                        .font(.system(size: 11))
                        .foregroundColor(Color(hex: "f6eddd").opacity(0.5))
                }
                .frame(maxWidth: .infinity)
                .padding(.vertical, 12)
                .background(Color.orange.opacity(0.12))
                .cornerRadius(12)

                // Week overview (7-day dots)
                VStack(spacing: 6) {
                    Text("This Week")
                        .font(.system(size: 11, weight: .semibold))
                        .foregroundColor(Color(hex: "f6eddd").opacity(0.6))

                    HStack(spacing: 6) {
                        ForEach(0..<7, id: \.self) { day in
                            VStack(spacing: 2) {
                                Circle()
                                    .fill(day < workoutManager.weeklyWorkouts ? Color.green : Color(hex: "f6eddd").opacity(0.15))
                                    .frame(width: 14, height: 14)
                                Text(dayLabel(day))
                                    .font(.system(size: 7))
                                    .foregroundColor(Color(hex: "f6eddd").opacity(0.4))
                            }
                        }
                    }
                }
                .padding(.vertical, 8)
                .frame(maxWidth: .infinity)
                .background(Color(hex: "f6eddd").opacity(0.05))
                .cornerRadius(10)

                // Stats summary
                HStack(spacing: 12) {
                    statCard(value: "\(workoutManager.weeklyWorkouts)/7", label: "This Week", color: .green)
                    statCard(value: "\(workoutManager.todayCalories)", label: "Cal Today", color: .orange)
                }

                // Motivational message
                Text(motivationalMessage)
                    .font(.system(size: 11))
                    .foregroundColor(Color(hex: "f6eddd").opacity(0.5))
                    .multilineTextAlignment(.center)
                    .padding(.top, 4)
            }
            .padding(.horizontal, 8)
        }
    }

    private func statCard(value: String, label: String, color: Color) -> some View {
        VStack(spacing: 2) {
            Text(value)
                .font(.system(size: 16, weight: .bold, design: .rounded))
                .foregroundColor(color)
            Text(label)
                .font(.system(size: 9))
                .foregroundColor(Color(hex: "f6eddd").opacity(0.4))
        }
        .frame(maxWidth: .infinity)
        .padding(.vertical, 8)
        .background(color.opacity(0.08))
        .cornerRadius(8)
    }

    private func dayLabel(_ index: Int) -> String {
        let labels = ["M", "T", "W", "T", "F", "S", "S"]
        return labels[index]
    }

    private var motivationalMessage: String {
        let streak = workoutManager.currentStreak
        if streak == 0 {
            return "Start your streak today!"
        } else if streak < 7 {
            return "Building momentum! Keep going."
        } else if streak < 14 {
            return "A full week! You're on fire."
        } else if streak < 30 {
            return "Incredible consistency!"
        } else {
            return "Legendary! \(streak) days strong."
        }
    }
}

// MARK: - Color Hex Extension

extension Color {
    init(hex: String) {
        let cleaned = hex.trimmingCharacters(in: CharacterSet.alphanumerics.inverted)
        guard cleaned.count == 6 else {
            self.init(.gray)
            return
        }
        let scanner = Scanner(string: cleaned)
        var rgb: UInt64 = 0
        scanner.scanHexInt64(&rgb)
        self.init(
            red: Double((rgb >> 16) & 0xFF) / 255.0,
            green: Double((rgb >> 8) & 0xFF) / 255.0,
            blue: Double(rgb & 0xFF) / 255.0
        )
    }
}
