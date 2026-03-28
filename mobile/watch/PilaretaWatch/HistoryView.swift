import SwiftUI

struct WorkoutRecord: Codable, Identifiable {
    let id: String
    let type: String
    let duration: Int
    let date: Date
    let rpe: Int
    let laps: Int
    let avgHR: Int
}

struct HistoryView: View {
    @State private var records: [WorkoutRecord] = []

    var body: some View {
        ScrollView {
            if records.isEmpty {
                VStack(spacing: 8) {
                    Text("No workouts yet")
                        .font(.caption)
                        .foregroundColor(Color(hex: "f6eddd").opacity(0.5))
                }
                .padding(.top, 40)
            } else {
                VStack(spacing: 8) {
                    Text("Recent")
                        .font(.headline)
                        .foregroundColor(Color(hex: "f6eddd"))

                    ForEach(records) { record in
                        HStack {
                            VStack(alignment: .leading, spacing: 2) {
                                Text(record.type.capitalized)
                                    .font(.caption)
                                    .fontWeight(.semibold)
                                    .foregroundColor(Color(hex: "f6eddd"))
                                Text(formatDate(record.date))
                                    .font(.system(size: 10))
                                    .foregroundColor(Color(hex: "f6eddd").opacity(0.5))
                            }
                            Spacer()
                            VStack(alignment: .trailing, spacing: 2) {
                                Text("\(record.duration) min")
                                    .font(.caption)
                                    .fontWeight(.bold)
                                    .foregroundColor(Color(hex: "f6eddd"))
                                if record.laps > 0 {
                                    Text("\(record.laps) laps")
                                        .font(.system(size: 9))
                                        .foregroundColor(Color(hex: "f6eddd").opacity(0.4))
                                }
                            }
                        }
                        .padding(.vertical, 6)
                        .padding(.horizontal, 4)
                    }
                }
                .padding(.horizontal, 8)
            }
        }
        .onAppear { loadRecords() }
    }

    func loadRecords() {
        guard let data = UserDefaults.standard.data(forKey: "workout_history") else {
            records = []
            return
        }
        do {
            records = try JSONDecoder().decode([WorkoutRecord].self, from: data)
        } catch {
            print("[History] Corrupted data, clearing: \(error.localizedDescription)")
            UserDefaults.standard.removeObject(forKey: "workout_history")
            records = []
        }
    }

    func formatDate(_ date: Date) -> String {
        let formatter = RelativeDateTimeFormatter()
        formatter.unitsStyle = .abbreviated
        return formatter.localizedString(for: date, relativeTo: Date())
    }

    // MARK: - Static Save Method

    static func saveWorkout(type: String, duration: Int, rpe: Int, laps: Int, avgHR: Int) {
        var records: [WorkoutRecord] = []
        if let data = UserDefaults.standard.data(forKey: "workout_history"),
           let decoded = try? JSONDecoder().decode([WorkoutRecord].self, from: data) {
            records = decoded
        }

        let record = WorkoutRecord(
            id: UUID().uuidString,
            type: type,
            duration: duration,
            date: Date(),
            rpe: rpe,
            laps: laps,
            avgHR: avgHR
        )

        records.insert(record, at: 0)
        if records.count > 5 { records = Array(records.prefix(5)) }

        if let encoded = try? JSONEncoder().encode(records) {
            UserDefaults.standard.set(encoded, forKey: "workout_history")
        }
    }
}
