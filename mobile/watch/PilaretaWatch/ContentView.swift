import SwiftUI

struct ContentView: View {
    @StateObject private var workoutManager = WorkoutManager()

    var body: some View {
        NavigationStack {
            VStack(spacing: 16) {
                // Streak display
                VStack(spacing: 4) {
                    Text("\(workoutManager.currentStreak)")
                        .font(.system(size: 44, weight: .bold, design: .rounded))
                        .foregroundColor(Color(hex: "f6eddd"))
                    Text("day streak")
                        .font(.caption2)
                        .foregroundColor(Color(hex: "f6eddd").opacity(0.6))
                }
                .padding(.top, 8)

                // Quick log button
                NavigationLink(destination: QuickLogView(workoutManager: workoutManager)) {
                    HStack {
                        Image(systemName: "plus.circle.fill")
                        Text("Log Workout")
                    }
                    .font(.system(size: 15, weight: .semibold))
                    .foregroundColor(Color(hex: "202219"))
                    .frame(maxWidth: .infinity)
                    .padding(.vertical, 10)
                    .background(Color(hex: "f6eddd"))
                    .cornerRadius(12)
                }

                // Today's calories
                HStack {
                    Image(systemName: "flame.fill")
                        .foregroundColor(.orange)
                    Text("\(workoutManager.todayCalories) cal")
                        .font(.system(size: 13))
                        .foregroundColor(Color(hex: "f6eddd").opacity(0.7))
                }
            }
            .padding(.horizontal, 8)
            .navigationTitle("Pilareta")
            .navigationBarTitleDisplayMode(.inline)
        }
        .onAppear {
            workoutManager.fetchStats()
        }
    }
}

struct QuickLogView: View {
    @ObservedObject var workoutManager: WorkoutManager
    @Environment(\.dismiss) var dismiss
    @State private var selectedType = "reformer"
    @State private var duration = 30
    @State private var isSaving = false

    let workoutTypes = [
        ("Reformer", "reformer"),
        ("Mat", "mat"),
        ("Yoga", "yoga"),
        ("Running", "running"),
        ("Strength", "strength_training"),
    ]

    var body: some View {
        ScrollView {
            VStack(spacing: 12) {
                // Type picker
                ForEach(workoutTypes, id: \.1) { (label, value) in
                    Button(action: { selectedType = value }) {
                        Text(label)
                            .font(.system(size: 14, weight: selectedType == value ? .semibold : .regular))
                            .foregroundColor(selectedType == value ? Color(hex: "202219") : Color(hex: "f6eddd"))
                            .frame(maxWidth: .infinity)
                            .padding(.vertical, 8)
                            .background(selectedType == value ? Color(hex: "f6eddd") : Color(hex: "f6eddd").opacity(0.1))
                            .cornerRadius(8)
                    }
                    .buttonStyle(.plain)
                }

                // Duration
                Stepper("\(duration) min", value: $duration, in: 5...120, step: 5)
                    .font(.system(size: 14))
                    .foregroundColor(Color(hex: "f6eddd"))

                // Save button
                Button(action: {
                    isSaving = true
                    workoutManager.logWorkout(type: selectedType, duration: duration) {
                        isSaving = false
                        dismiss()
                    }
                }) {
                    if isSaving {
                        ProgressView()
                    } else {
                        Text("Save")
                            .font(.system(size: 15, weight: .semibold))
                    }
                }
                .foregroundColor(Color(hex: "202219"))
                .frame(maxWidth: .infinity)
                .padding(.vertical, 10)
                .background(Color(hex: "f6eddd"))
                .cornerRadius(12)
                .disabled(isSaving)
            }
            .padding(.horizontal, 4)
        }
        .navigationTitle("Log Workout")
    }
}

// Color hex extension
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
