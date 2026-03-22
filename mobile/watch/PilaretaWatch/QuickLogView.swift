import SwiftUI
import WatchKit

struct QuickLogView: View {
    @ObservedObject var workoutManager: WorkoutManager
    @Environment(\.dismiss) var dismiss
    @State private var selectedType = "reformer"
    @State private var duration = 30
    @State private var isSaving = false
    @State private var showSuccess = false

    let workoutTypes: [(label: String, value: String, icon: String)] = [
        ("Reformer", "reformer", "figure.pilates"),
        ("Mat", "mat", "figure.mind.and.body"),
        ("Tower", "tower", "figure.strengthtraining.functional"),
        ("Yoga", "yoga", "figure.yoga"),
        ("Running", "running", "figure.run"),
        ("Strength", "strength_training", "figure.strengthtraining.traditional"),
    ]

    var body: some View {
        ScrollView {
            VStack(spacing: 10) {
                // Connection status
                if workoutManager.isOffline {
                    HStack(spacing: 4) {
                        Image(systemName: "iphone.slash")
                            .font(.system(size: 10))
                        Text("iPhone not connected")
                            .font(.system(size: 10))
                    }
                    .foregroundColor(.orange)
                    .padding(.vertical, 4)
                    .padding(.horizontal, 8)
                    .background(Color.orange.opacity(0.1))
                    .cornerRadius(6)
                }

                // Type picker
                ForEach(workoutTypes, id: \.value) { type in
                    Button(action: {
                        WKInterfaceDevice.current().play(.click)
                        selectedType = type.value
                    }) {
                        HStack(spacing: 8) {
                            Image(systemName: type.icon)
                                .font(.system(size: 14))
                                .frame(width: 20)
                            Text(type.label)
                                .font(.system(size: 14, weight: selectedType == type.value ? .semibold : .regular))
                            Spacer()
                            if selectedType == type.value {
                                Image(systemName: "checkmark")
                                    .font(.system(size: 12, weight: .bold))
                            }
                        }
                        .foregroundColor(
                            selectedType == type.value
                                ? Color(hex: "202219")
                                : Color(hex: "f6eddd")
                        )
                        .frame(maxWidth: .infinity)
                        .padding(.vertical, 8)
                        .padding(.horizontal, 10)
                        .background(
                            selectedType == type.value
                                ? Color(hex: "f6eddd")
                                : Color(hex: "f6eddd").opacity(0.08)
                        )
                        .cornerRadius(8)
                    }
                    .buttonStyle(.plain)
                }

                // Duration stepper
                VStack(spacing: 4) {
                    Text("Duration")
                        .font(.system(size: 11))
                        .foregroundColor(Color(hex: "f6eddd").opacity(0.5))

                    HStack {
                        Button(action: {
                            if duration > 5 {
                                duration -= 5
                                WKInterfaceDevice.current().play(.click)
                            }
                        }) {
                            Image(systemName: "minus.circle.fill")
                                .font(.title3)
                                .foregroundColor(Color(hex: "f6eddd").opacity(0.6))
                        }
                        .buttonStyle(.plain)

                        Text("\(duration) min")
                            .font(.system(size: 20, weight: .semibold, design: .rounded))
                            .foregroundColor(Color(hex: "f6eddd"))
                            .frame(minWidth: 60)

                        Button(action: {
                            if duration < 180 {
                                duration += 5
                                WKInterfaceDevice.current().play(.click)
                            }
                        }) {
                            Image(systemName: "plus.circle.fill")
                                .font(.title3)
                                .foregroundColor(Color(hex: "f6eddd").opacity(0.6))
                        }
                        .buttonStyle(.plain)
                    }
                }
                .padding(.vertical, 6)

                // Save button
                Button(action: saveWorkout) {
                    if isSaving {
                        ProgressView()
                            .tint(Color(hex: "202219"))
                    } else {
                        HStack(spacing: 6) {
                            Image(systemName: "checkmark.circle.fill")
                            Text("Log Workout")
                        }
                        .font(.system(size: 15, weight: .semibold))
                    }
                }
                .foregroundColor(Color(hex: "202219"))
                .frame(maxWidth: .infinity)
                .padding(.vertical, 10)
                .background(Color(hex: "f6eddd"))
                .cornerRadius(12)
                .disabled(isSaving)

                // Sync status
                if !workoutManager.lastSyncStatus.isEmpty {
                    Text(workoutManager.lastSyncStatus)
                        .font(.system(size: 10))
                        .foregroundColor(Color(hex: "f6eddd").opacity(0.4))
                }
            }
            .padding(.horizontal, 4)
        }
        .navigationTitle("Log Workout")
        .alert("Workout Logged!", isPresented: $showSuccess) {
            Button("OK") { dismiss() }
        } message: {
            Text("\(labelForType(selectedType)) - \(duration) min")
        }
    }

    private func saveWorkout() {
        isSaving = true
        WKInterfaceDevice.current().play(.click)

        workoutManager.logWorkout(type: selectedType, duration: duration) {
            isSaving = false
            showSuccess = true
        }
    }

    private func labelForType(_ value: String) -> String {
        workoutTypes.first(where: { $0.value == value })?.label ?? value.capitalized
    }
}
