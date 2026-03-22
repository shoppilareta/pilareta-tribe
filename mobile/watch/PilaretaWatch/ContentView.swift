import SwiftUI
import WatchKit

struct ContentView: View {
    @StateObject private var workoutManager = WorkoutManager()
    @State private var selectedTab = 0

    var body: some View {
        TabView(selection: $selectedTab) {
            // Tab 1: Dashboard
            DashboardView(workoutManager: workoutManager)
                .tag(0)

            // Tab 2: Workout Timer
            WorkoutTimerView(workoutManager: workoutManager)
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
        }
    }
}

// MARK: - Dashboard View

struct DashboardView: View {
    @ObservedObject var workoutManager: WorkoutManager
    @State private var isRefreshing = false

    var body: some View {
        ScrollView {
            VStack(spacing: 12) {
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

                // Streak circle
                ZStack {
                    Circle()
                        .stroke(Color(hex: "f6eddd").opacity(0.15), lineWidth: 6)
                        .frame(width: 90, height: 90)

                    // Progress arc (streak out of 30-day goal)
                    Circle()
                        .trim(from: 0, to: min(CGFloat(workoutManager.currentStreak) / 30.0, 1.0))
                        .stroke(
                            Color(hex: "f6eddd"),
                            style: StrokeStyle(lineWidth: 6, lineCap: .round)
                        )
                        .frame(width: 90, height: 90)
                        .rotationEffect(.degrees(-90))

                    VStack(spacing: 2) {
                        if workoutManager.isLoading {
                            ProgressView()
                                .tint(Color(hex: "f6eddd"))
                        } else {
                            Text("\(workoutManager.currentStreak)")
                                .font(.system(size: 36, weight: .bold, design: .rounded))
                                .foregroundColor(Color(hex: "f6eddd"))
                        }
                        Text("day streak")
                            .font(.system(size: 10))
                            .foregroundColor(Color(hex: "f6eddd").opacity(0.5))
                    }
                }
                .padding(.top, 4)

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

    private func refreshStats() {
        isRefreshing = true
        WKInterfaceDevice.current().play(.click)
        workoutManager.fetchStats()

        // Auto-reset refreshing state after a delay
        DispatchQueue.main.asyncAfter(deadline: .now() + 2) {
            isRefreshing = false
        }
    }
}

// MARK: - Color Hex Extension

extension Color {
    init(hex: String) {
        let scanner = Scanner(string: hex)
        var rgb: UInt64 = 0
        scanner.scanHexInt64(&rgb)
        self.init(
            red: Double((rgb >> 16) & 0xFF) / 255.0,
            green: Double((rgb >> 8) & 0xFF) / 255.0,
            blue: Double(rgb & 0xFF) / 255.0
        )
    }
}
