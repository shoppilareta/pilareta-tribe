import SwiftUI
import WatchKit

struct WorkoutTimerView: View {
    @ObservedObject var workoutManager: WorkoutManager
    @State private var isActive = false
    @State private var isPaused = false
    @State private var elapsedSeconds: TimeInterval = 0
    @State private var timer: Timer? = nil
    @State private var workoutType: String = "Reformer"
    @State private var showCompletionAlert = false
    @State private var completedDuration: Int = 0

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
        if !isActive {
            preWorkoutView
        } else {
            activeWorkoutView
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
    }

    // MARK: - Active Workout View

    private var activeWorkoutView: some View {
        VStack(spacing: 6) {
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
                .font(.system(size: 48, weight: .bold, design: .monospaced))
                .foregroundColor(Color(hex: "f6eddd"))
                .minimumScaleFactor(0.7)

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
                        .frame(width: 52, height: 52)
                        .background(Color(hex: "f6eddd").opacity(0.2))
                        .foregroundColor(Color(hex: "f6eddd"))
                        .clipShape(Circle())
                }
                .buttonStyle(.plain)

                // End workout
                Button(action: endWorkout) {
                    Image(systemName: "stop.fill")
                        .font(.title3)
                        .frame(width: 52, height: 52)
                        .background(Color.red.opacity(0.3))
                        .foregroundColor(.red)
                        .clipShape(Circle())
                }
                .buttonStyle(.plain)
            }
            .padding(.bottom, 4)
        }
        .alert("Workout Complete", isPresented: $showCompletionAlert) {
            Button("OK") {}
        } message: {
            Text("\(workoutType) - \(completedDuration) min logged!")
        }
    }

    // MARK: - Timer Controls

    func startWorkout() {
        isActive = true
        isPaused = false
        elapsedSeconds = 0
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
        completedDuration = durationMinutes

        // Send workout to phone
        workoutManager.logWorkout(type: apiType(for: workoutType), duration: durationMinutes)

        // Haptic feedback
        WKInterfaceDevice.current().play(.success)

        // Show completion alert, then reset
        showCompletionAlert = true

        // Reset state
        isActive = false
        isPaused = false
        elapsedSeconds = 0
    }

    func startTimer() {
        timer = Timer.scheduledTimer(withTimeInterval: 1, repeats: true) { _ in
            elapsedSeconds += 1

            // Haptic every 5 minutes
            if Int(elapsedSeconds) % 300 == 0 && elapsedSeconds > 0 {
                WKInterfaceDevice.current().play(.notification)
            }

            // Subtle haptic every minute (for first 3 minutes, as a "warm-up" cue)
            if Int(elapsedSeconds) <= 180 && Int(elapsedSeconds) % 60 == 0 {
                WKInterfaceDevice.current().play(.directionUp)
            }
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
